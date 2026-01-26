import logging
from typing import List, Dict, Any, Optional
from neo4j import Session
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class KnowledgeGraphService:
    def __init__(self):
        pass
    
    async def query_condition_info(
        self,
        condition_name: str,
        neo4j_session: Session
    ) -> Dict[str, Any]:
        """
        Query comprehensive information about a medical condition
        """
        try:
            query = """
            MATCH (c:Condition {name: $condition_name})
            OPTIONAL MATCH (c)-[:HAS_SYMPTOM]->(s:Symptom)
            OPTIONAL MATCH (c)-[:TREATED_BY]->(m:Medication)
            OPTIONAL MATCH (c)-[:REQUIRES_TEST]->(t:Test)
            OPTIONAL MATCH (c)-[:REFERENCED_IN]->(g:GuidelinePassage)
            RETURN c,
                   COLLECT(DISTINCT s) as symptoms,
                   COLLECT(DISTINCT m) as medications,
                   COLLECT(DISTINCT t) as tests,
                   COLLECT(DISTINCT g) as guidelines
            """
            
            result = neo4j_session.run(query, condition_name=condition_name)
            record = result.single()
            
            if not record:
                return None
            
            condition = record["c"]
            
            return {
                "name": condition.get("name"),
                "icd10": condition.get("icd10"),
                "description": condition.get("description"),
                "symptoms": [s.get("name") for s in record["symptoms"]],
                "medications": [
                    {
                        "name": m.get("name"),
                        "class": m.get("drug_class")
                    } for m in record["medications"]
                ],
                "tests": [t.get("name") for t in record["tests"]],
                "guidelines": [
                    {
                        "title": g.get("title"),
                        "content": g.get("content")[:200]
                    } for g in record["guidelines"]
                ]
            }
        
        except Exception as e:
            logger.error(f"Error querying condition info: {e}")
            return None
    
    async def find_conditions_by_symptoms(
        self,
        symptoms: List[str],
        neo4j_session: Session
    ) -> List[Dict[str, Any]]:
        """
        Find conditions that match given symptoms
        """
        try:
            query = """
            MATCH (s:Symptom)-[:INDICATES]->(c:Condition)
            WHERE toLower(s.name) IN $symptoms
            WITH c, COUNT(s) as symptom_count
            ORDER BY symptom_count DESC
            LIMIT 10
            OPTIONAL MATCH (c)-[:REQUIRES_TEST]->(t:Test)
            RETURN c.name as condition,
                   c.icd10 as icd_code,
                   c.description as description,
                   symptom_count,
                   COLLECT(t.name) as recommended_tests
            """
            
            symptom_names = [s.lower() for s in symptoms]
            result = neo4j_session.run(query, symptoms=symptom_names)
            
            conditions = []
            for record in result:
                conditions.append({
                    "condition": record["condition"],
                    "icd_code": record.get("icd_code"),
                    "description": record.get("description"),
                    "matching_symptoms": record["symptom_count"],
                    "recommended_tests": record["recommended_tests"]
                })
            
            return conditions
        
        except Exception as e:
            logger.error(f"Error finding conditions by symptoms: {e}")
            return []
    
    async def get_drug_interactions_graph(
        self,
        drug_names: List[str],
        neo4j_session: Session
    ) -> List[Dict[str, Any]]:
        """
        Query drug interactions from knowledge graph
        """
        try:
            query = """
            MATCH (m1:Medication)-[r:INTERACTS_WITH]->(m2:Medication)
            WHERE m1.name IN $drug_names OR m2.name IN $drug_names
            RETURN m1.name as drug1,
                   m2.name as drug2,
                   r.severity as severity,
                   r.description as description
            """
            
            result = neo4j_session.run(query, drug_names=drug_names)
            
            interactions = []
            for record in result:
                interactions.append({
                    "drug1": record["drug1"],
                    "drug2": record["drug2"],
                    "severity": record.get("severity", "unknown"),
                    "description": record.get("description", "")
                })
            
            return interactions
        
        except Exception as e:
            logger.error(f"Error querying drug interactions: {e}")
            return []
    
    async def get_treatment_pathway(
        self,
        condition: str,
        severity: str,
        neo4j_session: Session
    ) -> Dict[str, Any]:
        """
        Get recommended treatment pathway for a condition
        """
        try:
            query = """
            MATCH path = (c:Condition {name: $condition})-[:TREATMENT_PATHWAY*1..3]->(step)
            WHERE step:TreatmentStep
            WITH path, step
            ORDER BY step.sequence
            RETURN COLLECT({
                step: step.name,
                description: step.description,
                duration: step.duration
            }) as pathway
            """
            
            result = neo4j_session.run(query, condition=condition)
            record = result.single()
            
            if record:
                return {
                    "condition": condition,
                    "severity": severity,
                    "pathway": record["pathway"]
                }
            
            return None
        
        except Exception as e:
            logger.error(f"Error getting treatment pathway: {e}")
            return None
    
    async def add_new_case(
        self,
        consultation_data: Dict[str, Any],
        neo4j_session: Session
    ) -> bool:
        """
        Add a new case to knowledge graph for learning
        """
        try:
            query = """
            CREATE (case:ClinicalCase {
                case_id: $case_id,
                diagnosis: $diagnosis,
                age: $age,
                gender: $gender,
                outcome: $outcome,
                date: datetime($date)
            })
            WITH case
            UNWIND $symptoms as symptom
            MERGE (s:Symptom {name: symptom})
            CREATE (case)-[:PRESENTED_WITH]->(s)
            WITH case
            UNWIND $treatments as treatment
            MERGE (t:Treatment {name: treatment})
            CREATE (case)-[:TREATED_WITH]->(t)
            """
            
            neo4j_session.run(
                query,
                case_id=consultation_data.get("consultation_id"),
                diagnosis=consultation_data.get("diagnosis"),
                age=consultation_data.get("age"),
                gender=consultation_data.get("gender"),
                outcome=consultation_data.get("outcome", "pending"),
                date=consultation_data.get("date"),
                symptoms=consultation_data.get("symptoms", []),
                treatments=consultation_data.get("treatments", [])
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Error adding new case to knowledge graph: {e}")
            return False
    
    async def search_similar_cases(
        self,
        symptoms: List[str],
        age_range: tuple,
        neo4j_session: Session
    ) -> List[Dict[str, Any]]:
        """
        Find similar historical cases
        """
        try:
            query = """
            MATCH (case:ClinicalCase)-[:PRESENTED_WITH]->(s:Symptom)
            WHERE toLower(s.name) IN $symptoms
              AND case.age >= $min_age AND case.age <= $max_age
            WITH case, COUNT(s) as matching_symptoms
            WHERE matching_symptoms >= 2
            MATCH (case)-[:TREATED_WITH]->(t:Treatment)
            RETURN case.case_id as case_id,
                   case.diagnosis as diagnosis,
                   case.outcome as outcome,
                   matching_symptoms,
                   COLLECT(t.name) as treatments
            ORDER BY matching_symptoms DESC
            LIMIT 10
            """
            
            result = neo4j_session.run(
                query,
                symptoms=[s.lower() for s in symptoms],
                min_age=age_range[0],
                max_age=age_range[1]
            )
            
            cases = []
            for record in result:
                cases.append({
                    "case_id": record["case_id"],
                    "diagnosis": record["diagnosis"],
                    "outcome": record.get("outcome"),
                    "matching_symptoms": record["matching_symptoms"],
                    "treatments": record["treatments"]
                })
            
            return cases
        
        except Exception as e:
            logger.error(f"Error searching similar cases: {e}")
            return []