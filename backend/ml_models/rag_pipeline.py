import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self):
        self.knowledge_base = {
            "fever": "Fever is a temporary increase in body temperature. Common causes include infections. Stay hydrated and rest. Seek medical help if fever persists > 3 days or exceeds 103°F.",
            "headache": "Headaches can result from stress, dehydration, or underlying conditions. Most are benign. Consult a doctor if severe, sudden, or accompanied by neurological symptoms.",
            "cough": "Cough is a reflex to clear airways. Causes include infections, allergies, or irritants. Persistent cough > 3 weeks requires medical evaluation.",
            "chest pain": "Chest pain can indicate serious conditions like heart attack. Seek immediate emergency care if accompanied by shortness of breath, sweating, or arm pain.",
            "diabetes": "Diabetes is a chronic condition affecting blood sugar regulation. Management includes diet, exercise, medication, and regular monitoring.",
            "hypertension": "High blood pressure increases risk of heart disease and stroke. Lifestyle modifications and medications help manage it."
        }
    
    def retrieve_context(self, query: str, top_k: int = 3) -> List[str]:
        query_lower = query.lower()
        contexts = []
        
        for topic, content in self.knowledge_base.items():
            if topic in query_lower:
                contexts.append(content)
        
        if not contexts:
            contexts = [list(self.knowledge_base.values())[0]]
        
        return contexts[:top_k]
    
    def generate_response(self, query: str, contexts: List[str]) -> Dict[str, Any]:
        if not contexts:
            return {
                "answer": "I don't have enough information to answer that question accurately. Please consult a healthcare professional.",
                "sources": [],
                "confidence": 0.3
            }
        
        answer = contexts[0] if contexts else "Information not available."
        
        return {
            "answer": answer,
            "sources": [{"content": c[:100] + "...", "relevance": 0.8} for c in contexts],
            "confidence": 0.75
        }
    
    async def query(self, question: str) -> Dict[str, Any]:
        contexts = self.retrieve_context(question)
        response = self.generate_response(question, contexts)
        return response