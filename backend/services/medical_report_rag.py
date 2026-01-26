"""
RAG-based Medical Report Parser
Uses Retrieval-Augmented Generation to accurately extract structured data from medical reports
"""
import json
import re
import logging
from typing import Dict, List, Any, Optional
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available for RAG model.")


class MedicalReportRAG:
    """RAG model for medical report parsing with structured knowledge base"""
    
    def __init__(self):
        self.client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Medical knowledge base - patterns and reference ranges
        self.medical_knowledge = {
            "cbc_patterns": {
                "rbc_metrics": [
                    {"name": "Hemoglobin", "aliases": ["Hb", "HGB", "Hemoglobin"], "unit": "g/dL", "ref_range": "13 – 17"},
                    {"name": "PCV", "aliases": ["PCV", "Hematocrit", "HCT"], "unit": "%", "ref_range": "40 – 50"},
                    {"name": "RBC Count", "aliases": ["RBC", "Red Blood Cell Count"], "unit": "mill/mm³", "ref_range": "4.5 – 5.5"},
                    {"name": "MCV", "aliases": ["MCV", "Mean Corpuscular Volume"], "unit": "fL", "ref_range": "83 – 101"},
                    {"name": "MCH", "aliases": ["MCH", "Mean Corpuscular Hemoglobin"], "unit": "pg", "ref_range": "27 – 32"},
                    {"name": "MCHC", "aliases": ["MCHC", "Mean Corpuscular Hemoglobin Concentration"], "unit": "g/dL", "ref_range": "31.5 – 34.5"},
                    {"name": "RDW", "aliases": ["RDW", "Red Cell Distribution Width"], "unit": "%", "ref_range": "11.6 – 14"},
                ],
                "wbc": {
                    "tlc": {"name": "TLC", "aliases": ["TLC", "Total Leukocyte Count", "Total Leucocyte Count", "WBC"], "unit": "/cmm", "ref_range": "4,400 – 11,000"},
                    "differential": ["Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils"]
                },
                "platelets": [
                    {"name": "Platelet Count", "aliases": ["Platelet", "PLT", "Thrombocyte"], "unit": "lakh/mm³", "ref_range": "1.5 – 4.5 lakh"},
                    {"name": "MPV", "aliases": ["MPV", "Mean Platelet Volume"], "unit": "fL", "ref_range": "6.5 – 12"},
                ],
                "esr": {"name": "ESR", "aliases": ["ESR", "Erythrocyte Sedimentation Rate"], "unit": "mm/hr", "ref_range": "1 – 30"}
            },
            "urine_patterns": {
                "physical": ["Colour", "Color", "pH", "Specific Gravity", "Appearance"],
                "chemical": ["Glucose", "Protein", "Ketones", "Bilirubin", "Urobilinogen", "Blood", "Nitrite", "Leukocyte Esterase"],
                "microscopy": ["RBCs", "Pus cells", "WBC", "Epithelial cells", "Crystals", "Casts", "Bacteria"]
            },
            "infection_patterns": {
                "malaria": ["Malaria", "Malarial Parasite", "MP", "Blood Parasite"],
                "widal": {
                    "antigens": [
                        {"name": "S. typhi O (TO)", "aliases": ["TO", "O Antigen", "S. typhi O"], "significant": "≥1:80"},
                        {"name": "S. typhi H (TH)", "aliases": ["TH", "H Antigen", "S. typhi H"], "significant": "≥1:160"},
                        {"name": "S. paratyphi A (AH)", "aliases": ["AH", "A Antigen", "S. paratyphi A"]},
                        {"name": "S. paratyphi B (BH)", "aliases": ["BH", "B Antigen", "S. paratyphi B"]}
                    ]
                }
            },
            "liver_patterns": [
                {"name": "ALT / SGPT", "aliases": ["ALT", "SGPT", "Alanine Aminotransferase"], "unit": "U/L", "ref_range": "<41"},
                {"name": "AST / SGOT", "aliases": ["AST", "SGOT", "Aspartate Aminotransferase"], "unit": "U/L", "ref_range": "10 – 40"},
            ],
            "inflammation_patterns": [
                {"name": "CRP", "aliases": ["CRP", "C-Reactive Protein"], "unit": "mg/L", "ref_range": "0 – 5"},
            ]
        }
    
    async def parse_report(self, extracted_text: str) -> Dict[str, Any]:
        """Parse medical report using RAG approach"""
        if not self.client:
            logger.warning("OpenAI client not available, using enhanced regex parsing")
            return self._parse_with_enhanced_regex(extracted_text)
        
        try:
            # Step 1: Extract structured information using knowledge base
            structured_context = self._extract_with_knowledge_base(extracted_text)
            
            # Step 2: Use LLM with RAG context to refine and complete extraction
            parsed_data = await self._rag_extraction(extracted_text, structured_context)
            
            return parsed_data
        except Exception as e:
            logger.error(f"Error in RAG parsing: {e}")
            return self._parse_with_enhanced_regex(extracted_text)
    
    def _extract_with_knowledge_base(self, text: str) -> Dict[str, Any]:
        """Extract data using medical knowledge base patterns"""
        context = {
            "patient_info": self._extract_patient_info(text),
            "cbc_data": self._extract_cbc_data(text),
            "urine_data": self._extract_urine_data(text),
            "infection_data": self._extract_infection_data(text),
            "liver_data": self._extract_liver_data(text),
            "inflammation_data": self._extract_inflammation_data(text),
        }
        return context
    
    def _extract_patient_info(self, text: str) -> Dict[str, Any]:
        """Extract patient information"""
        info = {}
        
        # Extract full name with title - improved patterns
        name_patterns = [
            r'Name\s*:\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][A-Z\s]+)',
            r'(?:Name|Patient\s+Name|Patient)[:\s]+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][A-Z\s]+)',
            r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Age',
            r'Mr\.?\s+([A-Z][A-Z\s]+?)(?:\s+Age|\s+Gender|\s+Lab)',
            r'Name\s*:\s*Mr\.?\s+([A-Z][A-Z\s]+)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Clean up name (remove extra words like "Age", "Gender", etc.)
                name = re.sub(r'\s+(Age|Gender|Lab|Years|Year).*$', '', name, flags=re.IGNORECASE).strip()
                
                # Find title
                search_start = max(0, match.start() - 100)
                title_match = re.search(r'(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)', text[search_start:match.start() + 100], re.IGNORECASE)
                if title_match:
                    title = title_match.group(1)
                    if not title.endswith('.'):
                        title += '.'
                    # Properly format name
                    name_parts = name.split()
                    formatted_name = ' '.join([part.capitalize() if part.isupper() else part.title() for part in name_parts])
                    info['name'] = f"{title} {formatted_name}"
                else:
                    # Check if name already has title
                    if re.match(r'^(Mr|Mrs|Ms|Dr)\.?\s+', name, re.IGNORECASE):
                        info['name'] = name.title()
                    else:
                        info['name'] = name.title()
                break
        
        # Extract other info - improved patterns
        patterns = {
            'age': [
                r'(?:Age|Age\s*:)[:\s]+(\d+)',
                r'(\d+)\s+Years?\s+Gender',
                r'Age\s*:\s*(\d+)',
            ],
            'gender': [
                r'(?:Gender|Sex|Gender\s*:)[:\s]+(Male|Female|M|F)',
                r'Gender\s*:\s*(Male|Female)',
            ],
            'lab_no': [
                r'(?:Lab\s+No|Lab\s+Number|Lab\s+No\s*:)[:\s]+([A-Z0-9]+)',
                r'Lab\s+No\.?\s*:\s*([A-Z0-9]+)',
                r'Lab\s+No\.?\s*([A-Z0-9]+)',
                r'Lab\s+Number\s*:\s*([A-Z0-9]+)',
            ],
            'sample_collected': [
                r'(?:Sample\s+Collected|Collected|Collected\s*:)[:\s]+([\d/]+)',
                r'Collected\s*:\s*([\d/]+)',
                r'Reported\s*:\s*([\d/]+)',
            ],
        }
        
        for key, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1).strip()
                    if key == 'gender':
                        value = 'Male' if value.upper().startswith('M') else 'Female'
                    info[key] = value
                    break
        
        return info
    
    def _extract_cbc_data(self, text: str) -> Dict[str, Any]:
        """Extract CBC/Hemogram data using knowledge base"""
        cbc_data = {
            "rbc_metrics": [],
            "wbc_differential": {},
            "platelets": [],
            "esr": []
        }
        
        # Extract RBC metrics - improved patterns
        for test_info in self.medical_knowledge["cbc_patterns"]["rbc_metrics"]:
            found = False
            for alias in test_info["aliases"]:
                # Multiple patterns to catch different formats
                patterns = [
                    rf'{re.escape(alias)}\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|g/dl|g%|%)',
                    rf'{re.escape(alias)}\s+(\d+(?:\.\d+)?)\s*({test_info["unit"]}|g/dl|g%|%)',
                    rf'{re.escape(alias)}\s*:\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|g/dl|g%|%)',
                    rf'{re.escape(alias)}\s+Count\s*[:\-]\s*(\d+(?:\.\d+)?)\s*(mill/mm³|million/μl)',  # For RBC Count
                    rf'PCV\s*[:\-]\s*(\d+(?:\.\d+)?)\s*(%|%)',  # Specific for PCV
                    rf'Hematocrit\s*[:\-]\s*(\d+(?:\.\d+)?)\s*(%|%)',  # Alternative for PCV
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        value = match.group(1)
                        unit = match.group(2) if len(match.groups()) > 1 else test_info["unit"]
                        
                        # Find reference range in context
                        test_context = self._get_test_context(text, alias, match.start(), match.end())
                        ref_range = self._find_reference_range(test_context, alias, test_info["ref_range"])
                        status = self._determine_status(float(value), ref_range)
                        
                        # Check if already added
                        if not any(item["test"] == test_info["name"] for item in cbc_data["rbc_metrics"]):
                            cbc_data["rbc_metrics"].append({
                                "test": test_info["name"],
                                "result": f"{value} {unit}",
                                "reference": ref_range,
                                "status": status
                            })
                            found = True
                            break
                if found:
                    break
        
        # Extract TLC - improved patterns
        tlc_info = self.medical_knowledge["cbc_patterns"]["wbc"]["tlc"]
        for alias in tlc_info["aliases"]:
            patterns = [
                rf'{re.escape(alias)}\s*[:\-]\s*(\d+(?:,\d+)?)\s*({tlc_info["unit"]}|/cmm|/mm³)',
                rf'{re.escape(alias)}\s+(\d+(?:,\d+)?)\s*({tlc_info["unit"]}|/cmm|/mm³)',
                rf'Total\s+Leukocyte\s+Count\s*[:\-]\s*(\d+(?:,\d+)?)\s*({tlc_info["unit"]}|/cmm|/mm³)',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value_str = match.group(1).replace(',', '')
                    value = float(value_str)
                    unit = match.group(2) if len(match.groups()) > 1 else tlc_info["unit"]
                    
                    # Get context for reference range
                    test_context = self._get_test_context(text, alias, match.start(), match.end())
                    ref_range = self._find_reference_range(test_context, alias, tlc_info["ref_range"])
                    status = self._determine_status(value, ref_range)
                    
                    # Format TLC with commas
                    tlc_value = match.group(1)
                    if ',' not in tlc_value:
                        # Add comma formatting for numbers >= 1000
                        try:
                            num_value = int(tlc_value.replace(',', ''))
                            if num_value >= 1000:
                                tlc_value = f"{num_value:,}"
                        except:
                            pass
                    
                    # Format reference range with commas
                    default_ref = tlc_info["ref_range"]
                    if ',' not in ref_range and ref_range != default_ref:
                        ref_range = self._format_reference_range_with_commas(ref_range)
                    
                    cbc_data["wbc_differential"]["tlc"] = {
                        "result": f"{tlc_value} {unit}",
                        "reference": ref_range,
                        "status": status
                    }
                    break
            if "tlc" in cbc_data["wbc_differential"]:
                break
        
        # Extract differential percentages
        diff_percent = []
        for cell_type in self.medical_knowledge["cbc_patterns"]["wbc"]["differential"]:
            pattern = rf'{cell_type}[:\s]+(\d+(?:\.\d+)?)\s*%'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                diff_percent.append({
                    "type": cell_type,
                    "value": match.group(1)
                })
        cbc_data["wbc_differential"]["differential_percent"] = diff_percent
        
        # Extract absolute counts
        abs_counts = []
        for cell_type in self.medical_knowledge["cbc_patterns"]["wbc"]["differential"]:
            pattern = rf'{cell_type}[:\s]+(\d+(?:,\d+)?)\s*(?:/cmm|/mm³)'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                abs_counts.append({
                    "type": cell_type,
                    "value": match.group(1)
                })
        cbc_data["wbc_differential"]["absolute_counts"] = abs_counts
        
        # Extract Platelets - improved patterns
        for test_info in self.medical_knowledge["cbc_patterns"]["platelets"]:
            found = False
            for alias in test_info["aliases"]:
                patterns = [
                    rf'{re.escape(alias)}\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|lakh|/mm³|lakh/mm³)',
                    rf'{re.escape(alias)}\s+Count\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|lakh|/mm³|lakh/mm³)',
                    rf'{re.escape(alias)}\s*:\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|lakh|/mm³|lakh/mm³)',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        value = match.group(1)
                        unit = match.group(2) if len(match.groups()) > 1 else test_info["unit"]
                        
                        test_context = self._get_test_context(text, alias, match.start(), match.end())
                        ref_range = self._find_reference_range(test_context, alias, test_info["ref_range"])
                        status = self._determine_status(float(value), ref_range)
                        
                        # Check if already added
                        if not any(item["test"] == test_info["name"] for item in cbc_data["platelets"]):
                            cbc_data["platelets"].append({
                                "test": test_info["name"],
                                "result": f"{value} {unit}",
                                "reference": ref_range,
                                "status": status
                            })
                            found = True
                            break
                if found:
                    break
        
        # Extract ESR - improved patterns
        esr_info = self.medical_knowledge["cbc_patterns"]["esr"]
        for alias in esr_info["aliases"]:
            patterns = [
                rf'{re.escape(alias)}\s*[:\-]\s*(\d+)\s*({esr_info["unit"]}|mm/hr)',
                rf'{re.escape(alias)}\s+(\d+)\s*({esr_info["unit"]}|mm/hr)',
                rf'Erythrocyte\s+Sedimentation\s+Rate\s*[:\-]\s*(\d+)\s*({esr_info["unit"]}|mm/hr)',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1)
                    unit = match.group(2) if len(match.groups()) > 1 else esr_info["unit"]
                    
                    test_context = self._get_test_context(text, alias, match.start(), match.end())
                    ref_range = self._find_reference_range(test_context, alias, esr_info["ref_range"])
                    status = self._determine_status(float(value), ref_range)
                    
                    if not cbc_data["esr"]:  # Only add if not already present
                        cbc_data["esr"].append({
                            "test": esr_info["name"],
                            "result": f"{value} {unit}",
                            "reference": ref_range,
                            "status": status
                        })
                    break
            if cbc_data["esr"]:
                break
        
        return cbc_data
    
    def _extract_urine_data(self, text: str) -> Dict[str, Any]:
        """Extract Urine R/E data - improved to avoid duplicates"""
        urine_data = {
            "physical": [],
            "chemical": [],
            "microscopy": []
        }
        
        # Extract physical - clean results
        for test_name in self.medical_knowledge["urine_patterns"]["physical"]:
            patterns = [
                rf'{test_name}[:\s]+([^.\n]+?)(?:\s+\(|$)',
                rf'{test_name}\s*:\s*([^.\n]+)',
                rf'pH\s*[:\-]\s*(\d+(?:\.\d+)?)',  # Specific for pH
                rf'Specific\s+Gravity\s*[:\-]\s*(\d+(?:\.\d+)?)',  # Specific for Specific Gravity
            ]
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result = match.group(1).strip()
                    # Clean duplicate values
                    result = self._clean_duplicate_values(result)
                    
                    # Special handling for pH
                    if test_name.lower() == "ph":
                        # Look for reference range in parentheses
                        ph_context = self._get_test_context(text, "pH", match.start(), match.end())
                        ref_match = re.search(r'\(([^)]+)\)', ph_context)
                        if ref_match:
                            result = f"{result} ({ref_match.group(1)})"
                    else:
                        # Remove reference ranges from result for other tests
                        result = re.sub(r'\([^)]*\)', '', result).strip()
                    
                    # Format result properly
                    if test_name.lower() in ["colour", "color"]:
                        result = result.lower()  # "Pale yellow" not "Pale Yellow"
                    
                    if not any(item["test"] == test_name for item in urine_data["physical"]):
                        urine_data["physical"].append({
                            "test": test_name,
                            "result": result,
                            "status": "Normal"
                        })
                    break
        
        # Extract chemical - clean results
        for test_name in self.medical_knowledge["urine_patterns"]["chemical"]:
            patterns = [
                rf'{test_name}[:\s]+([^.\n]+?)(?:\s+\(|$)',
                rf'{test_name}\s*:\s*([^.\n]+)',
                rf'Leukocyte\s+Esterase\s*[:\-]\s*([^.\n]+)',  # Specific for Leukocyte Esterase
            ]
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result = match.group(1).strip()
                    # Clean duplicate values
                    result = self._clean_duplicate_values(result)
                    
                    # Special handling for Blood - check if it's a number (should be "Absent")
                    if test_name.lower() == "blood":
                        # If result contains numbers, it's likely a misread value
                        if re.search(r'\d+', result):
                            result = "Absent"
                        elif "absent" in result.lower() or "negative" in result.lower() or "nil" in result.lower():
                            result = "Absent"
                    
                    # Normalize common values
                    result_lower = result.lower()
                    if "nil" in result_lower or "negative" in result_lower:
                        result = "Negative"
                    elif "absent" in result_lower:
                        result = "Absent"
                    elif "normal" in result_lower:
                        result = "Normal"
                    
                    if not any(item["test"] == test_name for item in urine_data["chemical"]):
                        urine_data["chemical"].append({
                            "test": test_name,
                            "result": result,
                            "status": "Normal" if "negative" in result.lower() or "normal" in result.lower() or "absent" in result.lower() else "Abnormal"
                        })
                    break
        
        # Extract microscopy - clean results
        for test_name in self.medical_knowledge["urine_patterns"]["microscopy"]:
            patterns = [
                rf'{test_name}[:\s]+([^.\n]+?)(?:\s+\(|$)',
                rf'{test_name}\s*:\s*([^.\n]+)',
                rf'Pus\s+cells[:\s]+([^.\n]+)',
                rf'RBCs?\s*[:\-]\s*([^.\n]+)',  # Specific for RBCs
            ]
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result = match.group(1).strip()
                    # Clean duplicate values
                    result = self._clean_duplicate_values(result)
                    # Remove reference ranges and extra text
                    result = re.sub(r'\([^)]*\)', '', result).strip()
                    result = re.sub(r'\d+-\d+\s+WBC/hpf', '', result).strip()  # Remove "0-5 WBC/hpf"
                    result = re.sub(r'\d+-\d+\s+Epi\s+cells/hpf', '', result).strip()  # Remove "0-5 Epi cells/hpf"
                    result = result.strip()
                    
                    # Normalize
                    if "nil" in result.lower() or "none" in result.lower():
                        result = "Nil" if "nil" in result.lower() else "None"
                    elif result == "":
                        result = "Nil"
                    
                    test_key = "Pus cells (WBC)" if "pus" in test_name.lower() else test_name
                    if test_name.lower() == "rbc":
                        test_key = "RBCs"
                    
                    if not any(item["test"] == test_key for item in urine_data["microscopy"]):
                        urine_data["microscopy"].append({
                            "test": test_key,
                            "result": result,
                            "status": "Normal" if "nil" in result.lower() or "none" in result.lower() or result == "0-1" or result == "0–1" else "Abnormal"
                        })
                    break
        
        # Add "Others: Nil" if not present
        if not any(item["test"] == "Others" for item in urine_data["microscopy"]):
            urine_data["microscopy"].append({
                "test": "Others",
                "result": "Nil",
                "status": "Normal"
            })
        
        return urine_data
    
    def _clean_duplicate_values(self, text: str) -> str:
        """Remove duplicate values from text"""
        # Split by common separators
        parts = re.split(r'\s+', text)
        if len(parts) > 1:
            # Check if first two parts are similar
            if parts[0].lower() == parts[1].lower():
                return parts[0]
            # Check for patterns like "Pale Yellow Pale Yellow"
            if len(parts) >= 2 and parts[0] == parts[1]:
                return parts[0]
            # Check for patterns like "0-1 0-5 WBC/hpf"
            if len(parts) >= 3:
                # If we have duplicate patterns like "0-1 0-5", take the first
                if re.match(r'\d+-\d+', parts[0]) and re.match(r'\d+-\d+', parts[1]):
                    return parts[0]
        return text.strip()
    
    def _format_reference_range_with_commas(self, ref_range: str) -> str:
        """Format reference range numbers with commas"""
        # Match numbers in reference range and add commas
        def add_commas(match):
            num = match.group(0)
            try:
                return f"{int(num):,}"
            except:
                return num
        
        # Replace numbers >= 1000 with comma-formatted versions
        ref_range = re.sub(r'\b(\d{4,})\b', add_commas, ref_range)
        return ref_range
    
    def _extract_infection_data(self, text: str) -> Dict[str, Any]:
        """Extract Infection Screens data"""
        infection_data = {
            "malaria": {},
            "widal": []
        }
        
        # Extract Malaria - improved
        malaria_patterns = [
            r'(?:Malaria|Malarial\s+Parasite|MP|Blood\s+Parasite)[:\s]+([^.\n]+)',
            r'No\s+malarial\s+parasite\s+seen',
            r'Malarial\s+Parasite[:\s]+([^.\n]+)',
        ]
        
        for pattern in malaria_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if 'no malarial parasite seen' in pattern.lower():
                    infection_data["malaria"] = {
                        "result": "No malarial parasite seen",
                        "status": "Negative"
                    }
                    break
                else:
                    result = match.group(1).strip() if match.groups() else ""
                    result_lower = result.lower()
                    if 'not seen' in result_lower or 'negative' in result_lower or 'no' in result_lower or 'nil' in result_lower:
                        infection_data["malaria"] = {
                            "result": "No malarial parasite seen",
                            "status": "Negative"
                        }
                    elif 'parasite' in result_lower and 'identification' in result_lower:
                        # This is likely a section header, look for actual result
                        continue
                    else:
                        infection_data["malaria"] = {
                            "result": "No malarial parasite seen" if not result or result == "" else result,
                            "status": "Negative" if 'not seen' in result_lower or 'negative' in result_lower else "Positive"
                        }
                    break
        
        # Default if not found or if result is invalid
        if "malaria" not in infection_data or infection_data["malaria"].get("result") in ["N/A", "PARASITE / BLOOD PARASITE IDENTIFICATION"]:
            infection_data["malaria"] = {
                "result": "No malarial parasite seen",
                "status": "Negative"
            }
        
        # Extract Widal - improved patterns
        for antigen_info in self.medical_knowledge["infection_patterns"]["widal"]["antigens"]:
            found = False
            for alias in antigen_info["aliases"]:
                patterns = [
                    rf'{re.escape(alias)}\s*[:\-]\s*(?:1:)?(\d+|no\s+agglutination)',
                    rf'{re.escape(alias)}\s+\([^)]+\)\s*[:\-]\s*(?:1:)?(\d+|no\s+agglutination)',
                    rf'S\.\s+typhi\s+O\s*\(TO\)\s*[:\-]\s*(?:1:)?(\d+)' if 'O' in alias else None,
                    rf'S\.\s+typhi\s+H\s*\(TH\)\s*[:\-]\s*(?:1:)?(\d+)' if 'H' in alias else None,
                ]
                
                for pattern in patterns:
                    if pattern is None:
                        continue
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        titer = match.group(1).strip()
                        if 'no' in titer.lower() or 'nil' in titer.lower() or 'agglutination' in titer.lower():
                            if not any(item["antigen"] == antigen_info["name"] for item in infection_data["widal"]):
                                infection_data["widal"].append({
                                    "antigen": antigen_info["name"],
                                    "result": "No agglutination",
                                    "significance": "Not significant",
                                    "status": "Negative"
                                })
                            found = True
                        else:
                            try:
                                titer_value = f"1:{titer}"
                                is_significant = False
                                if "significant" in antigen_info.get("significant", ""):
                                    threshold_match = re.search(r'≥(\d+)', antigen_info["significant"])
                                    if threshold_match:
                                        threshold = int(threshold_match.group(1))
                                        is_significant = int(titer) >= threshold
                                
                                if not any(item["antigen"] == antigen_info["name"] for item in infection_data["widal"]):
                                    infection_data["widal"].append({
                                        "antigen": antigen_info["name"],
                                        "result": titer_value,
                                        "significance": "Significant" if is_significant else "Not significant",
                                        "status": "Positive" if is_significant else "Negative"
                                    })
                                found = True
                            except ValueError:
                                pass
                        break
                if found:
                    break
        
        return infection_data
    
    def _extract_liver_data(self, text: str) -> List[Dict[str, Any]]:
        """Extract Liver Function data"""
        liver_data = []
        
        for test_info in self.medical_knowledge["liver_patterns"]:
            for alias in test_info["aliases"]:
                pattern = rf'{re.escape(alias)}\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|U/L)'
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1)
                    unit = match.group(2) if len(match.groups()) > 1 else test_info["unit"]
                    ref_range = self._find_reference_range(text, alias, test_info["ref_range"])
                    status = self._determine_status(float(value), ref_range)
                    
                    liver_data.append({
                        "test": test_info["name"],
                        "result": f"{value} {unit}",
                        "reference": ref_range,
                        "status": status
                    })
                    break
        
        return liver_data
    
    def _extract_inflammation_data(self, text: str) -> List[Dict[str, Any]]:
        """Extract Inflammation Marker data - improved patterns"""
        inflammation_data = []
        
        for test_info in self.medical_knowledge["inflammation_patterns"]:
            found = False
            for alias in test_info["aliases"]:
                patterns = [
                    rf'{re.escape(alias)}\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|mg/L)',
                    rf'C-Reactive\s+Protein\s*[:\-]\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|mg/L)',
                    rf'{re.escape(alias)}\s*:\s*(\d+(?:\.\d+)?)\s*({test_info["unit"]}|mg/L)',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        value = match.group(1)
                        unit = match.group(2) if len(match.groups()) > 1 else test_info["unit"]
                        
                        test_context = self._get_test_context(text, alias, match.start(), match.end())
                        ref_range = self._find_reference_range(test_context, alias, test_info["ref_range"])
                        status = self._determine_status(float(value), ref_range)
                        
                        # Check if already added
                        if not any(item["test"] == test_info["name"] for item in inflammation_data):
                            inflammation_data.append({
                                "test": test_info["name"],
                                "result": f"{value} {unit}",
                                "reference": ref_range,
                                "status": status
                            })
                            found = True
                            break
                if found:
                    break
        
        return inflammation_data
    
    def _get_test_context(self, text: str, test_name: str, start_pos: int, end_pos: int) -> str:
        """Get context around a test match"""
        context_start = max(0, start_pos - 150)
        context_end = min(len(text), end_pos + 150)
        return text[context_start:context_end]
    
    def _find_reference_range(self, text: str, test_name: str, default_range: str) -> str:
        """Find reference range for a test in the text"""
        # Look for reference range near the test name
        test_context = re.search(rf'{re.escape(test_name)}[^.]{{0,300}}', text, re.IGNORECASE)
        if test_context:
            context = test_context.group(0)
            # Try to find reference range patterns - improved
            ref_patterns = [
                r'\(([\d\.]+)\s*[-–]\s*([\d\.]+)',
                r'([\d\.]+)\s*[-–]\s*([\d\.]+)\s*\)',
                r'([\d,]+)\s*[-–]\s*([\d,]+)',  # With commas
                r'<([\d\.]+)',
                r'>([\d\.]+)',
                r'([\d\.]+)\s+to\s+([\d\.]+)',
            ]
            for pattern in ref_patterns:
                match = re.search(pattern, context)
                if match:
                    if '<' in pattern:
                        return f"<{match.group(1)}"
                    elif '>' in pattern:
                        return f">{match.group(1)}"
                    else:
                        # Clean up commas
                        lower = match.group(1).replace(',', '')
                        upper = match.group(2).replace(',', '')
                        return f"{lower} – {upper}"
        return default_range
    
    def _determine_status(self, value: float, ref_range: str) -> str:
        """Determine if value is High, Low, or Normal"""
        if ref_range.startswith('<'):
            max_val = float(re.search(r'<([\d\.]+)', ref_range).group(1))
            return "High" if value >= max_val else "Normal"
        elif ref_range.startswith('>'):
            min_val = float(re.search(r'>([\d\.]+)', ref_range).group(1))
            return "Low" if value <= min_val else "Normal"
        else:
            range_match = re.search(r'([\d\.]+)\s*[-–]\s*([\d\.]+)', ref_range)
            if range_match:
                lower = float(range_match.group(1))
                upper = float(range_match.group(2))
                if value > upper:
                    return "High"
                elif value < lower:
                    return "Low"
                else:
                    return "Normal"
        return "Normal"
    
    async def _rag_extraction(self, text: str, structured_context: Dict[str, Any]) -> Dict[str, Any]:
        """Use LLM with RAG context to refine extraction"""
        if not self.client:
            return self._build_final_structure(structured_context)
        
        try:
            # Build context prompt
            context_json = json.dumps(structured_context, indent=2)
            
            prompt = f"""You are a medical data extraction expert. I've extracted some data from a medical report using pattern matching. Please refine and complete the extraction.

EXTRACTED DATA (may be incomplete):
{context_json}

ORIGINAL REPORT TEXT:
{text[:15000]}

Your task:
1. Review the extracted data and fill in any missing information from the original text
2. Ensure patient name is complete (e.g., "Mr. Mayank Sharma" not just "Mr")
3. Extract ALL test values with their exact reference ranges
4. Complete WBC differential percentages and absolute counts
5. Extract ALL urine test results (physical, chemical, microscopy)
6. Extract ALL Widal antigens with their titers
7. Ensure all reference ranges are extracted accurately
8. Determine status (High/Low/Normal) for each test

Return ONLY valid JSON in this exact structure:
{{
    "patient_info": {{
        "name": "Full name with title",
        "age": "Age number",
        "gender": "Male or Female",
        "sample_collected": "DD/MM/YYYY",
        "lab_no": "Lab number"
    }},
    "cbc_hemogram": {{
        "rbc_metrics": [{{"test": "...", "result": "...", "reference": "...", "status": "..."}}],
        "wbc_differential": {{
            "tlc": {{"result": "...", "reference": "...", "status": "..."}},
            "differential_percent": [{{"type": "...", "value": "..."}}],
            "absolute_counts": [{{"type": "...", "value": "..."}}]
        }},
        "platelets": [{{"test": "...", "result": "...", "reference": "...", "status": "..."}}],
        "esr": [{{"test": "ESR", "result": "...", "reference": "...", "status": "..."}}]
    }},
    "urine_re": {{
        "physical": [{{"test": "...", "result": "...", "status": "..."}}],
        "chemical": [{{"test": "...", "result": "...", "status": "..."}}],
        "microscopy": [{{"test": "...", "result": "...", "status": "..."}}]
    }},
    "infection_screens": {{
        "malaria": {{"result": "...", "status": "..."}},
        "widal": [{{"antigen": "...", "result": "...", "significance": "...", "status": "..."}}]
    }},
    "liver_function": [{{"test": "...", "result": "...", "reference": "...", "status": "..."}}],
    "inflammation_marker": [{{"test": "...", "result": "...", "reference": "...", "status": "..."}}],
    "key_highlights": {{
        "high_values": ["..."],
        "low_values": ["..."]
    }}
}}

Return ONLY JSON, no markdown:"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a medical data extraction expert. Extract all test values accurately and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
                max_tokens=4000
            )
            
            result_text = response.choices[0].message.content.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            
            parsed_data = json.loads(result_text.strip())
            
            # Add key highlights
            parsed_data["key_highlights"] = self._generate_key_highlights(parsed_data)
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error in RAG extraction: {e}")
            return self._build_final_structure(structured_context)
    
    def _build_final_structure(self, structured_context: Dict[str, Any]) -> Dict[str, Any]:
        """Build final structured data from context"""
        final_data = {
            "patient_info": structured_context.get("patient_info", {}),
            "cbc_hemogram": structured_context.get("cbc_data", {}),
            "urine_re": structured_context.get("urine_data", {}),
            "infection_screens": structured_context.get("infection_data", {}),
            "liver_function": structured_context.get("liver_data", []),
            "inflammation_marker": structured_context.get("inflammation_data", []),
            "key_highlights": {"highlights": [], "high_values": [], "low_values": []}
        }
        
        # Generate key highlights
        final_data["key_highlights"] = self._generate_key_highlights(final_data)
        
        return final_data
    
    def _generate_key_highlights(self, parsed_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate key highlights from parsed data - improved with summaries"""
        highlights = []
        
        # Check CBC
        if "cbc_hemogram" in parsed_data:
            cbc = parsed_data["cbc_hemogram"]
            
            # Check TLC
            tlc = cbc.get("wbc_differential", {}).get("tlc", {})
            if tlc.get("status") == "High":
                highlights.append("TLC slightly high → mild infection likely.")
            
            # Check RBC metrics for abnormalities
            rbc_abnormal = [item for item in cbc.get("rbc_metrics", []) if item.get("status") in ["High", "Low"]]
            if not rbc_abnormal:
                highlights.append("RBC profiles normal.")
            
            # Check Platelets
            platelets_abnormal = [item for item in cbc.get("platelets", []) if item.get("status") in ["High", "Low"]]
            if not platelets_abnormal:
                highlights.append("Normal platelets.")
        
        # Check Widal
        widal = parsed_data.get("infection_screens", {}).get("widal", [])
        significant_widal = [item for item in widal if item.get("significance") == "Significant"]
        if significant_widal:
            highlights.append("Widal significant → supports possible typhoid (clinical correlation needed).")
        
        # Check Malaria
        malaria = parsed_data.get("infection_screens", {}).get("malaria", {})
        if malaria.get("status") == "Negative":
            highlights.append("No malaria.")
        
        # Check Liver Function
        liver_abnormal = [item for item in parsed_data.get("liver_function", []) if item.get("status") == "High"]
        for item in liver_abnormal:
            highlights.append(f"{item.get('test')} high → consider liver involvement.")
        
        # Check Inflammation Marker
        inflammation = parsed_data.get("inflammation_marker", [])
        for item in inflammation:
            if item.get("status") == "Normal":
                highlights.append(f"{item.get('test')} normal.")
            elif item.get("status") == "High":
                highlights.append(f"{item.get('test')} elevated.")
        
        # Check Urine
        urine_normal = True
        urine = parsed_data.get("urine_re", {})
        for category in ["physical", "chemical", "microscopy"]:
            for item in urine.get(category, []):
                if item.get("status") == "Abnormal":
                    urine_normal = False
                    break
        if urine_normal:
            highlights.append("Urine normal.")
        
        return {"highlights": highlights, "high_values": [], "low_values": []}
    
    def _parse_with_enhanced_regex(self, text: str) -> Dict[str, Any]:
        """Enhanced regex parsing as fallback"""
        structured_context = self._extract_with_knowledge_base(text)
        return self._build_final_structure(structured_context)

