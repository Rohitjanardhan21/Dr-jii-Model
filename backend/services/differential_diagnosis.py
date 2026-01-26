import logging
from typing import List, Dict, Any
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class DifferentialDiagnosisService:
    def __init__(self):
        pass
    
    async def generate_differential_diagnosis(self, symptoms: List[Dict[str, Any]], patient_history: Dict[str, Any], neo4j_session = None) -> List[Dict[str, Any]]:
        diagnoses = []
        
        symptom_names = [s.get('name', '').lower() for s in symptoms]
        symptom_texts = ' '.join([s.get('name', '').lower() + ' ' + s.get('description', '').lower() for s in symptoms])
        has_severe = any(s.get('severity', '').lower() == 'severe' for s in symptoms)
        has_fever = any('fever' in s.get('name', '').lower() or 'fever' in s.get('description', '').lower() for s in symptoms)
        has_headache = any('head' in s.get('name', '').lower() or 'headache' in s.get('name', '').lower() or 'head' in s.get('description', '').lower() for s in symptoms)
        
        # Severe headache + fever - possible meningitis
        if has_headache and has_fever and has_severe:
            diagnoses.append({
                "condition": "Possible Meningitis or Severe Infection",
                "icd_code": "G00.9",
                "probability": "high",
                "reasoning": "Severe headache with fever requires urgent evaluation to rule out meningitis or serious CNS infection",
                "recommended_tests": ["Lumbar puncture", "Blood culture", "CT/MRI head", "CSF analysis"],
                "red_flags": ["URGENT - Requires immediate medical attention"]
            })
        
        if has_fever:
            diagnoses.append({
                "condition": "Viral Infection",
                "icd_code": "B34.9",
                "probability": "high" if has_severe else "medium",
                "reasoning": f"Fever is common symptom of viral infections. {'Severe presentation requires careful monitoring.' if has_severe else ''}",
                "recommended_tests": ["Blood test", "CBC", "Blood culture"],
                "red_flags": []
            })
        
        if has_headache:
            if has_severe:
                diagnoses.append({
                    "condition": "Severe Headache - Multiple Etiologies Possible",
                    "icd_code": "R51",
                    "probability": "high",
                    "reasoning": "Severe headache requires evaluation for serious causes including migraine, tension headache, or intracranial pathology",
                    "recommended_tests": ["Neurological exam", "CT head if indicated", "Blood pressure monitoring"],
                    "red_flags": []
                })
            else:
                diagnoses.append({
                    "condition": "Tension Headache",
                    "icd_code": "G44.2",
                    "probability": "medium",
                    "reasoning": "Common headache type",
                    "recommended_tests": ["Neurological exam"],
                    "red_flags": []
                })
        
        if 'chest pain' in symptom_names:
            diagnoses.append({
                "condition": "Cardiac Event",
                "icd_code": "I20.9",
                "probability": "high",
                "reasoning": "Chest pain requires immediate evaluation",
                "recommended_tests": ["ECG", "Cardiac enzymes"],
                "red_flags": ["Seek immediate medical attention"]
            })
        
        return diagnoses[:5]
    
    async def get_similar_cases(self, symptoms: List[str], diagnosis: str, db_session) -> List[Dict[str, Any]]:
        return []