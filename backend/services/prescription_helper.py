import logging
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class PrescriptionHelper:
    def __init__(self):
        self.major_interactions = {
            "warfarin": ["aspirin", "nsaids", "clopidogrel"],
            "metformin": ["contrast dye"],
            "statins": ["gemfibrozil", "cyclosporine"],
        }
    
    async def suggest_medications(self, diagnosis: str, symptoms: List[str], patient_allergies: List[str], current_medications: List[str]) -> List[Dict[str, Any]]:
        """Suggest medications based on diagnosis and symptoms"""
        suggestions = []
        diagnosis_lower = diagnosis.lower()
        symptoms_lower = [s.lower() for s in symptoms]
        
        # Medication recommendations based on conditions
        medication_map = {
            'fever': {
                'medications': [
                    {'name': 'Paracetamol (Acetaminophen)', 'dosage': '500-1000mg', 'frequency': 'Every 4-6 hours', 'duration': '3-5 days', 'instructions': 'Take with food to avoid gastric irritation'},
                    {'name': 'Ibuprofen', 'dosage': '400-600mg', 'frequency': 'Every 6-8 hours', 'duration': '3-5 days', 'instructions': 'Take with food, avoid if allergic to NSAIDs'}
                ],
                'condition': 'Fever'
            },
            'headache': {
                'medications': [
                    {'name': 'Paracetamol', 'dosage': '500-1000mg', 'frequency': 'Every 4-6 hours', 'duration': '2-3 days', 'instructions': 'For mild to moderate headache'},
                    {'name': 'Ibuprofen', 'dosage': '400mg', 'frequency': 'Every 6-8 hours', 'duration': '2-3 days', 'instructions': 'For tension headache'},
                ],
                'condition': 'Headache'
            },
            'viral infection': {
                'medications': [
                    {'name': 'Paracetamol', 'dosage': '500-1000mg', 'frequency': 'Every 4-6 hours', 'duration': '5-7 days', 'instructions': 'For fever and body ache'},
                    {'name': 'Antihistamine (e.g., Cetirizine)', 'dosage': '10mg', 'frequency': 'Once daily', 'duration': '5-7 days', 'instructions': 'If associated with nasal symptoms'}
                ],
                'condition': 'Viral Infection'
            },
            'meningitis': {
                'medications': [
                    {'name': 'IV Antibiotics (Ceftriaxone)', 'dosage': '2g IV', 'frequency': 'Every 12 hours', 'duration': '10-14 days', 'instructions': 'URGENT - Requires hospitalization and immediate IV antibiotics'},
                    {'name': 'Dexamethasone', 'dosage': '10mg IV', 'frequency': 'Every 6 hours', 'duration': '4 days', 'instructions': 'Adjunctive therapy - to be given before or with first dose of antibiotics'}
                ],
                'condition': 'Possible Meningitis'
            }
        }
        
        # Check for specific conditions
        if 'meningitis' in diagnosis_lower or ('headache' in diagnosis_lower and 'fever' in diagnosis_lower):
            suggestions.extend(medication_map.get('meningitis', {}).get('medications', []))
        elif 'viral' in diagnosis_lower or 'infection' in diagnosis_lower:
            suggestions.extend(medication_map.get('viral infection', {}).get('medications', []))
        
        # Check symptoms
        if 'fever' in symptoms_lower:
            for med in medication_map.get('fever', {}).get('medications', []):
                if med not in suggestions:
                    suggestions.append(med)
        
        if 'headache' in symptoms_lower and 'meningitis' not in diagnosis_lower:
            for med in medication_map.get('headache', {}).get('medications', []):
                if med not in suggestions:
                    suggestions.append(med)
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    async def check_drug_interactions(self, new_medications: List[str], current_medications: List[str]) -> List[Dict[str, Any]]:
        interactions = []
        
        for new_med in new_medications:
            new_med_lower = new_med.lower()
            for current_med in current_medications:
                current_med_lower = current_med.lower()
                for drug, interacting_drugs in self.major_interactions.items():
                    if drug in new_med_lower:
                        for interacting in interacting_drugs:
                            if interacting in current_med_lower:
                                interactions.append({
                                    "drug1": new_med,
                                    "drug2": current_med,
                                    "severity": "major",
                                    "description": f"Interaction between {drug} and {interacting}",
                                    "recommendation": "Consider alternative"
                                })
        
        return interactions
    
    async def check_allergies(self, medications: List[str], allergies: List[str]) -> List[Dict[str, str]]:
        warnings = []
        
        for med in medications:
            med_lower = med.lower()
            for allergy in allergies:
                allergy_lower = allergy.lower()
                if allergy_lower in med_lower or med_lower in allergy_lower:
                    warnings.append({
                        "medication": med,
                        "allergy": allergy,
                        "severity": "critical",
                        "warning": f"Patient allergic to {allergy}"
                    })
        
        return warnings
    
    async def generate_prescription_document(self, consultation_id: int, doctor_info: Dict[str, Any], patient_info: Dict[str, Any], medications: List[Dict[str, Any]], db: Session) -> Dict[str, Any]:
        return {
            "prescription_id": f"RX-{consultation_id}",
            "date": datetime.now().isoformat(),
            "doctor": doctor_info,
            "patient": patient_info,
            "medications": medications
        }