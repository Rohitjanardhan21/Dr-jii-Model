from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, MedicalReport, Patient, Task
from schemas import ReportResponse, ChatQuery, MedicalQuery, MedicalInfoResponse, TaskCreate, TaskResponse, DuplicateUploadConfirm
from services.query_understanding_service import QueryUnderstandingService
from services.medical_info_service import MedicalInfoService
from utils.pdf_processor import PDFProcessor
import logging
import os
import re
import hashlib
from datetime import datetime

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])
logger = logging.getLogger(__name__)

# Initialize services
query_understanding_service = QueryUnderstandingService()
medical_info_service = MedicalInfoService()


@router.post("/chat/query")
async def handle_chat_query(
    query: ChatQuery,
    db: Session = Depends(get_db)
):
    """
    Handle natural language chat queries using OpenAI
    """
    query_text = query.query
    mode = query.mode or "medical_report"  # Default to medical_report
    
    # Handle task filter selection (when user selects from MCQ options)
    if query_text.lower() in ["1", "1️⃣", "completed tasks", "completed task's", "completed"]:
        tasks = db.query(Task).filter(Task.status == "completed").order_by(Task.completed_at.desc()).all()
        
        if not tasks:
            return {
                "response": "**No completed tasks found.**\n\n",
                "requires_upload": False,
                "tasks": [],
                "action": "show_task_cards"
            }
        
        # Return tasks in structured format for frontend to display as cards
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description or "No description",
                "status": task.status,
                "priority": task.priority,
                "task_type": task.task_type or "N/A",
                "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                "created_at": task.created_at.strftime('%Y-%m-%d') if task.created_at else None,
                "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
            })
        
        response_text = f"**Completed Tasks ({len(tasks)}):**\n\nClick on any task card below to view full details.\n\n"
        return {
            "response": response_text,
            "requires_upload": False,
            "tasks": tasks_data,
            "action": "show_task_cards"
        }
    
    if query_text.lower() in ["2", "2️⃣", "pending tasks", "pending task's", "pending"]:
        tasks = db.query(Task).filter(Task.status == "pending").order_by(Task.due_date.asc(), Task.created_at.desc()).all()
        
        if not tasks:
            return {
                "response": "**No pending tasks found.**\n\n",
                "requires_upload": False,
                "tasks": [],
                "action": "show_task_cards"
            }
        
        # Return tasks in structured format for frontend to display as cards
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description or "No description",
                "status": task.status,
                "priority": task.priority,
                "task_type": task.task_type or "N/A",
                "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                "created_at": task.created_at.strftime('%Y-%m-%d') if task.created_at else None,
                "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
            })
        
        response_text = f"**Pending Tasks ({len(tasks)}):**\n\nClick on any task card below to view full details.\n\n"
        return {
            "response": response_text,
            "requires_upload": False,
            "tasks": tasks_data,
            "action": "show_task_cards"
        }
    
    if query_text.lower() in ["3", "3️⃣", "all tasks", "all task's", "all"]:
        tasks = db.query(Task).order_by(Task.created_at.desc()).all()
        
        if not tasks:
            return {
                "response": "**No tasks found.**\n\n",
                "requires_upload": False,
                "tasks": [],
                "action": "show_task_cards"
            }
        
        # Return tasks in structured format for frontend to display as cards
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description or "No description",
                "status": task.status,
                "priority": task.priority or "medium",
                "task_type": task.task_type or "N/A",
                "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                "created_at": task.created_at.strftime('%Y-%m-%d') if task.created_at else None,
                "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
            })
        
        response_text = f"**All Tasks ({len(tasks)}):**\n\nClick on any task card below to view full details.\n\n"
        return {
            "response": response_text,
            "requires_upload": False,
            "tasks": tasks_data,
            "action": "show_task_cards"
        }
    
    try:
        # Route based on mode
        if mode == "medical_knowledge":
            # Use medical info service for general medical knowledge
            medical_info = await medical_info_service.get_medical_information(query_text)
            
            response_text = f"{medical_info.get('answer', 'I couldn\'t find specific information about that.')}\n\n"
            
            if medical_info.get('confidence'):
                confidence_percent = (medical_info.get('confidence', 0) * 100)
                response_text += f"*Confidence: {confidence_percent:.0f}%*\n\n"
            
            if medical_info.get('related_topics'):
                response_text += "**Related Topics:**\n"
                for topic in medical_info.get('related_topics', []):
                    response_text += f"• {topic}\n"
            
            return {
                "response": response_text,
                "requires_upload": False
            }
        
        # Medical Report Mode - handle patient reports, summaries, prescriptions
        # CRITICAL: Check for "all people/patients" BEFORE understanding query
        query_lower = query_text.lower()
        if any(phrase in query_lower for phrase in ['all people', 'all patients', 'everyone', 'everybody', 'of all people', 'of all patients']):
            if 'report' in query_lower or 'medical' in query_lower:
                logger.info(f"FORCING list_reports intent for 'all people/patients' query")
                intent = "list_reports"
                patient_name = None
            else:
                understanding = await query_understanding_service.understand_query(query_text, mode=mode)
                intent = understanding.get("intent", "unknown")
                patient_name = understanding.get("patient_name")
        else:
            # Understand the query using OpenAI
            understanding = await query_understanding_service.understand_query(query_text, mode=mode)
            intent = understanding.get("intent", "unknown")
            patient_name = understanding.get("patient_name")
        
        logger.info(f"Query intent: {intent}, patient_name: {patient_name}, mode: {mode}")
        
        # Handle report summarization requests
        if "summar" in query_text.lower() or "summary" in query_text.lower():
            if patient_name:
                # Get patient reports and summarize
                patients = db.query(User).filter(
                    (User.full_name.ilike(f"%{patient_name}%")) | 
                    (User.username.ilike(f"%{patient_name}%"))
                ).all()
                
                if patients:
                    patient = patients[0]
                    reports = db.query(MedicalReport).filter(
                        MedicalReport.patient_id == patient.id
                    ).order_by(MedicalReport.report_date.desc()).limit(1).all()
                    
                    if reports:
                        report = reports[0]
                        summary = report.ai_summary or "No summary available for this report."
                        response_text = f"**Summary for {patient.full_name or patient.username}'s Latest Report:**\n\n{summary}"
                        return {
                            "response": response_text,
                            "requires_upload": False
                        }
        
        # Handle prescription suggestions
        if "prescription" in query_text.lower() or "prescribe" in query_text.lower() or "medication" in query_text.lower():
            if patient_name:
                patients = db.query(User).filter(
                    (User.full_name.ilike(f"%{patient_name}%")) | 
                    (User.username.ilike(f"%{patient_name}%"))
                ).all()
                
                if patients:
                    patient = patients[0]
                    reports = db.query(MedicalReport).filter(
                        MedicalReport.patient_id == patient.id
                    ).order_by(MedicalReport.report_date.desc()).limit(1).all()
                    
                    if reports:
                        report = reports[0]
                        # Use OpenAI to suggest prescriptions based on report
                        prescription_prompt = f"Based on this medical report summary: {report.ai_summary or 'No summary available'}, suggest appropriate medications and treatment plan. Be concise and professional."
                        prescription_info = await medical_info_service.get_medical_information(prescription_prompt)
                        
                        response_text = f"**Prescription Suggestions for {patient.full_name or patient.username}:**\n\n"
                        response_text += prescription_info.get('answer', 'Unable to generate prescription suggestions at this time.')
                        return {
                            "response": response_text,
                            "requires_upload": False
                        }
        
        # Handle different intents
        if intent == "get_patient_report":
            if not patient_name:
                return {
                    "response": "I couldn't identify a patient name in your query. Please specify the patient name, for example: 'What is the medical report of John Doe?'",
                    "requires_upload": False
                }
            
            # Extract title from query if present (Mr., Mrs., Dr., etc.)
            title = None
            title_patterns = [r'\b(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+', r'\b(Mr|Mrs|Ms|Dr|Miss|Master)\s+']
            for pattern in title_patterns:
                match = re.search(pattern, query_text, re.IGNORECASE)
                if match:
                    title = match.group(1)
                    if not title.endswith('.'):
                        title += '.'
                    break
            
            # Build search query with title if present
            search_name = patient_name
            if title:
                search_name = f"{title} {patient_name}"
            
            # Search strategy: Try WITH title first, then WITHOUT title only if no results
            all_matching_patients = []
            all_reports = []
            searched_with_title = False
            
            # STEP 1: Search WITH title first (if title is present)
            if title:
                searched_with_title = True
                logger.info(f"Searching WITH title: {search_name}")
                
                # 1a. Search for exact match with title
                exact_patients = db.query(User).filter(
                    User.full_name.ilike(f"%{search_name}%")
                ).all()
                all_matching_patients.extend(exact_patients)
                
                # 1b. Search for partial match (first name only with title)
                name_parts = patient_name.split()
                if len(name_parts) > 1:
                    first_name_only = f"{title} {name_parts[0]}"
                    partial_patients = db.query(User).filter(
                        User.full_name.ilike(f"%{first_name_only}%")
                    ).all()
                    # Add only if not already in list
                    for p in partial_patients:
                        if p not in all_matching_patients:
                            all_matching_patients.append(p)
                
                # 1c. Search in report extracted_text with title
                reports_with_text = db.query(MedicalReport).filter(
                    MedicalReport.extracted_text != ""
                ).all()
                
                for report in reports_with_text:
                    if report.extracted_text:
                        extracted_name = _extract_patient_name_from_text(report.extracted_text)
                        if extracted_name:
                            # Check if extracted name matches search WITH title
                            if search_name.lower() in extracted_name.lower() or f"{title} {patient_name}".lower() in extracted_name.lower():
                                # Find patient
                                existing_patient = db.query(User).filter(
                                    User.full_name.ilike(f"%{extracted_name}%")
                                ).first()
                                
                                if existing_patient and existing_patient not in all_matching_patients:
                                    all_matching_patients.append(existing_patient)
            
            # STEP 2: If no results found WITH title, search WITHOUT title as exception/fallback
            if searched_with_title and not all_matching_patients:
                logger.info(f"No results WITH title, searching WITHOUT title: {patient_name}")
                
                # 2a. Search without title in User table
                fallback_patients = db.query(User).filter(
                    (User.full_name.ilike(f"%{patient_name}%")) | 
                    (User.username.ilike(f"%{patient_name}%"))
                ).all()
                all_matching_patients.extend(fallback_patients)
                
                # 2b. Search in report extracted_text without title
                reports_with_text = db.query(MedicalReport).filter(
                    MedicalReport.extracted_text != ""
                ).all()
                
                for report in reports_with_text:
                    if report.extracted_text:
                        extracted_name = _extract_patient_name_from_text(report.extracted_text)
                        if extracted_name:
                            # Check if extracted name matches search WITHOUT title
                            if patient_name.lower() in extracted_name.lower():
                                # Find patient
                                existing_patient = db.query(User).filter(
                                    User.full_name.ilike(f"%{extracted_name}%")
                                ).first()
                                
                                if existing_patient and existing_patient not in all_matching_patients:
                                    all_matching_patients.append(existing_patient)
            
            # STEP 3: If no title was provided, search normally without title
            elif not title:
                logger.info(f"No title provided, searching WITHOUT title: {patient_name}")
                
                # Search without title
                fallback_patients = db.query(User).filter(
                    (User.full_name.ilike(f"%{patient_name}%")) | 
                    (User.username.ilike(f"%{patient_name}%"))
                ).all()
                all_matching_patients.extend(fallback_patients)
                
                # Search in report extracted_text
                reports_with_text = db.query(MedicalReport).filter(
                    MedicalReport.extracted_text != ""
                ).all()
                
                for report in reports_with_text:
                    if report.extracted_text:
                        extracted_name = _extract_patient_name_from_text(report.extracted_text)
                        if extracted_name:
                            if patient_name.lower() in extracted_name.lower():
                                existing_patient = db.query(User).filter(
                                    User.full_name.ilike(f"%{extracted_name}%")
                                ).first()
                                
                                if existing_patient and existing_patient not in all_matching_patients:
                                    all_matching_patients.append(existing_patient)
            
            if not all_matching_patients:
                return {
                    "response": f"I couldn't find a patient named **{search_name if title else patient_name}** in the database.",
                    "requires_upload": True,
                    "patient_name": search_name if title else patient_name,
                    "patient_id": None
                }
            
            # Get reports for all matching patients
            patient_ids = [p.id for p in all_matching_patients]
            all_reports = db.query(MedicalReport).filter(
                MedicalReport.patient_id.in_(patient_ids)
            ).order_by(MedicalReport.report_date.desc()).all()
            
            if not all_reports:
                patient_list = ", ".join([p.full_name or p.username for p in all_matching_patients[:3]])
                if len(all_matching_patients) > 3:
                    patient_list += f" and {len(all_matching_patients) - 3} more"
                return {
                    "response": f"I found patient(s): **{patient_list}**, but they don't have any medical reports in the database yet.",
                    "requires_upload": True,
                    "patient_name": all_matching_patients[0].full_name or all_matching_patients[0].username,
                    "patient_id": all_matching_patients[0].id
                }
            
            # Return reports in structured format for frontend to display as cards
            reports_data = []
            for report in all_reports:
                patient = next((p for p in all_matching_patients if p.id == report.patient_id), None)
                patient_name = patient.full_name or patient.username if patient else "Unknown"
                
                reports_data.append({
                    "id": report.id,
                    "report_name": report.report_name or "Unnamed Report",
                    "patient_name": patient_name,
                    "patient_id": report.patient_id,
                    "report_type": report.report_type or "N/A",
                    "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A',
                    "extracted_text": report.extracted_text[:500] if report.extracted_text else "",
                    "file_path": report.file_path
                })
            
            # Format response text
            patient_list = ", ".join([p.full_name or p.username for p in all_matching_patients[:3]])
            if len(all_matching_patients) > 3:
                patient_list += f" and {len(all_matching_patients) - 3} more"
            
            response_text = f"**Found {len(all_matching_patients)} matching patient(s) with {len(all_reports)} report(s):**\n\n"
            response_text += f"**Patient(s):** {patient_list}\n\n"
            response_text += "Click on any report card below to view full details.\n\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "patient_name": all_matching_patients[0].full_name or all_matching_patients[0].username,
                "patient_id": all_matching_patients[0].id,
                "reports_count": len(all_reports),
                "patients": [{"id": p.id, "name": p.full_name or p.username} for p in all_matching_patients],
                "reports": reports_data,
                "action": "show_report_cards",
                "last_patient_id": all_matching_patients[0].id,  # Store for context
                "last_patient_name": all_matching_patients[0].full_name or all_matching_patients[0].username
            }
        
        elif intent == "analyze_medical_report":
            # Handle medical analysis request
            # First, try to get patient from query if mentioned
            analysis_patient_id = None
            analysis_patient_name = None
            
            if patient_name:
                # Search for patient by name
                patients = db.query(User).filter(
                    (User.full_name.ilike(f"%{patient_name}%")) | 
                    (User.username.ilike(f"%{patient_name}%"))
                ).all()
                
                if patients:
                    analysis_patient_id = patients[0].id
                    analysis_patient_name = patients[0].full_name or patients[0].username
            elif query.last_patient_id:
                # Use the last patient context from previous query
                patient = db.query(User).filter(User.id == query.last_patient_id).first()
                if patient:
                    analysis_patient_id = patient.id
                    analysis_patient_name = query.last_patient_name or patient.full_name or patient.username
            else:
                # Fallback: get the most recent patient with reports
                recent_report = db.query(MedicalReport).order_by(MedicalReport.report_date.desc()).first()
                if recent_report and recent_report.patient_id:
                    patient = db.query(User).filter(User.id == recent_report.patient_id).first()
                    if patient:
                        analysis_patient_id = patient.id
                        analysis_patient_name = patient.full_name or patient.username
            
            if not analysis_patient_id:
                return {
                    "response": "I couldn't identify which patient's medical report you want me to analyze. Please specify the patient name, for example: 'Please provide me a medical analysis of Mr. Rahul' or ask for a patient's report first.",
                    "requires_upload": False
                }
            
            # Get the latest medical report for this patient
            reports = db.query(MedicalReport).filter(
                MedicalReport.patient_id == analysis_patient_id
            ).order_by(MedicalReport.report_date.desc()).limit(1).all()
            
            if not reports:
                return {
                    "response": f"I couldn't find any medical reports for **{analysis_patient_name}**. Please upload a medical report first.",
                    "requires_upload": True,
                    "patient_name": analysis_patient_name,
                    "patient_id": analysis_patient_id
                }
            
            report = reports[0]
            
            # Prepare the medical report content for analysis
            report_content = ""
            if report.extracted_text:
                report_content = report.extracted_text
            elif report.ai_summary:
                report_content = report.ai_summary
            else:
                return {
                    "response": f"I found a medical report for **{analysis_patient_name}**, but it doesn't have extractable content for analysis. Please ensure the report has been properly processed.",
                    "requires_upload": False
                }
            
            # Use OpenAI to analyze the medical report
            try:
                # Create a dedicated analysis using OpenAI directly with better prompt
                if not medical_info_service.client:
                    return {
                        "response": f"**📊 Medical Analysis for {analysis_patient_name}**\n\n❌ OpenAI API key is not configured. Please configure the OpenAI API key to generate medical analysis.",
                        "requires_upload": False,
                        "patient_name": analysis_patient_name,
                        "patient_id": analysis_patient_id
                    }
                
                system_prompt = """You are a medical expert analyzing patient medical reports. Your role is to provide logical, clinical analysis based on medical report data.

CRITICAL RULES:
1. NEVER repeat, quote, or display the raw report content in your response
2. ONLY provide analysis, interpretation, and clinical reasoning
3. Focus on what the findings MEAN, not what the raw values are
4. Be specific about issues and their root causes
5. Use professional medical terminology appropriately

Structure your response with these sections:
1. **Identified Health Issues** - What health problems can be identified?
2. **Root Causes and Etiology** - What are the likely causes? (directly or indirectly mentioned)
3. **Clinical Significance** - What do these findings mean for the patient?
4. **Recommendations** - What follow-up actions are needed?
5. **Summary** - Overall assessment

Remember: Analyze the data, interpret it, but DO NOT repeat the raw report content."""

                user_prompt = f"""Analyze this medical report and provide clinical analysis:

Patient: {analysis_patient_name}
Report Type: {report.report_type or 'N/A'}
Date: {report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A'}

Report Data:
{report_content}

Provide your analysis focusing on issues, causes, and recommendations. Do NOT include the raw report content in your response."""

                import asyncio
                loop = asyncio.get_event_loop()
                openai_response = await loop.run_in_executor(
                    None,
                    lambda: medical_info_service.client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.3,  # Lower temperature for more focused analysis
                        max_tokens=1500
                    )
                )
                
                analysis_text = openai_response.choices[0].message.content.strip()
                
                # Clean up the analysis text - remove any accidental report content
                # Check if the analysis contains the report content and remove it
                if "Medical Report Content:" in analysis_text:
                    analysis_text = analysis_text.split("Medical Report Content:")[0].strip()
                if "Report Data:" in analysis_text:
                    analysis_text = analysis_text.split("Report Data:")[0].strip()
                
                response_text = f"**📊 Medical Analysis for {analysis_patient_name}**\n\n"
                response_text += f"**Report Type:** {report.report_type or 'N/A'} | **Date:** {report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A'}\n\n"
                response_text += f"---\n\n"
                response_text += f"{analysis_text}\n\n"
                response_text += f"---\n\n"
                response_text += f"Click on any report card below to view full details.\n\n"
                
                # Prepare report card data
                reports_data = [{
                    "id": report.id,
                    "report_name": report.report_name or "Unnamed Report",
                    "patient_name": analysis_patient_name,
                    "patient_id": analysis_patient_id,
                    "report_type": report.report_type or "N/A",
                    "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A',
                    "extracted_text": report.extracted_text[:500] if report.extracted_text else "",
                    "file_path": report.file_path
                }]
                
                return {
                    "response": response_text,
                    "requires_upload": False,
                    "patient_name": analysis_patient_name,
                    "patient_id": analysis_patient_id,
                    "reports": reports_data,
                    "action": "show_report_cards"
                }
                
            except Exception as e:
                logger.error(f"Error generating medical analysis: {e}")
                return {
                    "response": f"❌ Error generating medical analysis: {str(e)}\n\nPlease ensure OpenAI API key is configured correctly.",
                    "requires_upload": False
                }
        
        elif intent == "count_reports":
            count = db.query(MedicalReport).count()
            return {
                "response": f"We have **{count}** medical report{'s' if count != 1 else ''} in the database.",
                "requires_upload": False,
                "count": count
            }
        
        elif intent == "count_patients":
            count = db.query(User).filter(User.role == "PATIENT").count()
            return {
                "response": f"We have **{count}** patient{'s' if count != 1 else ''} registered in the system.",
                "requires_upload": False,
                "count": count
            }
        
        elif intent == "list_reports":
            # Get all reports and filter out invalid ones
            all_reports = db.query(MedicalReport).order_by(MedicalReport.report_date.desc()).all()
            
            # Filter valid reports (those with actual patient names, not "Unknown Patient")
            valid_reports = []
            for report in all_reports:
                patient_name = None
                if report.patient_id:
                    patient = db.query(User).filter(User.id == report.patient_id).first()
                    if patient and patient.full_name:
                        patient_name = patient.full_name
                    elif report.extracted_text:
                        extracted_name = _extract_patient_name_from_text(report.extracted_text)
                        if extracted_name:
                            patient_name = extracted_name
                elif report.extracted_text:
                    extracted_name = _extract_patient_name_from_text(report.extracted_text)
                    if extracted_name:
                        patient_name = extracted_name
                
                # Only include reports with valid patient names (not "Unknown Patient")
                if patient_name and patient_name.lower() != "unknown patient" and len(patient_name.strip()) > 0:
                    valid_reports.append((report, patient_name))
            
            if not valid_reports:
                return {
                    "response": "**No valid medical reports found in the database.**\n\nPlease upload some medical reports with patient information.",
                    "requires_upload": False,
                    "reports": []
                }
            
            # Return reports in structured format for frontend to display as cards
            reports_data = []
            for report, patient_name in valid_reports:
                reports_data.append({
                    "id": report.id,
                    "report_name": report.report_name or "Unnamed Report",
                    "patient_name": patient_name,
                    "patient_id": report.patient_id,
                    "report_type": report.report_type or "N/A",
                    "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A',
                    "extracted_text": report.extracted_text[:500] if report.extracted_text else "",
                    "file_path": report.file_path
                })
            
            response_text = f"**All Medical Reports ({len(reports_data)}):**\n\nClick on any report card below to view details.\n\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "reports_count": len(reports_data),
                "reports": reports_data,
                "action": "show_report_cards"
            }
        
        elif intent == "cleanup_reports":
            # Cleanup invalid reports (Unknown Patient, no patient_id, etc.)
            try:
                reports_to_delete = []
                all_reports = db.query(MedicalReport).all()
                
                for report in all_reports:
                    should_delete = False
                    
                    # Check if report has no patient_id
                    if not report.patient_id:
                        should_delete = True
                    elif report.patient_id:
                        patient = db.query(User).filter(User.id == report.patient_id).first()
                        if not patient:
                            should_delete = True
                        elif not patient.full_name and not patient.username:
                            should_delete = True
                        elif report.extracted_text:
                            extracted_name = _extract_patient_name_from_text(report.extracted_text)
                            if not extracted_name and not patient.full_name:
                                should_delete = True
                    
                    # Also check if patient name would be "Unknown Patient"
                    if report.patient_id:
                        patient = db.query(User).filter(User.id == report.patient_id).first()
                        if patient:
                            if not patient.full_name:
                                if report.extracted_text:
                                    extracted_name = _extract_patient_name_from_text(report.extracted_text)
                                    if not extracted_name:
                                        should_delete = True
                                else:
                                    should_delete = True
                    
                    if should_delete:
                        reports_to_delete.append(report)
                
                deleted_count = 0
                for report in reports_to_delete:
                    # Delete file if exists
                    if report.file_path and os.path.exists(report.file_path):
                        try:
                            os.remove(report.file_path)
                        except Exception as e:
                            logger.warning(f"Could not delete file {report.file_path}: {e}")
                    
                    db.delete(report)
                    deleted_count += 1
                
                db.commit()
                
                return {
                    "response": f"✅ **Cleanup Complete**\n\nDeleted **{deleted_count}** invalid report(s) with Unknown Patient or missing data from the database.",
                    "requires_upload": False,
                    "action": "cleanup_complete",
                    "deleted_count": deleted_count
                }
            except Exception as e:
                logger.error(f"Error cleaning up reports: {e}")
                db.rollback()
                return {
                    "response": f"❌ Error cleaning up reports: {str(e)}",
                    "requires_upload": False
                }
        
        elif intent == "remove_duplicates":
            # Remove duplicate medical reports
            try:
                from collections import defaultdict
                
                # Get all reports with file_hash
                all_reports = db.query(MedicalReport).filter(
                    MedicalReport.file_hash.isnot(None)
                ).all()
                
                # Group reports by file_hash
                reports_by_hash = defaultdict(list)
                for report in all_reports:
                    if report.file_hash:
                        reports_by_hash[report.file_hash].append(report)
                
                # Find duplicates (hashes with more than one report)
                duplicates_to_remove = []
                for file_hash, reports in reports_by_hash.items():
                    if len(reports) > 1:
                        # Sort by uploaded_at (most recent first) or report_date
                        reports_sorted = sorted(
                            reports,
                            key=lambda r: r.uploaded_at if r.uploaded_at else (r.report_date if r.report_date else datetime.min),
                            reverse=True
                        )
                        # Keep the first (most recent), mark others for deletion
                        for report in reports_sorted[1:]:
                            duplicates_to_remove.append(report)
                
                # Delete duplicate reports
                deleted_count = 0
                deleted_hashes = set()
                
                for report in duplicates_to_remove:
                    # Only delete the file if it's not shared with other reports
                    file_hash = report.file_hash
                    if file_hash not in deleted_hashes:
                        # Check if any other report uses this file_path
                        other_reports_with_same_file = db.query(MedicalReport).filter(
                            MedicalReport.file_path == report.file_path,
                            MedicalReport.id != report.id
                        ).count()
                        
                        # Only delete file if no other reports use it
                        if other_reports_with_same_file == 0 and report.file_path and os.path.exists(report.file_path):
                            try:
                                os.remove(report.file_path)
                            except Exception as e:
                                logger.warning(f"Could not delete file {report.file_path}: {e}")
                    
                    db.delete(report)
                    deleted_count += 1
                    deleted_hashes.add(file_hash)
                
                db.commit()
                
                return {
                    "response": f"✅ **Duplicate Removal Complete**\n\nRemoved **{deleted_count}** duplicate report(s) from the database.\n\n**Unique hashes cleaned:** {len(deleted_hashes)}",
                    "requires_upload": False,
                    "action": "cleanup_complete",
                    "deleted_count": deleted_count
                }
            except Exception as e:
                logger.error(f"Error removing duplicates: {e}")
                db.rollback()
                return {
                    "response": f"❌ Error removing duplicates: {str(e)}",
                    "requires_upload": False
                }
        
        elif intent == "search_patient":
            if not patient_name:
                return {
                    "response": "I couldn't identify a patient name in your query. Please specify the patient name.",
                    "requires_upload": False
                }
            
            patients = db.query(User).filter(
                (User.full_name.ilike(f"%{patient_name}%")) | 
                (User.username.ilike(f"%{patient_name}%"))
            ).all()
            
            if not patients:
                return {
                    "response": f"No patient found with name **{patient_name}**.",
                    "requires_upload": False
                }
            
            response_text = f"**Found {len(patients)} patient{'s' if len(patients) != 1 else ''}:**\n\n"
            for patient in patients:
                response_text += f"• **{patient.full_name or patient.username}** (ID: {patient.id})\n"
                if patient.email:
                    response_text += f"  Email: {patient.email}\n"
                response_text += "\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "patients_count": len(patients)
            }
        
        elif intent == "get_pending_tasks":
            # Get pending tasks
            tasks = db.query(Task).filter(Task.status == "pending").order_by(Task.due_date.asc(), Task.created_at.desc()).all()
            
            if not tasks:
                return {
                    "response": "**No pending tasks found.**\n\nAll tasks are completed! 🎉",
                    "requires_upload": False,
                    "tasks": [],
                    "action": "show_task_cards"
                }
            
            # Return tasks in structured format for frontend to display as cards
            tasks_data = []
            for task in tasks:
                tasks_data.append({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description or "No description",
                    "status": task.status,
                    "priority": task.priority,
                    "task_type": task.task_type or "N/A",
                    "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                    "created_at": task.created_at.strftime('%Y-%m-%d') if task.created_at else None,
                    "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
                })
            
            response_text = f"**Pending Tasks ({len(tasks)}):**\n\nClick on any task card below to view full details.\n\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "tasks": tasks_data,
                "action": "show_task_cards"
            }
        
        elif intent == "get_all_tasks":
            # Show MCQ options for task filtering
            return {
                "response": "**What type of tasks would you like to see?**\n\nPlease select one:",
                "requires_upload": False,
                "show_task_options": True  # Signal frontend to show MCQ options
            }
        
        elif intent == "search_task":
            task_name = understanding.get("task_name") or query_text
            # Search for tasks by title or description
            tasks = db.query(Task).filter(
                (Task.title.ilike(f"%{task_name}%")) | 
                (Task.description.ilike(f"%{task_name}%"))
            ).all()
            
            if not tasks:
                return {
                    "response": f"I couldn't find a task matching **{task_name}**.\n\nWould you like to create this task?",
                    "requires_upload": False,
                    "show_create_task": True,
                    "suggested_task_name": task_name
                }
            
            # Return tasks in structured format for frontend to display as cards
            tasks_data = []
            for task in tasks:
                tasks_data.append({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description or "No description",
                    "status": task.status,
                    "priority": task.priority,
                    "task_type": task.task_type or "N/A",
                    "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                    "created_at": task.created_at.strftime('%Y-%m-%d') if task.created_at else None,
                    "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
                })
            
            response_text = f"**Found {len(tasks)} task{'s' if len(tasks) != 1 else ''} matching '{task_name}':**\n\nClick on any task card below to view full details.\n\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "tasks": tasks_data,
                "action": "show_task_cards"
            }
        
        elif intent == "create_task":
            # Signal frontend to show task creation form
            return {
                "response": "I'll help you create a new task. Please fill in the details below:",
                "requires_upload": False,
                "show_create_task": True
            }
        
        elif intent == "get_all_patient_names":
            # Get all unique patient names from medical reports
            reports = db.query(MedicalReport).filter(MedicalReport.extracted_text != "").all()
            patient_names = set()
            
            for report in reports:
                if report.extracted_text:
                    patient_name = _extract_patient_name_from_text(report.extracted_text)
                    if patient_name:
                        patient_names.add(patient_name)
            
            # Also check User table for patients with reports
            patients_with_reports = db.query(User).join(MedicalReport).distinct().all()
            for patient in patients_with_reports:
                if patient.full_name:
                    patient_names.add(patient.full_name)
            
            if not patient_names:
                return {
                    "response": "**No patient names found in medical reports.**\n\nPlease upload some medical reports first.",
                    "requires_upload": False
                }
            
            response_text = f"**All Patients ({len(patient_names)}):**\n\n"
            for index, name in enumerate(sorted(patient_names), 1):
                response_text += f"**{index}. {name}**\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "patient_count": len(patient_names)
            }
        
        elif intent == "upload_medical_reports":
            # Signal frontend to show medical report upload section
            return {
                "response": "I'll help you upload medical reports. Please use the upload section below to add medical report files to the database.\n\nYou can upload multiple files at once. The system will automatically extract patient information from the reports.",
                "requires_upload": True,
                "patient_name": None,  # Generic upload, no specific patient
                "patient_id": None
            }
        
        elif intent == "analyze_patient":
            if not patient_name:
                return {
                    "response": "I couldn't identify a patient name. Please specify the patient name, for example: 'What is wrong with Rajesh?'",
                    "requires_upload": False
                }
            
            # Find patient
            patients = db.query(User).filter(
                (User.full_name.ilike(f"%{patient_name}%")) |
                (User.username.ilike(f"%{patient_name}%"))
            ).all()
            
            if not patients:
                return {
                    "response": f"I couldn't find a patient named **{patient_name}** in the database.",
                    "requires_upload": False
                }
            
            patient = patients[0]
            reports = db.query(MedicalReport).filter(
                MedicalReport.patient_id == patient.id
            ).order_by(MedicalReport.report_date.desc()).all()
            
            if not reports:
                return {
                    "response": f"I found patient **{patient.full_name or patient.username}**, but they don't have any medical reports yet.",
                    "requires_upload": False
                }
            
            # Analyze reports for abnormalities
            abnormalities = []
            for report in reports:
                if report.extracted_text:
                    # Look for abnormal values, high/low indicators
                    text_lower = report.extracted_text.lower()
                    if any(word in text_lower for word in ['high', 'elevated', 'increased', 'abnormal', 'low', 'decreased', 'below']):
                        abnormalities.append(f"Report from {report.report_date.strftime('%Y-%m-%d') if report.report_date else 'Unknown date'}: Contains abnormal values")
            
            response_text = f"**Analysis for {patient.full_name or patient.username}:**\n\n"
            response_text += f"**Total Reports:** {len(reports)}\n\n"
            
            if abnormalities:
                response_text += "**⚠️ Abnormalities Found:**\n"
                for ab in abnormalities:
                    response_text += f"• {ab}\n"
                response_text += "\n"
            else:
                response_text += "**✅ No obvious abnormalities detected in recent reports.**\n\n"
            
            response_text += "**Latest Report Summary:**\n"
            latest_report = reports[0]
            if latest_report.extracted_text:
                # Extract key findings from text
                text = latest_report.extracted_text[:500]
                response_text += f"{text}...\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "patient_id": patient.id,
                "reports_count": len(reports)
            }
        
        elif intent == "find_patients_by_lab_value":
            lab_test = understanding.get("lab_test")
            lab_condition = understanding.get("lab_condition", "low")
            
            if not lab_test:
                return {
                    "response": "I couldn't identify a lab test name. Please specify, for example: 'What patient have less RBC?' or 'Which patients have high WBC?'",
                    "requires_upload": False
                }
            
            # Search through all reports for the lab value
            reports = db.query(MedicalReport).filter(MedicalReport.extracted_text != "").all()
            matching_patients = []
            
            lab_test_lower = lab_test.lower()
            condition_lower = lab_condition.lower() if lab_condition else "low"
            
            for report in reports:
                if report.extracted_text:
                    text_lower = report.extracted_text.lower()
                    # Check if lab test is mentioned
                    if lab_test_lower in text_lower:
                        # Check for condition (high/low)
                        is_match = False
                        if condition_lower in ["low", "less", "decreased", "below"]:
                            if any(word in text_lower for word in ['low', 'less', 'decreased', 'below', 'deficit']):
                                is_match = True
                        elif condition_lower in ["high", "more", "increased", "elevated", "above"]:
                            if any(word in text_lower for word in ['high', 'more', 'increased', 'elevated', 'above']):
                                is_match = True
                        else:
                            is_match = True  # If condition not specified, show all
                        
                        if is_match:
                            patient_name = _extract_patient_name_from_text(report.extracted_text)
                            if patient_name and patient_name not in [p['name'] for p in matching_patients]:
                                matching_patients.append({
                                    "name": patient_name,
                                    "report_id": report.id,
                                    "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else 'Unknown'
                                })
            
            if not matching_patients:
                return {
                    "response": f"**No patients found with {condition_lower} {lab_test.upper()} values.**",
                    "requires_upload": False
                }
            
            response_text = f"**Patients with {condition_lower} {lab_test.upper()}:**\n\n"
            for index, patient in enumerate(matching_patients, 1):
                response_text += f"**{index}. {patient['name']}**\n"
                response_text += f"• Report Date: {patient['report_date']}\n\n"
            
            return {
                "response": response_text,
                "requires_upload": False,
                "patients_count": len(matching_patients)
            }
        
        else:
            return {
                "response": "I can help you with:\n• \"How many reports do we have in our database?\"\n• \"What is the medical report of [patient name]?\" or \"Do you have [patient name] medical report?\"\n• \"What are the names of all my patients?\"\n• \"What is wrong with [patient name]?\"\n• \"What patient have less RBC?\" or \"Which patients have high WBC?\"\n• \"List all reports\"\n• \"Find patient [name]\"\n• \"Show pending tasks\" or \"Tell me all pending tasks\"\n• \"Tell me all tasks\"\n• \"I want to add a task\"",
                "requires_upload": False
            }
    
    except Exception as e:
        logger.error(f"Error handling chat query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/{report_id}/file")
async def get_report_file(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Download or view a medical report file (PDF, image, etc.)
    """
    try:
        # Get the report
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Check if file exists
        if not report.file_path or not os.path.exists(report.file_path):
            raise HTTPException(status_code=404, detail="Report file not found")
        
        # Determine media type based on file extension
        file_ext = os.path.splitext(report.file_path)[1].lower()
        media_type_map = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.txt': 'text/plain'
        }
        
        media_type = media_type_map.get(file_ext, 'application/octet-stream')
        
        # Create a safe filename for download
        safe_filename = f"{report.report_type}_{report.patient.full_name}_{report.id}{file_ext}".replace(" ", "_")
        
        return FileResponse(
            path=report.file_path,
            media_type=media_type,
            filename=safe_filename,
            headers={
                "Content-Disposition": f"inline; filename={safe_filename}",
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        logger.error(f"Error serving report file: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving report file")


@router.get("/reports/{report_id}")
async def get_report_details(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific medical report
    """
    try:
        report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "id": report.id,
            "patient_name": report.patient.full_name if report.patient else "Unknown",
            "report_type": report.report_type,
            "report_name": report.report_name,
            "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else None,
            "file_type": report.file_type,
            "file_path": report.file_path,
            "ai_summary": report.ai_summary,
            "extracted_text": report.extracted_text,
            "uploaded_at": report.uploaded_at.strftime('%Y-%m-%d %H:%M:%S') if report.uploaded_at else None,
            "download_url": f"/api/doctor/reports/{report.id}/file",
            "can_view_inline": report.file_type in ['pdf', 'jpg', 'jpeg', 'png']
        }
        
    except Exception as e:
        logger.error(f"Error getting report details: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving report details")


def calculate_file_hash(content: bytes) -> str:
    """Calculate MD5 hash of file content for duplicate detection"""
    return hashlib.md5(content).hexdigest()


@router.post("/reports/upload")
async def upload_medical_report(
    file: UploadFile = File(...),
    patient_id: int = None,
    report_type: str = "lab",
    report_name: str = "Medical Report",
    force_upload: bool = False,  # Set to True when user confirms duplicate upload
    db: Session = Depends(get_db)
):
    """
    Upload medical report with text extraction and duplicate detection
    """
    try:
        # Validate file type
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Read file content
        content = await file.read()
        
        # Calculate file hash for duplicate detection
        file_hash = calculate_file_hash(content)
        
        # Check for duplicate (unless force_upload is True)
        if not force_upload:
            # First check by file_hash (for reports that have hash)
            existing_report = db.query(MedicalReport).filter(
                MedicalReport.file_hash == file_hash
            ).first()
            
            # If no match by hash, check reports without hash by comparing file content
            if not existing_report:
                reports_without_hash = db.query(MedicalReport).filter(
                    (MedicalReport.file_hash.is_(None)) | (MedicalReport.file_hash == "")
                ).all()
                
                for report in reports_without_hash:
                    if report.file_path and os.path.exists(report.file_path):
                        try:
                            # Read existing file and calculate its hash
                            with open(report.file_path, "rb") as f:
                                existing_content = f.read()
                                existing_hash = calculate_file_hash(existing_content)
                                
                                # Update the report with hash for future checks
                                report.file_hash = existing_hash
                                db.commit()
                                
                                # Check if it matches the uploaded file
                                if existing_hash == file_hash:
                                    existing_report = report
                                    break
                        except Exception as e:
                            logger.warning(f"Could not read file {report.file_path} for duplicate check: {e}")
                            continue
            
            if existing_report:
                # Get patient name for the existing report
                existing_patient_name = "Unknown"
                if existing_report.patient_id:
                    existing_patient = db.query(User).filter(User.id == existing_report.patient_id).first()
                    if existing_patient:
                        existing_patient_name = existing_patient.full_name or existing_patient.username
                
                return {
                    "duplicate": True,
                    "message": "This medical report is already present in the database",
                    "existing_report_id": existing_report.id,
                    "existing_patient_name": existing_patient_name,
                    "existing_report_date": existing_report.report_date.strftime('%Y-%m-%d') if existing_report.report_date else 'N/A',
                    "file_hash": file_hash,
                    "filename": file.filename
                }
        
        # Save file
        upload_dir = "uploads/reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, f"{datetime.now().timestamp()}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract text from file
        extracted_text = ""
        if file_ext == ".pdf":
            extracted_text = PDFProcessor.extract_text_from_pdf(file_path) or ""
        elif file_ext in [".jpg", ".jpeg", ".png"]:
            extracted_text = PDFProcessor.extract_text_from_image(file_path) or ""
        
        # Extract patient name from text
        patient_name_from_report = _extract_patient_name_from_text(extracted_text)
        
        # If patient_id not provided, try to find or create patient by name
        if not patient_id and patient_name_from_report:
            # Search for existing patient
            existing_patient = db.query(User).filter(
                (User.full_name.ilike(f"%{patient_name_from_report}%")) |
                (User.username.ilike(f"%{patient_name_from_report}%"))
            ).first()
            
            if existing_patient:
                patient_id = existing_patient.id
            else:
                # Create new patient with extracted name
                new_patient = User(
                    full_name=patient_name_from_report,
                    username=patient_name_from_report.lower().replace(" ", "_"),
                    email=f"{patient_name_from_report.lower().replace(' ', '_')}@example.com",
                    hashed_password="",  # No password for auto-created patients
                    role="patient"
                )
                db.add(new_patient)
                db.commit()
                db.refresh(new_patient)
                patient_id = new_patient.id
        
        # Create report record
        report = MedicalReport(
            patient_id=patient_id,
            report_type=report_type,
            report_name=report_name or file.filename,
            report_date=datetime.now(),
            file_path=file_path,
            file_type=file_ext,
            file_hash=file_hash,
            extracted_text=extracted_text,
            ai_summary="",
            ai_key_findings=[],
            parsed_data={},
            ai_abnormal_values=[]
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "report_id": report.id,
            "message": "Report uploaded successfully",
            "patient_name": patient_name_from_report or "Unknown",
            "patient_id": patient_id
        }
    
    except Exception as e:
        logger.error(f"Error uploading report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reports/upload-confirm")
async def confirm_duplicate_upload(
    request: DuplicateUploadConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm upload of duplicate medical report (when user clicks Yes)
    This endpoint is called after user confirms they want to upload duplicate as updated report
    """
    try:
        # Extract values from request
        file_hash = request.file_hash
        filename = request.filename
        patient_id = request.patient_id
        report_type = request.report_type
        # Remove file extension for report_name if not provided
        if request.report_name:
            report_name = request.report_name
        elif filename:
            import re
            report_name = re.sub(r'\.[^/.]+$', '', filename)
        else:
            report_name = "Medical Report"
        
        # Find the existing report with this hash
        existing_report = db.query(MedicalReport).filter(
            MedicalReport.file_hash == file_hash
        ).first()
        
        if not existing_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Read the file from existing report path
        if not os.path.exists(existing_report.file_path):
            raise HTTPException(status_code=404, detail="Original report file not found")
        
        # Create a new report entry (updated version) with same hash but new timestamp
        new_report = MedicalReport(
            patient_id=patient_id or existing_report.patient_id,
            report_type=report_type or existing_report.report_type,
            report_name=report_name or filename or existing_report.report_name,
            report_date=datetime.now(),  # New date for updated report
            file_path=existing_report.file_path,  # Use same file
            file_type=existing_report.file_type,
            file_hash=file_hash,  # Same hash
            extracted_text=existing_report.extracted_text,
            ai_summary=existing_report.ai_summary or "",
            ai_key_findings=existing_report.ai_key_findings or [],
            parsed_data=existing_report.parsed_data or {},
            ai_abnormal_values=existing_report.ai_abnormal_values or []
        )
        
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        # Get patient name
        patient_name = "Unknown"
        if new_report.patient_id:
            patient = db.query(User).filter(User.id == new_report.patient_id).first()
            if patient:
                patient_name = patient.full_name or patient.username
        
        return {
            "report_id": new_report.id,
            "message": "Report uploaded successfully as updated version",
            "patient_name": patient_name,
            "patient_id": new_report.patient_id
        }
    
    except Exception as e:
        logger.error(f"Error confirming duplicate upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reports/upload-multiple")
async def upload_multiple_medical_reports(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload multiple medical reports at once
    """
    try:
        uploaded_reports = []
        errors = []
        
        for file in files:
            try:
                # Validate file type
                allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
                file_ext = os.path.splitext(file.filename)[1].lower()
                
                if file_ext not in allowed_extensions:
                    errors.append(f"{file.filename}: Invalid file type")
                    continue
                
                # Save file
                upload_dir = "uploads/reports"
                os.makedirs(upload_dir, exist_ok=True)
                
                file_path = os.path.join(upload_dir, f"{datetime.now().timestamp()}_{file.filename}")
                
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                
                # Extract text from file
                extracted_text = ""
                if file_ext == ".pdf":
                    extracted_text = PDFProcessor.extract_text_from_pdf(file_path) or ""
                elif file_ext in [".jpg", ".jpeg", ".png"]:
                    extracted_text = PDFProcessor.extract_text_from_image(file_path) or ""
                
                # Extract patient name from text
                patient_name_from_report = _extract_patient_name_from_text(extracted_text)
                
                # Find or create patient
                patient_id = None
                if patient_name_from_report:
                    existing_patient = db.query(User).filter(
                        (User.full_name.ilike(f"%{patient_name_from_report}%")) |
                        (User.username.ilike(f"%{patient_name_from_report}%"))
                    ).first()
                    
                    if existing_patient:
                        patient_id = existing_patient.id
                    else:
                        new_patient = User(
                            full_name=patient_name_from_report,
                            username=patient_name_from_report.lower().replace(" ", "_"),
                            email=f"{patient_name_from_report.lower().replace(' ', '_')}@example.com",
                            hashed_password="",
                            role="patient"
                        )
                        db.add(new_patient)
                        db.commit()
                        db.refresh(new_patient)
                        patient_id = new_patient.id
                
                # Create report record
                report = MedicalReport(
                    patient_id=patient_id,
                    report_type="lab",
                    report_name=file.filename,
                    report_date=datetime.now(),
                    file_path=file_path,
                    file_type=file_ext,
                    extracted_text=extracted_text,
                    ai_summary="",
                    ai_key_findings=[],
                    parsed_data={},
                    ai_abnormal_values=[]
                )
                
                db.add(report)
                db.commit()
                db.refresh(report)
                
                uploaded_reports.append({
                    "report_id": report.id,
                    "filename": file.filename,
                    "patient_name": patient_name_from_report or "Unknown",
                    "patient_id": patient_id
                })
            except Exception as e:
                logger.error(f"Error uploading {file.filename}: {e}")
                errors.append(f"{file.filename}: {str(e)}")
        
        return {
            "uploaded_count": len(uploaded_reports),
            "reports": uploaded_reports,
            "errors": errors
        }
    
    except Exception as e:
        logger.error(f"Error uploading multiple reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _extract_patient_name_from_text(text: str) -> Optional[str]:
    """Extract patient name from medical report text"""
    if not text:
        return None
    
    # Common patterns for patient names in medical reports
    name_patterns = [
        r'(?:Name|Patient\s+Name|Patient)[:\s]+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][a-zA-Z\s]+)',
        r'(?:Name|Patient\s+Name|Patient)[:\s]+([A-Z][a-zA-Z\s]+)',
        r'Name\s*:\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+([A-Z][a-zA-Z\s]+)',
        r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Age\s*:',
        r'Mr\.?\s+([A-Z][A-Z\s]+?)(?:\s+Age|\s+Gender|\s+Lab)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Clean up name (remove extra words)
            name = re.sub(r'\s+(Age|Gender|Lab|Years|Year|Date).*$', '', name, flags=re.IGNORECASE).strip()
            # Capitalize properly
            name_parts = name.split()
            formatted_name = ' '.join([part.capitalize() if part.isupper() else part.title() for part in name_parts])
            return formatted_name
    
    return None


@router.get("/reports")
async def list_reports(
    patient_id: int = None,
    db: Session = Depends(get_db)
):
    """
    List all medical reports (optionally filtered by patient)
    """
    query = db.query(MedicalReport)
    
    if patient_id:
        query = query.filter(MedicalReport.patient_id == patient_id)
    
    reports = query.order_by(MedicalReport.report_date.desc()).all()
    
    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "report_type": r.report_type,
            "report_name": r.report_name,
            "report_date": r.report_date,
            "ai_summary": r.ai_summary,
            "parsed_data": r.parsed_data,
            "uploaded_at": r.uploaded_at
        } for r in reports
    ]


@router.get("/reports/count")
async def get_report_count(
    db: Session = Depends(get_db)
):
    """
    Get total count of medical reports
    """
    count = db.query(MedicalReport).count()
    return {"count": count}


# Task Management Endpoints
@router.get("/tasks")
async def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status: pending, completed, in_progress"),
    db: Session = Depends(get_db)
):
    """
    Get tasks with optional status filter
    """
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.due_date.asc(), Task.created_at.desc()).all()
    
    return {
        "tasks": [TaskResponse.model_validate(task) for task in tasks],
        "count": len(tasks)
    }


@router.get("/tasks/search")
async def search_tasks(
    query: str = Query(..., description="Search term for task title or description"),
    db: Session = Depends(get_db)
):
    """
    Search tasks by title or description
    """
    tasks = db.query(Task).filter(
        (Task.title.ilike(f"%{query}%")) | 
        (Task.description.ilike(f"%{query}%"))
    ).all()
    
    return {
        "tasks": [TaskResponse.model_validate(task) for task in tasks],
        "count": len(tasks)
    }


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single task by ID
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "status": task.status,
        "priority": task.priority,
        "task_type": task.task_type or "N/A",
        "due_date": task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
        "created_at": task.created_at.strftime('%Y-%m-%d %H:%M') if task.created_at else None,
        "completed_at": task.completed_at.strftime('%Y-%m-%d %H:%M') if task.completed_at else None
    }


@router.post("/tasks")
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new task
    """
    # For now, use a default doctor_id (in production, get from auth)
    doctor_id = 1  # TODO: Get from authenticated user
    
    new_task = Task(
        doctor_id=doctor_id,
        patient_id=task.patient_id,
        consultation_id=task.consultation_id,
        task_type=task.task_type,
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        status="pending"
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return {
        "message": "Task created successfully",
        "task": TaskResponse.model_validate(new_task)
    }


@router.get("/reports/{report_id}")
async def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get medical report details
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Get patient name
    patient_name = "Unknown Patient"
    if report.patient_id:
        patient = db.query(User).filter(User.id == report.patient_id).first()
        if patient and patient.full_name:
            patient_name = patient.full_name
        elif report.extracted_text:
            extracted_name = _extract_patient_name_from_text(report.extracted_text)
            if extracted_name:
                patient_name = extracted_name
    
    return {
        "id": report.id,
        "report_name": report.report_name or "Unnamed Report",
        "patient_name": patient_name,
        "patient_id": report.patient_id,
        "report_type": report.report_type or "N/A",
        "report_date": report.report_date.strftime('%Y-%m-%d') if report.report_date else 'N/A',
        "extracted_text": report.extracted_text or "",
        "ai_summary": report.ai_summary or "",
        "file_path": report.file_path
    }


@router.get("/reports/{report_id}/file")
async def get_report_file(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the original medical report file
    Opens the file in a new browser tab
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not report.file_path:
        raise HTTPException(status_code=404, detail="Report file path not found")
    
    # Fix path separator issues and make path relative to project root
    file_path = report.file_path.replace('\\', '/').replace('//', '/')
    
    # Since server runs from backend/, we need to go up one level to find uploads/
    if not file_path.startswith('/') and not file_path.startswith('..'):
        file_path = os.path.join('..', file_path)
    
    # Normalize the path for the current OS
    file_path = os.path.normpath(file_path)
    
    if not os.path.exists(file_path):
        # Try alternative path constructions
        alt_paths = [
            report.file_path,  # Original path
            report.file_path.replace('\\', '/'),  # Forward slashes
            os.path.join('..', report.file_path.replace('\\', '/')),  # Relative to backend
            report.file_path.replace('\\', os.sep)  # OS-specific separators
        ]
        
        existing_path = None
        for alt_path in alt_paths:
            if os.path.exists(alt_path):
                existing_path = alt_path
                break
        
        if existing_path:
            file_path = existing_path
        else:
            raise HTTPException(
                status_code=404, 
                detail=f"Report file not found. Tried paths: {', '.join(alt_paths)}"
            )
    
    # Determine media type based on file extension
    file_ext = os.path.splitext(file_path)[1].lower()
    media_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    }
    media_type = media_types.get(file_ext, 'application/octet-stream')
    
    # Get the original filename for display
    filename = report.report_name or f"report_{report_id}{file_ext}"
    if not filename.endswith(file_ext):
        filename += file_ext
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
        content_disposition_type="inline"  # Open in browser instead of downloading
    )


@router.delete("/reports/cleanup")
async def cleanup_invalid_reports(
    db: Session = Depends(get_db)
):
    """
    Remove reports with Unknown Patient or invalid data
    """
    try:
        # Find reports that have no patient_id or patient_id points to invalid patient
        reports_to_delete = []
        
        # Get all reports
        all_reports = db.query(MedicalReport).all()
        
        for report in all_reports:
            should_delete = False
            
            # Check if report has no patient_id
            if not report.patient_id:
                should_delete = True
            
            # Check if patient_id exists but patient has no name
            elif report.patient_id:
                patient = db.query(User).filter(User.id == report.patient_id).first()
                if not patient or (not patient.full_name and not patient.username):
                    should_delete = True
                # Check if extracted text has no patient name
                elif report.extracted_text:
                    extracted_name = _extract_patient_name_from_text(report.extracted_text)
                    if not extracted_name and not patient.full_name:
                        should_delete = True
            
            # Check if report has no extracted text and no file
            if not report.extracted_text and not report.file_path:
                should_delete = True
            
            if should_delete:
                reports_to_delete.append(report)
        
        # Delete reports
        deleted_count = 0
        for report in reports_to_delete:
            # Delete file if exists
            if report.file_path and os.path.exists(report.file_path):
                try:
                    os.remove(report.file_path)
                except Exception as e:
                    logger.warning(f"Could not delete file {report.file_path}: {e}")
            
            db.delete(report)
            deleted_count += 1
        
        db.commit()
        
        return {
            "message": f"Successfully deleted {deleted_count} invalid report(s)",
            "deleted_count": deleted_count
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error cleaning up reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reports/remove-duplicates")
async def remove_duplicate_reports(
    db: Session = Depends(get_db)
):
    """
    Remove duplicate medical reports from the database
    Keeps the most recent report for each file_hash and deletes the rest
    """
    try:
        from collections import defaultdict
        from sqlalchemy import func
        
        # Get all reports with file_hash
        all_reports = db.query(MedicalReport).filter(
            MedicalReport.file_hash.isnot(None)
        ).all()
        
        # Group reports by file_hash
        reports_by_hash = defaultdict(list)
        for report in all_reports:
            if report.file_hash:
                reports_by_hash[report.file_hash].append(report)
        
        # Find duplicates (hashes with more than one report)
        duplicates_to_remove = []
        for file_hash, reports in reports_by_hash.items():
            if len(reports) > 1:
                # Sort by uploaded_at (most recent first) or report_date
                reports_sorted = sorted(
                    reports,
                    key=lambda r: r.uploaded_at if r.uploaded_at else (r.report_date if r.report_date else datetime.min),
                    reverse=True
                )
                # Keep the first (most recent), mark others for deletion
                for report in reports_sorted[1:]:
                    duplicates_to_remove.append(report)
        
        # Delete duplicate reports
        deleted_count = 0
        deleted_hashes = set()
        
        for report in duplicates_to_remove:
            # Only delete the file if it's not shared with other reports
            # (Since multiple reports can share the same file_path)
            file_hash = report.file_hash
            if file_hash not in deleted_hashes:
                # Check if any other report uses this file_path
                other_reports_with_same_file = db.query(MedicalReport).filter(
                    MedicalReport.file_path == report.file_path,
                    MedicalReport.id != report.id
                ).count()
                
                # Only delete file if no other reports use it
                if other_reports_with_same_file == 0 and report.file_path and os.path.exists(report.file_path):
                    try:
                        os.remove(report.file_path)
                    except Exception as e:
                        logger.warning(f"Could not delete file {report.file_path}: {e}")
            
            db.delete(report)
            deleted_count += 1
            deleted_hashes.add(file_hash)
        
        db.commit()
        
        return {
            "message": f"Successfully removed {deleted_count} duplicate report(s)",
            "deleted_count": deleted_count,
            "unique_hashes_cleaned": len(deleted_hashes)
        }
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error removing duplicate reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients/search")
async def search_patients(
    name: str = Query(..., description="Patient name to search for"),
    db: Session = Depends(get_db)
):
    """
    Search for patients by name
    """
    # Search in User table by full_name or username
    users = db.query(User).filter(
        (User.full_name.ilike(f"%{name}%")) | 
        (User.username.ilike(f"%{name}%"))
    ).all()
    
    if not users:
        return []
    
    patients = []
    for user in users:
        # Get patient profile if exists
        patient_profile = db.query(Patient).filter(Patient.user_id == user.id).first()
        
        patients.append({
            "id": user.id,
            "name": user.full_name or user.username,
            "email": user.email,
            "username": user.username,
            "gender": patient_profile.gender if patient_profile else None,
            "blood_group": patient_profile.blood_group if patient_profile else None
        })
    
    return patients


@router.get("/patients/{patient_id}/reports")
async def get_patient_reports(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all reports for a specific patient
    """
    reports = db.query(MedicalReport).filter(
        MedicalReport.patient_id == patient_id
    ).order_by(MedicalReport.report_date.desc()).all()
    
    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "report_type": r.report_type,
            "report_name": r.report_name,
            "report_date": r.report_date,
            "ai_summary": r.ai_summary,
            "parsed_data": r.parsed_data,
            "uploaded_at": r.uploaded_at
        } for r in reports
        ]
