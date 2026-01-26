import logging
from typing import Dict, Any
import re

logger = logging.getLogger(__name__)

class IntentClassifier:
    def __init__(self):
        self.intent_patterns = {
            "symptom_query": [
                r"\b(symptom|symptoms|feeling|pain|ache|hurt|sick|ill)\b",
                r"\b(headache|fever|cough|cold|nausea)\b"
            ],
            "medication_query": [
                r"\b(medicine|medication|drug|prescription|dose|dosage)\b",
                r"\b(take|taking|should i take)\b"
            ],
            "test_query": [
                r"\b(test|tests|lab|blood test|x-ray|scan|mri|ct)\b",
                r"\b(need test|require test|get tested)\b"
            ],
            "appointment": [
                r"\b(appointment|schedule|book|consult|consultation)\b",
                r"\b(see doctor|visit|meet doctor)\b"
            ],
            "emergency": [
                r"\b(emergency|urgent|severe|critical|help)\b",
                r"\b(chest pain|difficulty breathing|unconscious)\b"
            ],
            "general_info": [
                r"\b(what is|tell me about|information|explain)\b",
                r"\b(how to|when to|why)\b"
            ]
        }
    
    def classify(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        scores = {}
        
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    score += 1
            scores[intent] = score
        
        if max(scores.values()) == 0:
            return {"intent": "general_info", "confidence": 0.5}
        
        best_intent = max(scores, key=scores.get)
        confidence = min(scores[best_intent] / len(self.intent_patterns[best_intent]), 1.0)
        
        return {
            "intent": best_intent,
            "confidence": confidence
        }
    
    async def classify_async(self, text: str) -> Dict[str, Any]:
        return self.classify(text)