from typing import List, Dict, Any
import logging
import asyncio
import json
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available.")


class MedicalInfoService:
    def __init__(self):
        self.client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.warning("OPENAI_API_KEY not set. Medical knowledge will use fallback knowledge base.")
        
        self.knowledge_base = {
            "dengue": {
                "answer": "Dengue is a mosquito-borne viral infection common in tropical and subtropical regions. Key guidelines for dengue management (2024-2025): 1) Early detection through symptoms (high fever, severe headache, pain behind eyes, joint/muscle pain, rash). 2) Laboratory diagnosis via NS1 antigen test (first 5 days) or IgM/IgG antibodies. 3) Classification: Dengue without warning signs, Dengue with warning signs (abdominal pain, persistent vomiting, fluid accumulation, bleeding, lethargy), and Severe Dengue (severe plasma leakage, severe bleeding, organ failure). 4) Treatment: Supportive care with fluid management, paracetamol for fever (avoid NSAIDs), close monitoring. 5) Warning signs requiring hospitalization: severe abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy/restlessness, liver enlargement, progressive increase in hematocrit. 6) Platelet monitoring - transfusion only if <10,000 or active bleeding. 7) Fluid resuscitation based on hydration status. Prevention focuses on vector control and personal protection.",
                "sources": ["WHO Dengue Guidelines 2024", "National Vector Borne Disease Control Programme"],
                "confidence": 0.9
            },
            "diabetes": {
                "answer": "Diabetes is a chronic condition affecting blood sugar regulation. Management includes: 1) Lifestyle modifications (diet, exercise, weight management). 2) Medications (metformin, insulin, SGLT2 inhibitors, GLP-1 agonists). 3) Regular monitoring (HbA1c every 3-6 months, blood glucose monitoring). 4) Target HbA1c <7% for most adults. 5) Management of complications (retinopathy, nephropathy, neuropathy). 6) Cardiovascular risk management. Type 2 diabetes management follows a stepwise approach starting with metformin, then adding additional agents as needed.",
                "sources": ["ADA Guidelines 2024", "Clinical Practice Guidelines"],
                "confidence": 0.85
            },
            "hypertension": {
                "answer": "Hypertension (high blood pressure) increases risk of heart disease and stroke. Management includes: 1) Lifestyle modifications (DASH diet, sodium restriction, regular exercise, weight loss, alcohol moderation). 2) Medications (ACE inhibitors, ARBs, diuretics, calcium channel blockers, beta-blockers). 3) Target BP <130/80 mmHg for most adults. 4) Regular monitoring. 5) Management of comorbidities. Treatment decisions based on BP levels and cardiovascular risk.",
                "sources": ["AHA/ACC Guidelines", "Clinical Practice Guidelines"],
                "confidence": 0.85
            },
            "fever": {
                "answer": "Fever is a temporary increase in body temperature (>38°C) often indicating infection or inflammation. Management: 1) Symptomatic treatment with paracetamol or ibuprofen. 2) Stay hydrated. 3) Rest. 4) Seek medical help if fever persists >3 days, exceeds 39.5°C, or is accompanied by severe symptoms (rash, difficulty breathing, severe headache, neck stiffness). Causes include viral/bacterial infections, inflammatory conditions, medications, or malignancies in persistent cases.",
                "sources": ["General Medical Guidelines"],
                "confidence": 0.8
            },
            "headache": {
                "answer": "Headaches can result from various causes including tension, migraines, sinusitis, or underlying conditions. Most headaches are benign. Red flags requiring immediate attention: sudden severe headache (thunderclap), headache with fever/neck stiffness, headache after head trauma, headache with neurological symptoms, headache in elderly or immunocompromised. Management depends on type: tension headaches (analgesics, stress management), migraines (triptans, preventive medications), cluster headaches (oxygen, medications). Seek medical evaluation for persistent or severe headaches.",
                "sources": ["Neurology Guidelines", "Headache Society Guidelines"],
                "confidence": 0.8
            },
            "cough": {
                "answer": "Cough is a reflex to clear airways. Causes include infections (viral/bacterial), allergies, irritants, GERD, asthma, or chronic conditions. Acute cough (<3 weeks) usually resolves. Persistent cough (>3 weeks) requires evaluation. Management: 1) Treat underlying cause. 2) Symptomatic relief (cough suppressants for dry cough, expectorants for productive cough). 3) Antibiotics only for bacterial infections. 4) Investigation if persistent (chest X-ray, spirometry, allergy testing). Chronic cough may indicate asthma, GERD, or post-nasal drip.",
                "sources": ["Respiratory Guidelines"],
                "confidence": 0.8
            }
        }
    
    async def get_medical_information(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get medical information using OpenAI for real-time knowledge and news.
        Falls back to knowledge base if OpenAI is not available.
        """
        query_lower = query.lower()
        
        # Use OpenAI for real-time medical knowledge and news
        if self.client:
            try:
                logger.info(f"Using OpenAI for medical knowledge query: {query}")
                
                system_prompt = """You are a medical knowledge assistant with access to current medical information, guidelines, research, and news. 
Your role is to provide accurate, evidence-based medical information to healthcare professionals.

When answering:
1. Provide current, up-to-date information (as of your knowledge cutoff)
2. For questions about latest news, research, or developments, provide the most recent information available
3. Cite authoritative sources when possible (WHO, CDC, medical journals, etc.)
4. Be clear, concise, and professional
5. If asked about recent news or developments, provide information about the latest known developments
6. For treatment guidelines, mention the latest evidence-based recommendations
7. Always emphasize that medical decisions should be made by qualified healthcare professionals

Format your response clearly with proper structure and bullet points where appropriate."""

                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": query}
                        ],
                        temperature=0.7,
                        max_tokens=1000
                    )
                )
                
                answer = response.choices[0].message.content
                confidence = 0.85
                sources = [{"content": "OpenAI GPT-3.5-turbo with medical knowledge", "metadata": "ai_generated"}]
                
                # Extract related topics from the query
                related_topics = []
                for topic in self.knowledge_base.keys():
                    if topic in query_lower:
                        related_topics.append(topic)
                
                if not related_topics:
                    related_topics = list(self.knowledge_base.keys())[:3]
                
                logger.info(f"OpenAI response generated successfully")
                return {
                    "answer": answer,
                    "sources": sources,
                    "confidence": confidence,
                    "related_topics": related_topics
                }
                
            except Exception as e:
                logger.error(f"Error getting medical information from OpenAI: {e}")
                # Fall through to knowledge base fallback
        
        # Fallback to knowledge base if OpenAI is not available or fails
        logger.info(f"Using knowledge base fallback for query: {query}")
        answer = ""
        sources = []
        confidence = 0.5
        related_topics = []
        
        # Check for specific keywords
        matched_topics = []
        for topic, data in self.knowledge_base.items():
            if topic in query_lower or any(keyword in query_lower for keyword in [topic + 'e', topic + ' guidelines', topic + ' treatment']):
                matched_topics.append((topic, data))
        
        # Handle special cases like "dengue guidelines 2025"
        if 'dengue' in query_lower and ('guideline' in query_lower or 'treatment' in query_lower):
            data = self.knowledge_base.get('dengue')
            if data:
                answer = data['answer']
                sources = [{"content": source, "metadata": "dengue"} for source in data.get('sources', [])]
                confidence = data.get('confidence', 0.9)
                related_topics = ['fever', 'vector-borne diseases', 'viral infections']
        
        # If no specific match, try to find best matching topic
        elif matched_topics:
            # Get the best match (first one or most relevant)
            topic, data = matched_topics[0]
            if isinstance(data, dict):
                answer = data.get('answer', '')
                sources = [{"content": source, "metadata": topic} for source in data.get('sources', [])]
                confidence = data.get('confidence', 0.8)
            else:
                answer = data
                sources = [{"content": data[:100] + "...", "metadata": topic}]
                confidence = 0.75
            
            # Get related topics
            related_topics = [t for t in self.knowledge_base.keys() if t != topic][:3]
        
        # If still no answer, provide general medical information
        if not answer:
            answer = f"Based on your query about '{query}', here is relevant medical information: "
            if any(keyword in query_lower for keyword in ['guideline', 'protocol', 'treatment', 'management']):
                answer += "Medical guidelines and treatment protocols are continuously updated. "
                answer += "For specific conditions, it's important to consult current evidence-based guidelines and consider individual patient factors. "
                answer += "Key principles include: accurate diagnosis, evidence-based treatment, monitoring response, and managing complications. "
                answer += "For the most current guidelines, refer to authoritative sources like WHO, CDC, or relevant medical specialty associations."
            else:
                answer += "Medical information should always be verified through authoritative sources and clinical guidelines. "
                answer += "Consult with healthcare professionals for personalized medical advice."
            
            confidence = 0.6
            sources = [{"content": "General medical knowledge base", "metadata": "general"}]
            related_topics = list(self.knowledge_base.keys())[:3]
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
            "related_topics": related_topics
        }
    
    async def search_guidelines(self, condition: str, guideline_type: str = None) -> List[Dict[str, Any]]:
        return []
    
    async def get_drug_information(self, drug_name: str) -> Dict[str, Any]:
        return await self.get_medical_information(f"drug information for {drug_name}")
    
    async def get_icd_codes(self, condition: str) -> List[Dict[str, str]]:
        return []