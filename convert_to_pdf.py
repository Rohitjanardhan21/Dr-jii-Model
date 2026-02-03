#!/usr/bin/env python3
"""
Convert existing text medical reports to professional PDF format
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from models import MedicalReport, User
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import re

def create_pdf_report(report_data, output_path):
    """Create a professional PDF medical report"""
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    hospital_style = ParagraphStyle(
        'HospitalStyle',
        parent=styles['Normal'],
        fontSize=14,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.darkgreen,
        fontName='Helvetica-Bold'
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=12,
        spaceBefore=12,
        textColor=colors.darkblue,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        fontName='Helvetica'
    )
    
    # Story (content) list
    story = []
    
    # Parse the text content
    content = report_data['content']
    lines = content.split('\n')
    
    # Extract hospital name and report type
    hospital_name = "Unknown Hospital"
    report_type = "Medical Report"
    
    for line in lines:
        if '🏥' in line and 'HOSPITAL' in line.upper():
            hospital_name = line.replace('🏥', '').strip()
            break
    
    if 'BLOOD TEST' in content.upper():
        report_type = "Blood Test Report"
    elif 'X-RAY' in content.upper():
        report_type = "Chest X-Ray Report"
    elif 'ECG' in content.upper() or 'ELECTROCARDIOGRAM' in content.upper():
        report_type = "Electrocardiogram Report"
    elif 'ULTRASOUND' in content.upper():
        report_type = "Ultrasound Report"
    
    # Header
    story.append(Paragraph(hospital_name, hospital_style))
    story.append(Paragraph(report_type, title_style))
    story.append(Spacer(1, 20))
    
    # Patient information table
    patient_info = []
    current_section = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('Patient:'):
            patient_info.append(['Patient Name:', line.replace('Patient:', '').strip()])
        elif line.startswith('Date:'):
            patient_info.append(['Report Date:', line.replace('Date:', '').strip()])
        elif line.startswith('Lab ID:') or line.startswith('Study ID:'):
            patient_info.append(['Lab/Study ID:', line.split(':', 1)[1].strip()])
        elif 'Doctor:' in line or 'Physician:' in line:
            patient_info.append(['Consulting Doctor:', line.split(':', 1)[1].strip()])
    
    if patient_info:
        patient_table = Table(patient_info, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 20))
    
    # Process content sections
    current_section = ""
    section_data = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('🏥') or line.startswith('Patient:') or line.startswith('Date:') or line.startswith('Lab ID:') or line.startswith('Study ID:') or 'Doctor:' in line:
            continue
        
        # Check if this is a section header
        if (line.isupper() and ':' not in line and len(line) > 3) or \
           (line.endswith(':') and len(line.split()) <= 4):
            # Save previous section
            if current_section and section_data:
                story.append(Paragraph(current_section, section_style))
                
                # Create table for lab values
                if any(':' in item for item in section_data):
                    table_data = []
                    for item in section_data:
                        if ':' in item:
                            parts = item.split(':', 1)
                            if len(parts) == 2:
                                test_name = parts[0].strip('- ')
                                value_info = parts[1].strip()
                                table_data.append([test_name, value_info])
                    
                    if table_data:
                        section_table = Table(table_data, colWidths=[2.5*inch, 3.5*inch])
                        section_table.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                            ('FONTSIZE', (0, 0), (-1, -1), 9),
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                        ]))
                        story.append(section_table)
                else:
                    # Regular text content
                    for item in section_data:
                        story.append(Paragraph(item, normal_style))
                
                story.append(Spacer(1, 12))
            
            # Start new section
            current_section = line.replace(':', '').strip()
            section_data = []
        else:
            # Add to current section
            if line.startswith('-') or ':' in line:
                section_data.append(line)
            elif line.startswith('REMARKS:') or line.startswith('IMPRESSION:') or line.startswith('RECOMMENDATIONS:'):
                # Special handling for remarks/impression
                if current_section and section_data:
                    story.append(Paragraph(current_section, section_style))
                    for item in section_data:
                        story.append(Paragraph(item, normal_style))
                    story.append(Spacer(1, 12))
                
                current_section = line.split(':', 1)[0]
                section_data = [line.split(':', 1)[1].strip()] if ':' in line else []
            else:
                section_data.append(line)
    
    # Add final section
    if current_section and section_data:
        story.append(Paragraph(current_section, section_style))
        for item in section_data:
            story.append(Paragraph(item, normal_style))
    
    # Footer
    story.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    
    story.append(Paragraph("This is a computer-generated report.", footer_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
    
    # Build PDF
    doc.build(story)
    return True

def convert_all_reports_to_pdf():
    """Convert all existing text reports to PDF format"""
    
    db = SessionLocal()
    
    try:
        # Get all medical reports
        reports = db.query(MedicalReport).all()
        
        print(f"Found {len(reports)} reports to convert")
        
        converted_count = 0
        
        for report in reports:
            try:
                # Skip if already PDF
                if report.file_type == 'pdf':
                    continue
                
                # Create PDF filename
                original_path = Path(report.file_path)
                pdf_filename = original_path.stem + '.pdf'
                pdf_path = original_path.parent / pdf_filename
                
                # Prepare report data
                report_data = {
                    'content': report.extracted_text,
                    'patient_name': report.patient.full_name if report.patient else 'Unknown Patient',
                    'report_type': report.report_type,
                    'report_date': report.report_date
                }
                
                # Create PDF
                if create_pdf_report(report_data, pdf_path):
                    # Update database record
                    report.file_path = str(pdf_path)
                    report.file_type = 'pdf'
                    converted_count += 1
                    print(f"✅ Converted: {report.report_name}")
                
            except Exception as e:
                print(f"❌ Error converting {report.report_name}: {e}")
                continue
        
        db.commit()
        
        print(f"\n🎉 Successfully converted {converted_count} reports to PDF!")
        return converted_count
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

def create_sample_pdf_reports():
    """Create a few sample PDF reports with better formatting"""
    
    db = SessionLocal()
    
    try:
        # Get a few patients to create sample PDFs
        patients = db.query(User).filter(User.role == "PATIENT").limit(5).all()
        
        uploads_dir = Path("uploads/reports")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        created_count = 0
        
        for i, patient in enumerate(patients):
            # Create a comprehensive blood test PDF
            timestamp = int(datetime.now().timestamp() * 1000) + i
            
            report_content = f"""🏥 APOLLO HOSPITALS CHENNAI - COMPREHENSIVE HEALTH CHECKUP

Patient: {patient.full_name}
Date: {datetime.now().strftime('%Y-%m-%d')}
Lab ID: LAB-PDF-{timestamp}
Consulting Physician: Dr. Suryansh Singh, MBBS, MD

COMPLETE BLOOD COUNT:
- Hemoglobin: 13.2 g/dL (Normal: 12-16)
- RBC Count: 4.5 million/μL (Normal: 4.0-5.5)
- WBC Count: 7200/μL (Normal: 4,000-11,000)
- Platelet Count: 285000/μL (Normal: 150,000-450,000)
- Hematocrit: 39.5% (Normal: 36-46)
- ESR: 12 mm/hr (Normal: 0-20)

DIABETES PROFILE:
- Fasting Blood Sugar: 95 mg/dL (Normal: 70-100)
- Post Prandial Sugar: 135 mg/dL (Normal: <140)
- HbA1c: 5.4% (Normal: <5.7)
- Fasting Insulin: 8.5 μU/mL (Normal: 2-25)

LIPID PROFILE:
- Total Cholesterol: 185 mg/dL (Normal: <200)
- HDL Cholesterol: 52 mg/dL (Normal: >40 M, >50 F)
- LDL Cholesterol: 108 mg/dL (Normal: <100)
- VLDL Cholesterol: 25 mg/dL (Normal: <30)
- Triglycerides: 125 mg/dL (Normal: <150)
- Cholesterol/HDL Ratio: 3.6 (Normal: <4.5)

LIVER FUNCTION TESTS:
- SGPT/ALT: 28 U/L (Normal: 7-56)
- SGOT/AST: 32 U/L (Normal: 10-40)
- Alkaline Phosphatase: 85 U/L (Normal: 44-147)
- Gamma GT: 22 U/L (Normal: 9-48)
- Total Bilirubin: 0.8 mg/dL (Normal: 0.3-1.2)
- Direct Bilirubin: 0.2 mg/dL (Normal: 0.0-0.3)

KIDNEY FUNCTION TESTS:
- Creatinine: 0.9 mg/dL (Normal: 0.6-1.2)
- Blood Urea Nitrogen: 15 mg/dL (Normal: 7-20)
- Uric Acid: 5.2 mg/dL (Normal: 3.5-7.2)

THYROID FUNCTION:
- TSH: 2.1 mIU/L (Normal: 0.4-4.0)
- Free T3: 3.2 pg/mL (Normal: 2.3-4.2)
- Free T4: 1.3 ng/dL (Normal: 0.8-1.8)

VITAMIN LEVELS:
- Vitamin D (25-OH): 32 ng/mL (Normal: 30-100)
- Vitamin B12: 485 pg/mL (Normal: 200-900)
- Folate: 8.5 ng/mL (Normal: 2.7-17.0)

REMARKS:
All parameters are within normal limits. Patient shows excellent health markers with optimal metabolic profile.

RECOMMENDATIONS:
• Continue current healthy lifestyle
• Regular exercise and balanced diet
• Annual health checkup recommended
• Maintain current weight

Report Verified By: Dr. Suryansh Singh, MBBS, MD (Pathology)
Apollo Hospitals Chennai
License: TN-DOC-2024-1234
Contact: +91-98765-43210
"""
            
            # Create PDF
            pdf_filename = f"PDF_{timestamp}_comprehensive_report_{patient.id}.pdf"
            pdf_path = uploads_dir / pdf_filename
            
            report_data = {
                'content': report_content,
                'patient_name': patient.full_name,
                'report_type': 'Comprehensive Health Checkup',
                'report_date': datetime.now()
            }
            
            if create_pdf_report(report_data, pdf_path):
                # Create database entry
                medical_report = MedicalReport(
                    patient_id=patient.id,
                    report_type="Comprehensive Health Checkup",
                    report_name=f"Comprehensive Health Checkup - {patient.full_name}",
                    file_path=str(pdf_path),
                    file_type="pdf",
                    extracted_text=report_content,
                    ai_summary=f"Comprehensive health checkup report for {patient.full_name} showing all parameters within normal limits.",
                    report_date=datetime.now()
                )
                
                db.add(medical_report)
                created_count += 1
                print(f"✅ Created PDF report for: {patient.full_name}")
        
        db.commit()
        
        print(f"\n🎉 Created {created_count} sample PDF reports!")
        return created_count
        
    except Exception as e:
        print(f"❌ Error creating PDF reports: {e}")
        db.rollback()
        return 0
    finally:
        db.close()

if __name__ == "__main__":
    print("📄 Converting Medical Reports to PDF Format...")
    print("=" * 60)
    
    # First create some sample PDF reports
    print("\n1. Creating sample PDF reports...")
    sample_count = create_sample_pdf_reports()
    
    # Then convert existing text reports
    print("\n2. Converting existing text reports to PDF...")
    converted_count = convert_all_reports_to_pdf()
    
    total_pdfs = sample_count + converted_count
    
    if total_pdfs > 0:
        print(f"\n🎉 Total PDF reports created: {total_pdfs}")
        print("\n📋 You can now:")
        print("• View PDF reports in the frontend")
        print("• Download reports as PDF files")
        print("• Test queries like 'Show me PDF reports'")
        print("• Access reports via API endpoints")
    else:
        print("\n❌ No PDF reports were created")