import logging
from typing import List, Dict, Any, Tuple
import re

logger = logging.getLogger(__name__)


class EmergencyDetector:
    def __init__(self):
        # Define emergency red flags
        self.red_flags = {
            "cardiac": [
                "chest pain", "chest pressure", "crushing chest pain",
                "pain radiating to arm", "pain radiating to jaw",
                "severe shortness of breath", "irregular heartbeat",
                "loss of consciousness", "syncope"
            ],
            "neurological": [
                "sudden severe headache", "worst headache of life",
                "severe headache", "high pain in the head", "head pain",
                "headache with fever", "headache and fever",
                "loss of consciousness", "seizure", "convulsion",
                "sudden confusion", "difficulty speaking", "slurred speech",
                "facial drooping", "arm weakness", "leg weakness",
                "sudden vision loss", "double vision", "sudden dizziness",
                "neck stiffness", "stiff neck"
            ],
            "respiratory": [
                "severe difficulty breathing", "unable to speak in sentences",
                "gasping for air", "blue lips", "blue fingernails",
                "choking", "airway obstruction"
            ],
            "trauma": [
                "severe bleeding", "uncontrolled bleeding",
                "bleeding that won't stop", "severe injury",
                "major trauma", "deep wound", "head injury"
            ],
            "abdominal": [
                "severe abdominal pain", "rigid abdomen",
                "distended abdomen", "vomiting blood", "blood in stool",
                "black tarry stool"
            ],
            "poisoning": [
                "overdose", "poisoning", "toxic ingestion",
                "chemical exposure"
            ],
            "allergic": [
                "severe allergic reaction", "anaphylaxis",
                "throat swelling", "difficulty swallowing",
                "widespread rash with breathing difficulty"
            ],
            "psychiatric": [
                "suicidal thoughts", "homicidal thoughts",
                "harm to self", "harm to others"
            ]
        }
        
        # Vital sign thresholds
        self.vital_thresholds = {
            "heart_rate": {"low": 50, "high": 120},
            "blood_pressure_systolic": {"low": 90, "high": 180},
            "blood_pressure_diastolic": {"low": 60, "high": 110},
            "respiratory_rate": {"low": 12, "high": 25},
            "temperature": {"low": 35.0, "high": 39.5},  # Celsius
            "oxygen_saturation": {"low": 92}
        }
    
    async def detect_emergency(
        self,
        symptoms: List[Dict[str, Any]],
        vital_signs: Dict[str, float] = None
    ) -> Tuple[bool, List[str], str]:
        """
        Detect if symptoms indicate an emergency
        Returns: (is_emergency, red_flags_found, triage_level)
        """
        red_flags_found = []
        is_emergency = False
        triage_level = "see_gp"  # Default
        
        # Check for severe headache + fever combination (possible meningitis) - check early
        has_headache = any('head' in s.get('name', '').lower() or 'headache' in s.get('name', '').lower() or 'head' in s.get('description', '').lower() for s in symptoms)
        has_fever = any('fever' in s.get('name', '').lower() or 'fever' in s.get('description', '').lower() or 'temperature' in s.get('description', '').lower() for s in symptoms)
        has_severe = any(s.get('severity', '').lower() == 'severe' for s in symptoms)
        
        # Check symptoms against red flags
        for symptom in symptoms:
            symptom_text = symptom.get('name', '').lower() + " " + symptom.get('description', '').lower()
            
            for category, flags in self.red_flags.items():
                for flag in flags:
                    if self._fuzzy_match(flag, symptom_text):
                        red_flags_found.append({
                            "category": category,
                            "flag": flag,
                            "symptom": symptom.get('name')
                        })
                        is_emergency = True
            
            # Check severity
            severity = symptom.get('severity', '').lower()
            if severity == 'severe':
                # Certain severe symptoms are emergencies
                symptom_name_lower = symptom.get('name', '').lower()
                
                # Severe headache or head pain is urgent/emergency
                if any(word in symptom_name_lower for word in ['headache', 'head', 'pain']):
                    is_emergency = True
                    red_flags_found.append({
                        "category": "neurological",
                        "flag": f"Severe headache/head pain - requires urgent evaluation",
                        "symptom": symptom.get('name')
                    })
                
                # Severe symptoms with pain, bleeding, breathing, chest
                if any(word in symptom_text for word in ['pain', 'bleeding', 'breathing', 'chest']):
                    is_emergency = True
                    red_flags_found.append({
                        "category": "severity",
                        "flag": f"Severe {symptom.get('name')}",
                        "symptom": symptom.get('name')
                    })
        
        # Check for severe headache + fever combination (possible meningitis)
        if has_headache and has_fever and has_severe:
            is_emergency = True
            red_flags_found.append({
                "category": "neurological",
                "flag": "Severe headache with fever - possible meningitis or serious infection (URGENT)",
                "symptom": "Headache + Fever"
            })
        
        # Check vital signs if provided
        if vital_signs:
            vital_red_flags = self._check_vital_signs(vital_signs)
            if vital_red_flags:
                red_flags_found.extend(vital_red_flags)
                is_emergency = True
        
        # Determine triage level
        if is_emergency:
            # Check if immediate emergency (life-threatening)
            life_threatening_categories = ["cardiac", "respiratory", "neurological", "trauma"]
            if any(rf["category"] in life_threatening_categories for rf in red_flags_found):
                triage_level = "emergency"
            else:
                triage_level = "urgent"
        else:
            # Check if should see GP soon
            # Severe headache + fever should be urgent
            if has_headache and has_fever and has_severe:
                triage_level = "urgent"
                is_emergency = True
            elif any(s.get('severity') == 'moderate' for s in symptoms):
                triage_level = "see_gp"
            else:
                triage_level = "self_care"
        
        return is_emergency, red_flags_found, triage_level
    
    def _fuzzy_match(self, pattern: str, text: str) -> bool:
        """
        Check if pattern matches text with some flexibility
        """
        # Simple word-based matching
        pattern_words = set(pattern.lower().split())
        text_words = set(text.lower().split())
        
        # Check if all pattern words are in text
        if pattern_words.issubset(text_words):
            return True
        
        # Check if pattern appears as substring
        if pattern.lower() in text.lower():
            return True
        
        return False
    
    def _check_vital_signs(self, vital_signs: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Check if vital signs are abnormal
        """
        red_flags = []
        
        for vital, value in vital_signs.items():
            if vital not in self.vital_thresholds:
                continue
            
            thresholds = self.vital_thresholds[vital]
            
            if 'low' in thresholds and value < thresholds['low']:
                red_flags.append({
                    "category": "vital_signs",
                    "flag": f"Low {vital.replace('_', ' ')}: {value}",
                    "symptom": vital
                })
            
            if 'high' in thresholds and value > thresholds['high']:
                red_flags.append({
                    "category": "vital_signs",
                    "flag": f"High {vital.replace('_', ' ')}: {value}",
                    "symptom": vital
                })
        
        return red_flags
    
    async def get_emergency_instructions(self, red_flags: List[Dict[str, Any]]) -> str:
        """
        Generate emergency instructions based on red flags
        """
        if not red_flags:
            return "No emergency detected. Proceed with normal consultation."
        
        instructions = "⚠️ EMERGENCY RED FLAGS DETECTED ⚠️\n\n"
        
        categories = set(rf['category'] for rf in red_flags)
        
        if "cardiac" in categories:
            instructions += "CARDIAC EMERGENCY:\n"
            instructions += "- Call emergency services (ambulance) immediately\n"
            instructions += "- Have patient sit or lie down\n"
            instructions += "- Give aspirin if not allergic (if suspected heart attack)\n"
            instructions += "- Prepare for CPR if needed\n\n"
        
        if "neurological" in categories:
            instructions += "NEUROLOGICAL EMERGENCY (Possible Stroke):\n"
            instructions += "- Call emergency services immediately\n"
            instructions += "- Note time symptoms started (critical for treatment)\n"
            instructions += "- Keep patient safe and comfortable\n"
            instructions += "- Do NOT give food or water\n\n"
        
        if "respiratory" in categories:
            instructions += "RESPIRATORY EMERGENCY:\n"
            instructions += "- Call emergency services immediately\n"
            instructions += "- Help patient sit upright\n"
            instructions += "- Check for inhaler if patient has asthma\n"
            instructions += "- Prepare for emergency airway management\n\n"
        
        if "trauma" in categories or "severe bleeding" in [rf['flag'].lower() for rf in red_flags]:
            instructions += "TRAUMA/BLEEDING EMERGENCY:\n"
            instructions += "- Call emergency services immediately\n"
            instructions += "- Apply direct pressure to bleeding\n"
            instructions += "- Elevate injured area if possible\n"
            instructions += "- Keep patient warm and still\n\n"
        
        if "allergic" in categories:
            instructions += "ALLERGIC REACTION EMERGENCY:\n"
            instructions += "- Call emergency services immediately\n"
            instructions += "- Administer EpiPen if available\n"
            instructions += "- Lay patient flat\n"
            instructions += "- Monitor breathing closely\n\n"
        
        instructions += "Red Flags Detected:\n"
        for rf in red_flags:
            instructions += f"- {rf['flag']}\n"
        
        return instructions