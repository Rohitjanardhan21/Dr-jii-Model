import logging
import re
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class MedicalNER:
    def __init__(self):
        self.symptom_keywords = [
            "fever", "cough", "headache", "pain", "ache", "nausea",
            "vomiting", "diarrhea", "fatigue", "weakness", "dizziness",
            "shortness of breath", "chest pain", "abdominal pain"
        ]
        
        self.medication_keywords = [
            "aspirin", "ibuprofen", "paracetamol", "amoxicillin",
            "metformin", "insulin", "lisinopril", "atorvastatin"
        ]
        
        self.test_keywords = [
            "blood test", "x-ray", "mri", "ct scan", "ultrasound",
            "ecg", "blood pressure", "glucose test", "cholesterol"
        ]
        
        self.duration_pattern = r"\b(\d+)\s*(day|days|week|weeks|month|months|year|years|hour|hours)\b"
        self.severity_keywords = ["mild", "moderate", "severe", "extreme", "slight"]
    
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        entities = []
        text_lower = text.lower()
        
        for symptom in self.symptom_keywords:
            if symptom in text_lower:
                start_idx = text_lower.find(symptom)
                entities.append({
                    "type": "symptom",
                    "value": symptom,
                    "start": start_idx,
                    "end": start_idx + len(symptom)
                })
        
        for medication in self.medication_keywords:
            if medication in text_lower:
                start_idx = text_lower.find(medication)
                entities.append({
                    "type": "medication",
                    "value": medication,
                    "start": start_idx,
                    "end": start_idx + len(medication)
                })
        
        for test in self.test_keywords:
            if test in text_lower:
                start_idx = text_lower.find(test)
                entities.append({
                    "type": "test",
                    "value": test,
                    "start": start_idx,
                    "end": start_idx + len(test)
                })
        
        duration_matches = re.finditer(self.duration_pattern, text, re.IGNORECASE)
        for match in duration_matches:
            entities.append({
                "type": "duration",
                "value": match.group(0),
                "start": match.start(),
                "end": match.end()
            })
        
        for severity in self.severity_keywords:
            if severity in text_lower:
                start_idx = text_lower.find(severity)
                entities.append({
                    "type": "severity",
                    "value": severity,
                    "start": start_idx,
                    "end": start_idx + len(severity)
                })
        
        return sorted(entities, key=lambda x: x["start"])
    
    async def extract_entities_async(self, text: str) -> List[Dict[str, Any]]:
        return self.extract_entities(text)