"""
Query Understanding Service using OpenAI
Understands natural language queries and extracts intent and entities
"""
import json
import logging
import asyncio
from typing import Dict, Any, Optional
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available.")


class QueryUnderstandingService:
    """Service to understand natural language queries using OpenAI"""
    
    def __init__(self):
        self.client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.warning("OpenAI not available or API key not set. Query understanding will be limited.")
    
    async def understand_query(self, query: str, mode: str = None) -> Dict[str, Any]:
        """
        Understand a natural language query and extract intent and entities
        
        Returns:
            {
                "intent": "get_patient_report" | "count_reports" | "list_reports" | "search_patient" | "unknown",
                "patient_name": str | None,
                "confidence": float
            }
        """
        # CRITICAL: Check for "all people/patients" BEFORE anything else
        query_lower = query.lower()
        if any(phrase in query_lower for phrase in ['all people', 'all patients', 'everyone', 'everybody', 'of all people', 'of all patients']):
            if 'report' in query_lower or 'medical' in query_lower:
                logger.info(f"PRE-CHECK: Query contains 'all people/patients', returning list_reports immediately")
                return {"intent": "list_reports", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.99}
        
        if not self.client:
            # Fallback to simple pattern matching
            return self._fallback_understanding(query)
        
        try:
            mode_context = ""
            if mode == "medical_report":
                mode_context = "The user is in Medical Report mode. Focus on understanding queries about patient reports, summaries, prescriptions, and report analysis. However, task-related queries should still be recognized."
            elif mode == "medical_knowledge":
                mode_context = "The user is in Medical Knowledge mode. Focus on general medical information, latest news, articles, and research. However, task-related queries should still be recognized."
            
            system_prompt = f"""You are a medical assistant query understanding system. 
{mode_context}

Analyze the user's query and extract the intent and relevant entities. Be smart about understanding common variations, typos, and natural language patterns.

Possible intents:
- "get_patient_report": User wants to see/get/find a medical report for a SPECIFIC patient (e.g., "rajesh medical report", "John Doe's report")
- "count_reports": User wants to know how many reports exist (e.g., "how many medical report you hav", "how many reports", "count of reports")
- "list_reports": User wants to see all reports (e.g., "provide me the medical report of all people", "show all reports", "all medical reports", "reports of all patients")
- "search_patient": User wants to find/search for a patient
- "summarize_report": User wants to summarize a patient's report
- "suggest_prescription": User wants prescription suggestions based on a report
- "get_all_patient_names": User wants to see all patient names from reports (e.g., "tell me the name of patients", "what are the names of all my patients", "list patient names", "whose medical reports i have")
- "analyze_patient": User wants to know what's wrong with a specific patient
- "analyze_medical_report": User wants medical analysis of a patient's report (e.g., "medical analysis of this person", "analyze this guy", "analysis of him")
- "find_patients_by_lab_value": User wants to find patients with specific lab value abnormalities (e.g., low RBC, high WBC)
- "get_pending_tasks": User wants to see pending tasks
       - "get_all_tasks": User wants to see all tasks (needs filtering option). Look for queries like "what are the tasks", "what tasks do i have", "show me all tasks", "list tasks", "tell me all tasks"
- "search_task": User wants to find a specific task by name
- "create_task": User wants to create/add a new task
- "upload_medical_reports": User wants to upload medical reports (e.g., "i want to upload more medical reports", "upload medical reports", "add medical reports")
- "cleanup_reports": User wants to remove/delete invalid reports (e.g., "cleanup invalid reports", "remove unknown patient reports")
- "remove_duplicates": User wants to remove duplicate medical reports (e.g., "remove duplicates", "delete duplicate reports", "cleanup duplicates")
- "unknown": Cannot determine intent

IMPORTANT RULES:
1. If query contains "how many" + ("report" OR "medical"), it's ALWAYS "count_reports" - DO NOT extract patient names from count queries
2. If query asks for "name" or "names" of "patients" (or "patent" - common typo), it's "get_all_patient_names" - DO NOT extract individual patient names
3. If query asks for reports of "all people", "all patients", "all people", "everyone", "everybody", it's ALWAYS "list_reports" - DO NOT extract "all people" or "all patients" as a patient name
4. Patient names are proper nouns (capitalized words). Do NOT treat common words like "you", "hav", "have", "i", "s", "me", "my", "we", "whose", "patent", "all", "people", "patients", "everyone", "everybody", "of all" as patient names
5. Handle typos gracefully (e.g., "patent" instead of "patient", "hav" instead of "have")
6. For "get_all_patient_names", look for patterns like: "tell me the name", "whose medical reports", "list patient names", "what are the names"
       7. For "list_reports", look for patterns like: "all reports", "all medical reports", "reports of all", "provide me the medical report of all", "show all reports", "show me all reports", "show me all the medical reports"

Extract patient names from the query ONLY for "get_patient_report" or "analyze_patient" intents. Patient names are typically proper nouns (capitalized words).
IMPORTANT: When extracting patient names, preserve titles like "Mr.", "Mrs.", "Ms.", "Dr.", "Miss", "Master" if they appear in the query. For example, "Mr. Suryansh Singh" should extract as "Suryansh Singh" but note that the title "Mr." was present.
Extract task names from queries like "someone have to check today" - the task name would be "someone have to check today" or similar descriptive text.
For "find_patients_by_lab_value" intent, extract the lab test name (e.g., "RBC", "WBC", "hemoglobin") and whether it's "low", "high", "less", "more", etc.

Return a JSON object with:
{{
    "intent": "one of the intents above",
    "patient_name": "extracted patient name or null (ONLY for get_patient_report or analyze_patient intents)",
    "task_name": "extracted task name or search term or null",
    "lab_test": "lab test name like RBC, WBC, hemoglobin, etc. or null",
    "lab_condition": "low, high, less, more, abnormal, etc. or null",
    "confidence": 0.0-1.0
}}

Examples:
- "do you have rajesh medical report" -> {{"intent": "get_patient_report", "patient_name": "rajesh", "confidence": 0.95}}
- "how many reports do we have" -> {{"intent": "count_reports", "patient_name": null, "confidence": 0.98}}
- "how many medical report you hav" -> {{"intent": "count_reports", "patient_name": null, "confidence": 0.98}} (Note: "you hav" is NOT a patient name)
- "how many medical reports" -> {{"intent": "count_reports", "patient_name": null, "confidence": 0.98}}
- "what is the medical report of John Doe" -> {{"intent": "get_patient_report", "patient_name": "John Doe", "confidence": 0.95}}
       - "show me all reports" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.95}}
       - "show me all the medical reports you have" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.95}}
- "provide me the medical report of all people" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.98}} (Note: "all people" is NOT a patient name)
- "medical report of all patients" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.98}}
- "all medical reports" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.98}}
- "reports of all people" -> {{"intent": "list_reports", "patient_name": null, "confidence": 0.98}}
- "find patient Smith" -> {{"intent": "search_patient", "patient_name": "Smith", "confidence": 0.90}}
- "summarize Rajesh's report" -> {{"intent": "summarize_report", "patient_name": "Rajesh", "confidence": 0.95}}
- "what prescription can we give to John" -> {{"intent": "suggest_prescription", "patient_name": "John", "confidence": 0.90}}
- "what are the names of all my patients" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}}
- "tell me the name of patients whose medical reports i have" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}} (Note: "i have" is NOT a patient name)
- "tell me the name of patent's whose medical reports i have" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}} (Note: handles typo "patent" and "i have" is NOT a patient name)
- "tell me the names of patients" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}}
- "what are the patient names" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}}
- "list all patient names" -> {{"intent": "get_all_patient_names", "patient_name": null, "confidence": 0.95}}
- "what is wrong with Rajesh" -> {{"intent": "analyze_patient", "patient_name": "Rajesh", "confidence": 0.95}}
- "please provide me a medical analysis of this Mr. rahul" -> {{"intent": "analyze_medical_report", "patient_name": "rahul", "confidence": 0.95}}
- "please provide me medical analysis of him" -> {{"intent": "analyze_medical_report", "patient_name": null, "confidence": 0.90}}
- "medical analysis of this person" -> {{"intent": "analyze_medical_report", "patient_name": null, "confidence": 0.90}}
- "analyze this guy" -> {{"intent": "analyze_medical_report", "patient_name": null, "confidence": 0.90}}
- "what patient have less RBC" -> {{"intent": "find_patients_by_lab_value", "lab_test": "RBC", "lab_condition": "low", "confidence": 0.95}}
- "which patients have high WBC" -> {{"intent": "find_patients_by_lab_value", "lab_test": "WBC", "lab_condition": "high", "confidence": 0.95}}
- "can you tell me all the task that are pending" -> {{"intent": "get_pending_tasks", "patient_name": null, "task_name": null, "confidence": 0.95}}
       - "tell me all the tasks" -> {{"intent": "get_all_tasks", "patient_name": null, "task_name": null, "confidence": 0.95}}
       - "what are the task i have" -> {{"intent": "get_all_tasks", "patient_name": null, "task_name": null, "confidence": 0.95}}
       - "what are the tasks i have" -> {{"intent": "get_all_tasks", "patient_name": null, "task_name": null, "confidence": 0.95}}
       - "what tasks do i have" -> {{"intent": "get_all_tasks", "patient_name": null, "task_name": null, "confidence": 0.95}}
- "someone have to check today" -> {{"intent": "search_task", "patient_name": null, "task_name": "someone have to check today", "confidence": 0.90}}
- "i want to add a task" -> {{"intent": "create_task", "patient_name": null, "task_name": null, "confidence": 0.95}}
- "i want to upload more medical reports" -> {{"intent": "upload_medical_reports", "patient_name": null, "confidence": 0.95}}
- "upload medical reports" -> {{"intent": "upload_medical_reports", "patient_name": null, "confidence": 0.95}}
- "add medical reports" -> {{"intent": "upload_medical_reports", "patient_name": null, "confidence": 0.95}}
- "cleanup invalid reports" -> {{"intent": "cleanup_reports", "patient_name": null, "confidence": 0.95}}
- "remove unknown patient reports" -> {{"intent": "cleanup_reports", "patient_name": null, "confidence": 0.95}}
- "delete invalid reports" -> {{"intent": "cleanup_reports", "patient_name": null, "confidence": 0.95}}
- "remove duplicates" -> {{"intent": "remove_duplicates", "patient_name": null, "confidence": 0.95}}
- "delete duplicate reports" -> {{"intent": "remove_duplicates", "patient_name": null, "confidence": 0.95}}
- "cleanup duplicates" -> {{"intent": "remove_duplicates", "patient_name": null, "confidence": 0.95}}

CRITICAL RULES:
1. NEVER extract patient names from count queries ("how many" + "report"/"medical")
2. NEVER extract patient names from "get_all_patient_names" queries (queries asking for all patient names)
3. NEVER extract patient names from "list_reports" queries (queries asking for all reports or reports of all people/patients)
4. Common words like "you", "hav", "have", "i", "s", "me", "my", "we", "whose", "patent", "all", "people", "patients", "everyone", "everybody", "of all" are NEVER patient names
5. If query contains "all people", "all patients", "everyone", "everybody" + "report", it's ALWAYS "list_reports"
6. Handle typos and variations gracefully
7. When in doubt about intent, prioritize count_reports, list_reports, and get_all_patient_names over get_patient_report
"""

            # Run OpenAI call in executor to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ],
                    temperature=0.1,  # Lower temperature for more consistent results
                    response_format={"type": "json_object"}
                )
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info(f"Query understanding result: {result}")
            
            # Post-process to ensure common words are not treated as patient names
            if result.get("patient_name"):
                invalid_names = ['you', 'hav', 'have', 'i', 's', 'me', 'my', 'we', 'they', 'the', 'a', 'an', 'whose', 'patent', 'patents', 'all', 'people', 'patients', 'everyone', 'everybody', 'of all', 'all people', 'all patients']
                patient_name_lower = result["patient_name"].lower()
                # Check if patient name contains invalid words
                if any(invalid in patient_name_lower for invalid in invalid_names) or len(result["patient_name"]) <= 3:
                    logger.warning(f"Invalid patient name detected: {result['patient_name']}, setting to null")
                    result["patient_name"] = None
                    # If it looks like a "list all" query, change intent
                    if any(word in patient_name_lower for word in ['all', 'people', 'patients', 'everyone']):
                        logger.info(f"Query looks like list_reports, changing intent")
                        result["intent"] = "list_reports"
            
            # Ensure count queries don't have patient names
            if result.get("intent") == "count_reports" and result.get("patient_name"):
                logger.warning(f"Count query had patient_name, removing it")
                result["patient_name"] = None
            
            # Ensure list_reports queries don't have patient names
            if result.get("intent") == "list_reports" and result.get("patient_name"):
                logger.warning(f"List reports query had patient_name, removing it")
                result["patient_name"] = None
            
            # Ensure get_all_patient_names queries don't have patient names
            if result.get("intent") == "get_all_patient_names" and result.get("patient_name"):
                logger.warning(f"Get all patient names query had patient_name, removing it")
                result["patient_name"] = None
            
            # Check if query contains "all people" or "all patients" and fix intent - MUST BE FIRST CHECK
            query_lower = query.lower()
            if any(phrase in query_lower for phrase in ['all people', 'all patients', 'everyone', 'everybody', 'of all people', 'of all patients']):
                if 'report' in query_lower or 'medical' in query_lower:
                    logger.info(f"Query contains 'all people/patients' pattern, forcing intent to list_reports")
                    result["intent"] = "list_reports"
                    result["patient_name"] = None
                    result["task_name"] = None
                    result["lab_test"] = None
                    result["lab_condition"] = None
                    return result  # Return immediately, don't process further
            
            return result
            
        except Exception as e:
            logger.error(f"Error understanding query with OpenAI: {e}")
            return self._fallback_understanding(query)
    
    def _fallback_understanding(self, query: str) -> Dict[str, Any]:
        """Fallback pattern matching when OpenAI is not available"""
        query_lower = query.lower()
        
        import re
        
        # CRITICAL: Check for "all people/patients" FIRST - before anything else
        if any(phrase in query_lower for phrase in ['all people', 'all patients', 'everyone', 'everybody', 'of all people', 'of all patients']):
            if 'report' in query_lower or 'medical' in query_lower:
                return {"intent": "list_reports", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.99}
        
        # Check for count queries (before patient name extraction)
        if 'how many' in query_lower and ('report' in query_lower or 'medical' in query_lower):
            return {"intent": "count_reports", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.9}
        
        # Check for list reports queries
        if ('list' in query_lower or 'show' in query_lower or 'provide me' in query_lower) and 'report' in query_lower:
            if 'all' in query_lower:
                return {"intent": "list_reports", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.95}
        
        # Check for patient name queries - improved patterns
        patient_name_query_patterns = [
            ('all' in query_lower or 'names' in query_lower or 'name' in query_lower) and 'patient' in query_lower,
            'tell me' in query_lower and 'name' in query_lower and 'patient' in query_lower,
            'what are' in query_lower and ('name' in query_lower or 'names' in query_lower) and 'patient' in query_lower,
            'list' in query_lower and 'patient' in query_lower and 'name' in query_lower,
            'show' in query_lower and 'patient' in query_lower and ('name' in query_lower or 'names' in query_lower),
            'whose' in query_lower and 'medical report' in query_lower and ('name' in query_lower or 'names' in query_lower),
        ]
        
        if any(patient_name_query_patterns):
            return {"intent": "get_all_patient_names", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.9}
        
        # Check for medical analysis queries (analyze_medical_report)
        analysis_patterns = [
            'medical analysis' in query_lower,
            'analyze' in query_lower and ('this' in query_lower or 'him' in query_lower or 'her' in query_lower or 'person' in query_lower or 'guy' in query_lower),
            'analysis' in query_lower and ('this' in query_lower or 'him' in query_lower or 'her' in query_lower or 'person' in query_lower or 'guy' in query_lower),
            'provide' in query_lower and 'medical analysis' in query_lower
        ]
        
        if any(analysis_patterns):
            # Try to extract patient name if mentioned
            patient_name = None
            # Check if patient name is mentioned in the query
            patient_match = re.search(r'(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][a-zA-Z\s]+)', query, re.IGNORECASE)
            if patient_match:
                patient_name = patient_match.group(1).strip()
            else:
                # Try to extract name without title
                name_match = re.search(r'(?:of|for)\s+([A-Z][a-zA-Z\s]+?)(?:\s+medical|\s+analysis|$)', query, re.IGNORECASE)
                if name_match:
                    patient_name = name_match.group(1).strip()
            
            return {"intent": "analyze_medical_report", "patient_name": patient_name, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.85}
        
        # Check for patient analysis queries (what's wrong)
        if ('wrong' in query_lower or 'problem' in query_lower or 'issue' in query_lower) and 'patient' in query_lower:
            # Try to extract patient name
            patient_match = re.search(r'(?:with|for|patient)\s+([A-Z][a-zA-Z\s]+)', query, re.IGNORECASE)
            patient_name = patient_match.group(1).strip() if patient_match else None
            return {"intent": "analyze_patient", "patient_name": patient_name, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.8}
        
        # Check for lab value queries
        lab_tests = ['rbc', 'wbc', 'hemoglobin', 'hb', 'platelet', 'glucose', 'creatinine', 'cholesterol']
        lab_conditions = ['low', 'high', 'less', 'more', 'decreased', 'increased', 'abnormal']
        found_lab_test = None
        found_condition = None
        
        for test in lab_tests:
            if test in query_lower:
                found_lab_test = test.upper()
                break
        
        for condition in lab_conditions:
            if condition in query_lower:
                found_condition = condition
                break
        
        if found_lab_test:
            return {"intent": "find_patients_by_lab_value", "patient_name": None, "task_name": None, "lab_test": found_lab_test, "lab_condition": found_condition, "confidence": 0.7}
        
        # Check for task queries - prioritize get_all_tasks and get_pending_tasks
        if 'pending' in query_lower and 'task' in query_lower:
            return {"intent": "get_pending_tasks", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.8}
        
        # Check for "get_all_tasks" - look for patterns asking about all tasks
        is_get_all_tasks = any([
            ('all' in query_lower or 'tell me' in query_lower or 'what are' in query_lower or 'what' in query_lower) and 'task' in query_lower,
            'task' in query_lower and ('have' in query_lower or 'i have' in query_lower or 'do i have' in query_lower),
            'show me' in query_lower and 'task' in query_lower,
            'list' in query_lower and 'task' in query_lower
        ])
        
        if is_get_all_tasks and not ('pending' in query_lower or 'completed' in query_lower or 'specific' in query_lower):
            return {"intent": "get_all_tasks", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.85}
        
        if ('add' in query_lower or 'create' in query_lower or 'new' in query_lower) and 'task' in query_lower:
            return {"intent": "create_task", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.8}
        
        # Check for upload medical reports queries
        if ('upload' in query_lower or 'add' in query_lower) and ('medical report' in query_lower or ('report' in query_lower and 'task' not in query_lower)):
            return {"intent": "upload_medical_reports", "patient_name": None, "task_name": None, "lab_test": None, "lab_condition": None, "confidence": 0.85}
        
        # Check for task search (specific task name) - only if it's clearly a search for a specific task
        # This should be a descriptive task name, not a general question
        if 'task' in query_lower and not ('all' in query_lower or 'pending' in query_lower or 'completed' in query_lower or 'what' in query_lower or 'tell me' in query_lower or 'show me' in query_lower or 'list' in query_lower or 'have' in query_lower):
            # Extract task name from query
            task_name = query.strip()
            return {"intent": "search_task", "patient_name": None, "task_name": task_name, "lab_test": None, "lab_condition": None, "confidence": 0.7}
        
        # Check for patient report queries (only if not a count query, not list_reports, and not a get_all_patient_names query)
        # Skip if this looks like a "get all patient names" query OR "list all reports" query
        is_get_all_names = any([
            ('name' in query_lower or 'names' in query_lower) and 'patient' in query_lower and ('all' in query_lower or 'tell me' in query_lower or 'what are' in query_lower or 'list' in query_lower or 'show' in query_lower or 'whose' in query_lower)
        ])
        
        is_list_all_reports = any(phrase in query_lower for phrase in ['all people', 'all patients', 'everyone', 'everybody', 'of all people', 'of all patients'])
        
        patient_name = None
        if not is_get_all_names and not is_list_all_reports:
            # ONLY extract patient names if query contains a title (Mr., Mrs., Dr., etc.)
            # This is CRITICAL - patient name extraction should ONLY happen with titles
            has_title = bool(re.search(r'\b(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+', query, re.IGNORECASE))
            
            if has_title:
                patient_patterns = [
                    r'(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][a-zA-Z\s]+?)(?:\s+medical|\s+report|$)',
                    r'(?:provide|show|get|find|what is).*?(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][a-zA-Z\s]+)',
                ]
                
                invalid_names = ['you', 'hav', 'have', 'i', 's', 'me', 'my', 'we', 'they', 'the', 'a', 'an', 'whose', 'patent', 'all', 'people', 'patients']
                
                for pattern in patient_patterns:
                    match = re.search(pattern, query, re.IGNORECASE)
                    if match:
                        patient_name = match.group(1).strip()
                        # Don't treat short words or invalid names as patient names
                        if len(patient_name.split()) >= 1 and len(patient_name) > 3 and patient_name.lower() not in invalid_names:
                            break
                        else:
                            patient_name = None
            # If no title, don't extract patient name - it's likely not a specific patient query
        
        # Determine intent
        # If we already determined it's list_reports or count_reports, use that
        if is_list_all_reports and ('report' in query_lower or 'medical' in query_lower):
            intent = "list_reports"
            patient_name = None
        elif patient_name and has_title:
            intent = "get_patient_report"
        elif ('find' in query_lower or 'search' in query_lower) and 'patient' in query_lower:
            intent = "search_patient"
            # Try to extract patient name
            match = re.search(r'patient.*?([A-Z][a-zA-Z\s]+)', query, re.IGNORECASE)
            if match:
                patient_name = match.group(1).strip()
        else:
            intent = "unknown"
        
        return {
            "intent": intent,
            "patient_name": patient_name,
            "task_name": None,
            "lab_test": None,
            "lab_condition": None,
            "confidence": 0.7 if patient_name else 0.5
        }

