import logging
from typing import Dict, Any, List
from models import TriageLevel

logger = logging.getLogger(__name__)

class TriageClassifier:
    def __init__(self):
        self.emergency_keywords = [
            "chest pain", "difficulty breathing", "unconscious",
            "severe bleeding", "stroke symptoms", "heart attack",
            "suicidal", "seizure", "severe trauma"
        ]
        
        self.urgent_keywords = [
            "high fever", "severe pain", "vomiting blood",
            "unable to move", "severe headache", "confusion"
        ]
        
        self.gp_keywords = [
            "persistent cough", "mild fever", "rash",
            "minor pain", "cold", "flu symptoms"
        ]
    
    def classify_triage(self, symptoms: List[Dict[str, Any]], text: str = "") -> Dict[str, Any]:
        text_lower = (text or "").lower()
        symptom_texts = " ".join([s.get("name", "") + " " + s.get("description", "") for s in symptoms]).lower()
        combined_text = text_lower + " " + symptom_texts
        
        emergency_score = sum(1 for keyword in self.emergency_keywords if keyword in combined_text)
        urgent_score = sum(1 for keyword in self.urgent_keywords if keyword in combined_text)
        gp_score = sum(1 for keyword in self.gp_keywords if keyword in combined_text)
        
        severity_check = any(s.get("severity", "").lower() == "severe" for s in symptoms)
        
        if emergency_score > 0 or severity_check:
            return {
                "triage_level": TriageLevel.EMERGENCY,
                "confidence": 0.9,
                "reasoning": "Emergency symptoms detected requiring immediate attention"
            }
        elif urgent_score > 0:
            return {
                "triage_level": TriageLevel.URGENT,
                "confidence": 0.8,
                "reasoning": "Urgent symptoms requiring prompt medical attention"
            }
        elif gp_score > 0:
            return {
                "triage_level": TriageLevel.SEE_GP,
                "confidence": 0.7,
                "reasoning": "Symptoms suggest seeing a GP for evaluation"
            }
        else:
            return {
                "triage_level": TriageLevel.SELF_CARE,
                "confidence": 0.6,
                "reasoning": "Symptoms may be manageable with self-care"
            }
    
    async def classify_triage_async(self, symptoms: List[Dict[str, Any]], text: str = "") -> Dict[str, Any]:
        return self.classify_triage(symptoms, text)