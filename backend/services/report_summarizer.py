import pdfplumber
import pytesseract
from PIL import Image
import logging
from typing import Dict, List, Any
import json
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI library not available. Falling back to regex parsing.")


class ReportSummarizer:
    def __init__(self):
        pass
    
    async def extract_text_from_pdf(self, file_path: str) -> str:
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""
    
    async def extract_text_from_image(self, file_path: str) -> str:
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            return ""
    
    async def summarize_report(self, extracted_text: str, report_type: str) -> Dict[str, Any]:
        if not extracted_text:
            return {
                "summary": "Unable to extract text from report. Please ensure the file is readable and not corrupted.",
                "key_findings": [],
                "abnormal_values": [],
                "recommendations": ["Try uploading a clearer image or PDF", "Ensure the file is not password protected"]
            }
        
        import re
        from typing import Tuple
        
        text_lower = extracted_text.lower()
        text_original = extracted_text
        
        # Extract actual lab values with their test names, values, units, and reference ranges
        lab_values = self._extract_lab_values(text_original, text_lower)
        abnormal_values = []
        normal_values = []
        key_findings = []
        recommendations = []
        
        # Normal reference ranges for common tests
        reference_ranges = {
            'hemoglobin': (12.0, 17.5, 'g/dL'),
            'hb': (12.0, 17.5, 'g/dL'),
            'rbc': (4.5, 5.5, 'million/μL'),
            'wbc': (4000, 11000, '/μL'),
            'platelet': (150000, 450000, '/μL'),
            'glucose': (70, 100, 'mg/dL'),
            'blood glucose': (70, 100, 'mg/dL'),
            'creatinine': (0.6, 1.2, 'mg/dL'),
            'urea': (15, 50, 'mg/dL'),
            'total cholesterol': (0, 200, 'mg/dL'),
            'hdl': (40, 60, 'mg/dL'),
            'ldl': (0, 100, 'mg/dL'),
            'triglycerides': (0, 150, 'mg/dL'),
            'hba1c': (4.0, 5.7, '%'),
            'sgot': (10, 40, 'U/L'),
            'sgpt': (10, 40, 'U/L'),
            'bilirubin': (0.2, 1.2, 'mg/dL'),
            'tsh': (0.4, 4.0, 'mIU/L'),
            't3': (80, 200, 'ng/dL'),
            't4': (4.5, 11.5, 'μg/dL'),
            'vitamin d': (30, 100, 'ng/mL'),
            'vitamin b12': (200, 900, 'pg/mL'),
            'ferritin': (15, 150, 'ng/mL'),
        }
        
        # Analyze extracted values
        for test_name, value_info in lab_values.items():
            test_lower = test_name.lower()
            value = value_info['value']
            unit = value_info.get('unit', '')
            
            # Find matching reference range
            matched_range = None
            for ref_key, (min_val, max_val, ref_unit) in reference_ranges.items():
                if ref_key in test_lower:
                    matched_range = (min_val, max_val, ref_unit)
                    break
            
            if matched_range:
                min_ref, max_ref, ref_unit = matched_range
                if value < min_ref:
                    status = "LOW"
                    abnormal_values.append({
                        "test": test_name,
                        "value": f"{value} {unit}",
                        "reference_range": f"{min_ref}-{max_ref} {ref_unit}",
                        "status": "Low",
                        "interpretation": f"{test_name} is below the normal reference range"
                    })
                elif value > max_ref:
                    status = "HIGH"
                    abnormal_values.append({
                        "test": test_name,
                        "value": f"{value} {unit}",
                        "reference_range": f"{min_ref}-{max_ref} {ref_unit}",
                        "status": "High",
                        "interpretation": f"{test_name} is above the normal reference range"
                    })
                else:
                    status = "NORMAL"
                    normal_values.append({
                        "test": test_name,
                        "value": f"{value} {unit}",
                        "reference_range": f"{min_ref}-{max_ref} {ref_unit}"
                    })
            else:
                # No reference range matched, check if explicitly marked
                if any(word in value_info.get('status', '').lower() for word in ['high', 'low', 'abnormal', 'elevated', 'decreased']):
                    abnormal_values.append({
                        "test": test_name,
                        "value": f"{value} {unit}",
                        "status": value_info.get('status', 'Abnormal'),
                        "interpretation": f"{test_name} shows {value_info.get('status', 'abnormal')} value"
                    })
                else:
                    normal_values.append({
                        "test": test_name,
                        "value": f"{value} {unit}"
                    })
        
        # Extract key findings from text patterns
        key_findings = self._extract_key_findings(text_original, text_lower, lab_values, abnormal_values)
        
        # Generate meaningful summary
        summary = self._generate_meaningful_summary(report_type, lab_values, abnormal_values, normal_values)
        
        # Generate recommendations based on findings
        recommendations = self._generate_recommendations(report_type, abnormal_values, key_findings)
        
        # Parse into structured categories - Use RAG model first, then fallback
        parsed_data = None
        try:
            from services.medical_report_rag import MedicalReportRAG
            rag_parser = MedicalReportRAG()
            parsed_data = await rag_parser.parse_report(extracted_text)
            if parsed_data and isinstance(parsed_data, dict):
                logger.info("Successfully parsed report using RAG model")
            else:
                parsed_data = None
        except Exception as e:
            logger.warning(f"RAG parsing failed: {e}, falling back to OpenAI/regex")
            parsed_data = None
        
        # Fallback to OpenAI/regex if RAG failed
        if not parsed_data or not isinstance(parsed_data, dict):
            parsed_data = await self._parse_with_openai(extracted_text)
            regex_data = self._parse_into_categories(text_original, text_lower, lab_values, abnormal_values, normal_values)
        
        # If RAG parsing failed, use fallback
        if not parsed_data or not isinstance(parsed_data, dict):
            logger.warning("RAG parsing failed, using fallback methods")
            if 'regex_data' not in locals():
                regex_data = self._parse_into_categories(text_original, text_lower, lab_values, abnormal_values, normal_values)
            parsed_data = regex_data
            logger.info("Using regex-based parsing as fallback")
        
        return {
            "summary": summary,
            "key_findings": key_findings,
            "abnormal_values": abnormal_values,
            "normal_values": normal_values[:10],  # Show first 10 normal values
            "recommendations": recommendations,
            "report_type": report_type,
            "total_tests_found": len(lab_values),
            "abnormal_count": len(abnormal_values),
            "normal_count": len(normal_values),
            "parsed_data": parsed_data
        }
    
    def _extract_lab_values(self, text_original: str, text_lower: str) -> Dict[str, Dict]:
        """Extract lab test names and their values from the report"""
        import re
        lab_values = {}
        
        # Common lab test patterns
        patterns = [
            # Pattern: Test Name: Value Unit (Reference Range)
            (r'([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s*[:\-]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z/%]+)?', 'test_value_unit'),
            # Pattern: Test Name Value Unit
            (r'(hemoglobin|hb|rbc|wbc|platelet|glucose|creatinine|urea|cholesterol|hdl|ldl|triglycerides|hba1c|sgot|sgpt|bilirubin|tsh|t3|t4|vitamin\s+d|vitamin\s+b12|ferritin)[\s:]+(\d+(?:\.\d+)?)\s*([a-zA-Z/%]+)?', 'named_test'),
        ]
        
        lines = text_original.split('\n')
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Skip empty lines
            if not line_lower:
                continue
            
            # Pattern 1: Test Name : Value Unit (Reference Range)
            match = re.search(r'([A-Z][A-Za-z\s/]+?)\s*[:\-]\s*(\d+(?:\.\d+)?)\s*(mg/dl|g/dl|g%|%|u/l|U/L|mlu/l|pg/ml|ng/ml|million/μl|/μl|/ul|/mm3|/cmm|lakh/mm³|mm/hr)?', line, re.IGNORECASE)
            if match:
                test_name = match.group(1).strip()
                value = float(match.group(2))
                unit = match.group(3) if match.group(3) else ''
                
                # Check for reference range - multiple patterns
                reference = 'N/A'
                ref_patterns = [
                    r'\(([\d\.]+)\s*[-–]\s*([\d\.]+)',
                    r'([\d\.]+)\s*[-–]\s*([\d\.]+)\s*\)',
                    r'([\d\.]+)\s*to\s*([\d\.]+)',
                    r'<([\d\.]+)',
                    r'>([\d\.]+)',
                ]
                
                for ref_pattern in ref_patterns:
                    ref_match = re.search(ref_pattern, line)
                    if ref_match:
                        if '<' in ref_pattern:
                            reference = f"<{ref_match.group(1)}"
                        elif '>' in ref_pattern:
                            reference = f">{ref_match.group(1)}"
                        else:
                            reference = f"{ref_match.group(1)} – {ref_match.group(2)}"
                        break
                
                # Determine status based on reference range
                status = 'Normal'
                if reference != 'N/A' and reference not in ['<', '>']:
                    # Try to extract numeric range
                    range_match = re.search(r'([\d\.]+)\s*[-–]\s*([\d\.]+)', reference)
                    if range_match:
                        lower = float(range_match.group(1))
                        upper = float(range_match.group(2))
                        if value > upper:
                            status = 'High'
                        elif value < lower:
                            status = 'Low'
                        else:
                            status = 'Normal'
                elif '<' in reference:
                    max_val = float(re.search(r'<([\d\.]+)', reference).group(1))
                    if value >= max_val:
                        status = 'High'
                elif '>' in reference:
                    min_val = float(re.search(r'>([\d\.]+)', reference).group(1))
                    if value <= min_val:
                        status = 'Low'
                
                # Override with explicit status markers in text
                if any(word in line_lower for word in ['high', 'elevated', 'increased', 'above']):
                    status = 'High'
                elif any(word in line_lower for word in ['low', 'decreased', 'below', 'deficiency']):
                    status = 'Low'
                
                if test_name and value:
                    lab_values[test_name] = {
                        'value': value,
                        'unit': unit,
                        'reference': reference,
                        'status': status,
                        'line': line
                    }
        
        # Also extract common specific tests
        specific_tests = {
            'hemoglobin': r'(?:hemoglobin|hb|hgb)\s*[:\s]+(\d+(?:\.\d+)?)\s*(g/dl|g%)',
            'glucose': r'(?:glucose|blood\s+glucose|sugar)\s*[:\s]+(\d+(?:\.\d+)?)\s*(mg/dl|mmol/l)',
            'creatinine': r'creatinine\s*[:\s]+(\d+(?:\.\d+)?)\s*(mg/dl)',
            'wbc': r'(?:wbc|white\s+blood\s+cell|leukocyte)\s*[:\s]+(\d+(?:\.\d+)?)\s*(/μl|/ul|/mm3)',
            'rbc': r'(?:rbc|red\s+blood\s+cell|erythrocyte)\s*[:\s]+(\d+(?:\.\d+)?)\s*(million/μl|million/ul)',
            'platelet': r'(?:platelet|plt|thrombocyte)\s*[:\s]+(\d+(?:\.\d+)?)\s*(/μl|/ul|/mm3)',
        }
        
        for test_name, pattern in specific_tests.items():
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                value = float(match.group(1))
                unit = match.group(2) if len(match.groups()) > 1 else ''
                if test_name not in lab_values:
                    lab_values[test_name.title()] = {
                        'value': value,
                        'unit': unit,
                        'status': '',
                        'line': match.group(0)
                    }
        
        return lab_values
    
    def _extract_key_findings(self, text_original: str, text_lower: str, lab_values: Dict, abnormal_values: List) -> List[str]:
        """Extract meaningful key findings from the report"""
        findings = []
        
        # Extract findings based on abnormal values
        for abnormal in abnormal_values[:5]:  # Top 5 abnormal values
            test = abnormal.get('test', '')
            value = abnormal.get('value', '')
            status = abnormal.get('status', '')
            
            if status == 'High':
                findings.append(f"{test}: {value} (Elevated - requires attention)")
            elif status == 'Low':
                findings.append(f"{test}: {value} (Below normal range - requires attention)")
        
        # Extract specific medical findings from text
        finding_patterns = [
            (r'([A-Z][^.!?]*?(?:high|low|elevated|decreased|abnormal|abnormality)[^.!?]*)', 'status_finding'),
            (r'(impression[:\s]+[^.!?]+)', 'impression'),
            (r'(diagnosis[:\s]+[^.!?]+)', 'diagnosis'),
            (r'(recommendation[:\s]+[^.!?]+)', 'recommendation'),
        ]
        
        import re
        for pattern, pattern_type in finding_patterns:
            matches = re.finditer(pattern, text_original, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                finding_text = match.group(1).strip()
                if len(finding_text) > 20 and len(finding_text) < 200:  # Reasonable length
                    if finding_text not in findings:
                        findings.append(finding_text)
        
        # If no specific findings, create meaningful ones from extracted data
        if not findings and lab_values:
            findings.append(f"Report contains {len(lab_values)} test results")
            if abnormal_values:
                findings.append(f"{len(abnormal_values)} test(s) show abnormal values requiring medical attention")
            if len(lab_values) - len(abnormal_values) > 0:
                findings.append(f"{len(lab_values) - len(abnormal_values)} test(s) are within normal ranges")
        
        return findings[:8]  # Limit to 8 key findings
    
    def _generate_meaningful_summary(self, report_type: str, lab_values: Dict, abnormal_values: List, normal_values: List) -> str:
        """Generate a doctor-friendly summary"""
        summary_parts = []
        
        # Start with report type and key stats
        summary_parts.append(f"Analysis of {report_type} report identified {len(lab_values)} test parameters.")
        
        if abnormal_values:
            summary_parts.append(f"Found {len(abnormal_values)} abnormal value(s) that require clinical attention:")
            for ab in abnormal_values[:3]:  # Top 3 most important
                test = ab.get('test', 'Unknown')
                value = ab.get('value', '')
                summary_parts.append(f"• {test}: {value}")
        
        if normal_values and len(abnormal_values) == 0:
            summary_parts.append(f"All {len(normal_values)} test results are within normal reference ranges.")
        
        # Add important note
        if abnormal_values:
            summary_parts.append("Clinical correlation recommended. Review complete report for detailed interpretation.")
        else:
            summary_parts.append("Review complete report for comprehensive assessment.")
        
        return " ".join(summary_parts)
    
    def _generate_recommendations(self, report_type: str, abnormal_values: List, key_findings: List) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if abnormal_values:
            # Specific recommendations based on abnormal values
            for ab in abnormal_values[:3]:
                test = ab.get('test', '').lower()
                status = ab.get('status', '').lower()
                
                if 'glucose' in test and status == 'high':
                    recommendations.append("Elevated glucose levels detected - consider diabetes screening, HbA1c test, and dietary counseling")
                elif 'creatinine' in test and status == 'high':
                    recommendations.append("Elevated creatinine suggests possible kidney dysfunction - consider renal function tests and nephrology consultation if persistent")
                elif 'hemoglobin' in test or 'hb' in test:
                    if status == 'low':
                        recommendations.append("Low hemoglobin indicates anemia - investigate cause (iron deficiency, B12/folate deficiency, chronic disease) and consider supplementation")
                    elif status == 'high':
                        recommendations.append("High hemoglobin may indicate polycythemia - consider hematology consultation")
                elif 'wbc' in test and status == 'high':
                    recommendations.append("Elevated WBC count suggests possible infection or inflammation - correlate with clinical symptoms")
                elif 'platelet' in test:
                    if status == 'low':
                        recommendations.append("Low platelet count requires monitoring - check for bleeding risk and consider hematology consultation if severe")
            
            recommendations.append("Compare with previous reports to assess trend")
            recommendations.append("Consider repeat testing if clinically indicated")
        else:
            recommendations.append("All values within normal range - continue routine monitoring as per clinical protocol")
        
        # Report type specific recommendations
        if report_type == 'lab':
            recommendations.append("Review all test results in context of patient's clinical presentation and medical history")
        elif report_type == 'radiology':
            recommendations.append("Correlate imaging findings with clinical symptoms and physical examination")
            recommendations.append("Compare with previous imaging studies if available")
        
        return recommendations[:6]  # Limit to 6 recommendations
    
    async def _parse_with_openai(self, extracted_text: str) -> Dict[str, Any]:
        """Use OpenAI API to parse medical report with high accuracy"""
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            logger.warning("OpenAI not available or API key not set. Falling back to regex parsing.")
            return None
        
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Truncate text if too long, but keep important parts
            text_to_analyze = extracted_text[:20000] if len(extracted_text) > 20000 else extracted_text
            
            prompt = f"""You are an expert medical data extraction specialist. Your task is to extract ALL medical test data from the following lab report and structure it precisely as specified.

CRITICAL: Extract EVERY test value, result, and reference range you find in the report. Do not skip any tests.

MEDICAL REPORT TEXT:
{text_to_analyze}

You MUST return a JSON object with this EXACT structure. Fill in ALL fields that are present in the report:
{{
    "patient_info": {{
        "name": "Full patient name (e.g., 'Mr. Mayank Sharma')",
        "age": "Age in years (number only)",
        "gender": "Male or Female",
        "sample_collected": "Date when sample was collected (format: DD/MM/YYYY)",
        "lab_no": "Laboratory number/reference number"
    }},
    "cbc_hemogram": {{
        "rbc_metrics": [
            {{
                "test": "Test name (e.g., 'Hemoglobin', 'PCV', 'RBC Count', 'MCV', 'MCH', 'MCHC', 'RDW')",
                "result": "Test result value with unit",
                "reference": "Reference range (e.g., '13 – 17', '40 – 50')",
                "status": "Normal/High/Low"
            }}
        ],
        "wbc_differential": {{
            "tlc": {{
                "result": "Total Leukocyte Count value with unit",
                "reference": "Reference range",
                "status": "Normal/High/Low"
            }},
            "differential_percent": [
                {{
                    "type": "Neutrophils/Lymphocytes/Monocytes/Eosinophils/Basophils",
                    "value": "Percentage value"
                }}
            ],
            "absolute_counts": [
                {{
                    "type": "Neutrophils/Lymphocytes/Monocytes/Eosinophils/Basophils",
                    "value": "Absolute count value"
                }}
            ]
        }},
        "platelets": [
            {{
                "test": "Test name (e.g., 'Platelet Count', 'MPV')",
                "result": "Test result value with unit",
                "reference": "Reference range",
                "status": "Normal/High/Low"
            }}
        ],
        "esr": [
            {{
                "test": "ESR",
                "result": "ESR value with unit",
                "reference": "Reference range",
                "status": "Normal/High/Low"
            }}
        ]
    }},
    "urine_re": {{
        "physical": [
            {{
                "test": "Test name (e.g., 'Colour', 'pH', 'Specific Gravity')",
                "result": "Test result",
                "reference": "Reference range if applicable",
                "status": "Normal/Abnormal"
            }}
        ],
        "chemical": [
            {{
                "test": "Test name (e.g., 'Glucose', 'Protein', 'Ketones', 'Bilirubin', 'Urobilinogen', 'Blood', 'Nitrite', 'Leukocyte Esterase')",
                "result": "Test result (e.g., 'Negative', 'Positive', 'Normal')",
                "status": "Normal/Abnormal"
            }}
        ],
        "microscopy": [
            {{
                "test": "Test name (e.g., 'RBCs', 'Pus cells (WBC)', 'Epithelial cells', 'Crystals', 'Casts')",
                "result": "Test result (e.g., 'Nil', '0-1', 'Few', 'None')",
                "status": "Normal/Abnormal"
            }}
        ]
    }},
    "infection_screens": {{
        "malaria": {{
            "result": "Result (e.g., 'No malarial parasite seen', 'Positive')",
            "status": "Negative/Positive"
        }},
        "widal": [
            {{
                "antigen": "Antigen name (e.g., 'S. typhi O (TO)', 'S. typhi H (TH)', 'S. paratyphi A (AH)', 'S. paratyphi B (BH)')",
                "result": "Titer value (e.g., '1:320', '1:160', 'No agglutination')",
                "significance": "Significant/Not significant",
                "status": "Positive/Negative"
            }}
        ]
    }},
    "liver_function": [
        {{
            "test": "Test name (e.g., 'ALT / SGPT', 'AST / SGOT', 'Bilirubin', 'Albumin')",
            "result": "Test result value with unit",
            "reference": "Reference range",
            "status": "Normal/High/Low"
        }}
    ],
    "inflammation_marker": [
        {{
            "test": "Test name (e.g., 'CRP', 'ESR')",
            "result": "Test result value with unit",
            "reference": "Reference range",
            "status": "Normal/High/Low"
        }}
    ],
    "key_highlights": {{
        "high_values": [
            "Test name: value (e.g., 'TLC: 12,500 /cmm')"
        ],
        "low_values": [
            "Test name: value"
        ]
    }}
}}

CRITICAL EXTRACTION RULES:
1. PATIENT INFO:
   - Extract COMPLETE name: "Mr. Mayank Sharma" NOT just "Mr" or "Mayank"
   - Extract age as number only (e.g., 24)
   - Extract gender: "Male" or "Female"
   - Extract sample collection date in DD/MM/YYYY format
   - Extract lab number/reference number completely

2. CBC/HEMOGRAM - Extract EVERY parameter found:
   - RBC Metrics: Hemoglobin (Hb/HGB), PCV/Hematocrit (HCT), RBC Count, MCV, MCH, MCHC, RDW
   - WBC: TLC (Total Leukocyte Count), ALL differential percentages (Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils), ALL absolute counts
   - Platelets: Platelet Count, MPV
   - ESR: Erythrocyte Sedimentation Rate

3. URINE R/E - Extract ALL sections:
   - Physical: Colour, pH, Specific Gravity, Appearance
   - Chemical: Glucose, Protein, Ketones, Bilirubin, Urobilinogen, Blood, Nitrite, Leukocyte Esterase
   - Microscopy: RBCs, Pus cells/WBC, Epithelial cells, Crystals, Casts, Bacteria

4. INFECTION SCREENS:
   - Malaria: Extract result (e.g., "No malarial parasite seen")
   - Widal: Extract ALL antigens (S. typhi O, S. typhi H, S. paratyphi A, S. paratyphi B) with their titers and significance

5. LIVER FUNCTION: Extract ALL liver tests (ALT/SGPT, AST/SGOT, Bilirubin, Albumin, etc.)

6. INFLAMMATION MARKER: Extract CRP, ESR values

7. STATUS DETERMINATION:
   - Compare each value with its reference range
   - Mark "High" if value > upper limit
   - Mark "Low" if value < lower limit  
   - Mark "Normal" if within range
   - For qualitative tests (Negative/Positive), use appropriate status

8. KEY HIGHLIGHTS:
   - List ALL tests with High status in "high_values" array
   - List ALL tests with Low status in "low_values" array
   - Format: "Test Name: value unit" (e.g., "TLC: 12,500 /cmm", "ALT: 119.10 U/L")

9. REFERENCE RANGES:
   - Extract the EXACT reference range as shown in report (e.g., "13 – 17", "4400 - 11000", "<41")

10. DO NOT:
    - Skip any test values you find
    - Use "N/A" unless truly not found
    - Truncate patient names
    - Leave arrays empty if data exists

11. RETURN FORMAT:
    - Return ONLY valid JSON
    - No markdown, no explanations, no code blocks
    - Ensure all strings are properly escaped
    - Use arrays for multiple items, objects for structured data

EXAMPLE OUTPUT STRUCTURE (fill with actual data from report):
{{
    "patient_info": {{
        "name": "Mr. Mayank Sharma",
        "age": "24",
        "gender": "Male",
        "sample_collected": "28/09/2025",
        "lab_no": "395015627"
    }},
    "cbc_hemogram": {{
        "rbc_metrics": [
            {{"test": "Hemoglobin", "result": "15.50 g/dL", "reference": "13 – 17", "status": "Normal"}},
            {{"test": "PCV", "result": "45.00%", "reference": "40 – 50", "status": "Normal"}},
            {{"test": "RBC Count", "result": "4.86 mill/mm³", "reference": "4.5 – 5.5", "status": "Normal"}}
        ],
        "wbc_differential": {{
            "tlc": {{"result": "12,500 /cmm", "reference": "4,400 – 11,000", "status": "High"}},
            "differential_percent": [
                {{"type": "Neutrophils", "value": "63.4"}},
                {{"type": "Lymphocytes", "value": "26.6"}}
            ],
            "absolute_counts": [
                {{"type": "Neutrophils", "value": "7,925"}},
                {{"type": "Lymphocytes", "value": "3,325"}}
            ]
        }},
        "platelets": [
            {{"test": "Platelet Count", "result": "3.52 lakh/mm³", "reference": "1.5 – 4.5 lakh", "status": "Normal"}}
        ],
        "esr": [
            {{"test": "ESR", "result": "12 mm/hr", "reference": "1 – 30", "status": "Normal"}}
        ]
    }},
    "urine_re": {{
        "physical": [
            {{"test": "Colour", "result": "Pale yellow", "status": "Normal"}},
            {{"test": "pH", "result": "6.0", "reference": "5–8", "status": "Normal"}}
        ],
        "chemical": [
            {{"test": "Glucose", "result": "Negative", "status": "Normal"}},
            {{"test": "Protein", "result": "Negative", "status": "Normal"}}
        ],
        "microscopy": [
            {{"test": "RBCs", "result": "Nil", "status": "Normal"}},
            {{"test": "Pus cells (WBC)", "result": "0–1", "status": "Normal"}}
        ]
    }},
    "infection_screens": {{
        "malaria": {{
            "result": "No malarial parasite seen",
            "status": "Negative"
        }},
        "widal": [
            {{"antigen": "S. typhi O (TO)", "result": "1:320", "significance": "Significant", "status": "Positive"}},
            {{"antigen": "S. typhi H (TH)", "result": "1:160", "significance": "Significant", "status": "Positive"}}
        ]
    }},
    "liver_function": [
        {{"test": "ALT / SGPT", "result": "119.10 U/L", "reference": "<41", "status": "High"}}
    ],
    "inflammation_marker": [
        {{"test": "CRP", "result": "1.23 mg/L", "reference": "0 – 5", "status": "Normal"}}
    ],
    "key_highlights": {{
        "high_values": ["TLC: 12,500 /cmm", "ALT / SGPT: 119.10 U/L"],
        "low_values": []
    }}
}}

Now extract ALL data from the provided report and return the JSON:"""

            response = client.chat.completions.create(
                model="gpt-4o",  # Using gpt-4o for better accuracy in medical data extraction
                messages=[
                    {"role": "system", "content": "You are a medical data extraction expert specializing in lab reports. Extract ALL test values, results, reference ranges, and patient information with 100% accuracy. Return only valid JSON without any markdown formatting or code blocks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,  # Zero temperature for maximum consistency
                response_format={"type": "json_object"},  # Force JSON response
                max_tokens=4000  # Allow enough tokens for complete extraction
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            parsed_data = json.loads(result_text)
            
            # Validate and log extracted data
            logger.info(f"Successfully parsed report using OpenAI API")
            logger.info(f"Extracted patient: {parsed_data.get('patient_info', {}).get('name', 'N/A')}")
            logger.info(f"RBC metrics count: {len(parsed_data.get('cbc_hemogram', {}).get('rbc_metrics', []))}")
            logger.info(f"Urine tests count: {len(parsed_data.get('urine_re', {}).get('physical', [])) + len(parsed_data.get('urine_re', {}).get('chemical', []))}")
            
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI JSON response: {e}")
            if 'result_text' in locals():
                logger.error(f"Response was: {result_text[:1000]}")
                # Try to fix common JSON issues
                try:
                    # Remove any trailing commas or fix common issues
                    fixed_text = result_text.replace(',}', '}').replace(',]', ']')
                    parsed_data = json.loads(fixed_text)
                    logger.info("Successfully parsed after fixing JSON issues")
                    return parsed_data
                except:
                    pass
            return None
        except Exception as e:
            logger.error(f"Error using OpenAI API: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    
    def _parse_into_categories(self, text_original: str, text_lower: str, lab_values: Dict, abnormal_values: List, normal_values: List) -> Dict[str, Any]:
        """Parse report into specific categories - fallback method using regex"""
        import re
        
        parsed = {
            "patient_info": {},
            "cbc_hemogram": {},
            "urine_re": {},
            "infection_screens": {},
            "liver_function": {},
            "inflammation_marker": {},
            "key_highlights": {
                "high_values": [],
                "low_values": []
            }
        }
        
        # Extract Patient Info - Improved patterns
        # Extract full name including title (Mr., Mrs., Ms., Dr., etc.)
        name_patterns = [
            r'(?:name|patient\s+name|patient)[:\s]+(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
            r'(?:name|patient\s+name|patient)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
            r'Name\s*:\s*(?:Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
            r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s+Age\s*:',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text_original, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Try to find the title prefix
                title_match = re.search(r'(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss|Master)', text_original[:match.start() + 200], re.IGNORECASE)
                if title_match:
                    parsed["patient_info"]["name"] = f"{title_match.group(1)}. {name}" if not title_match.group(1).endswith('.') else f"{title_match.group(1)} {name}"
                else:
                    parsed["patient_info"]["name"] = name
                break
        
        # Extract other patient info
        patient_patterns = [
            (r'(?:age|age\s*:)[:\s]+(\d+)', 'age'),
            (r'(?:gender|sex|gender\s*:)[:\s]+(male|female|m|f)', 'gender'),
            (r'(?:date\s+of\s+birth|dob|dob\s*:)[:\s]+([\d/]+)', 'dob'),
            (r'(?:lab\s+no|lab\s+number|lab\s+no\s*:)[:\s]+([A-Z0-9]+)', 'lab_no'),
            (r'(?:patient\s+id|id|patient\s+id\s*:)[:\s]+([A-Z0-9]+)', 'patient_id'),
            (r'(?:sample\s+collected|collected|collected\s*:)[:\s]+([\d/]+)', 'sample_collected'),
            (r'(?:reported|reported\s*:)[:\s]+([\d/]+)', 'sample_collected'),  # Sometimes "reported" date is used
        ]
        
        for pattern, key in patient_patterns:
            match = re.search(pattern, text_original, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                if key == 'gender':
                    value = 'Male' if value.lower().startswith('m') else 'Female'
                parsed["patient_info"][key] = value
        
        # Extract CBC / Hemogram
        cbc_tests = {
            'rbc_metrics': ['rbc', 'red blood cell', 'erythrocyte', 'hemoglobin', 'hb', 'hgb', 'hematocrit', 'hct', 'pcv', 'mcv', 'mch', 'mchc', 'rdw'],
            'wbc_differential': ['wbc', 'white blood cell', 'leukocyte', 'neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil', 'tlc'],
            'platelets': ['platelet', 'plt', 'thrombocyte', 'mpv'],
            'esr': ['esr', 'erythrocyte sedimentation rate']
        }
        
        for category, test_keywords in cbc_tests.items():
            parsed["cbc_hemogram"][category] = []
            for test_name, value_info in lab_values.items():
                test_lower = test_name.lower()
                if any(keyword in test_lower for keyword in test_keywords):
                    parsed["cbc_hemogram"][category].append({
                        "test": test_name,
                        "value": f"{value_info['value']} {value_info.get('unit', '')}",
                        "status": value_info.get('status', 'Normal')
                    })
        
        # Extract Urine R/E with better structure
        urine_tests = {
            'physical': ['color', 'appearance', 'specific gravity', 'ph', 'colour'],
            'chemical': ['protein', 'glucose', 'ketone', 'bilirubin', 'urobilinogen', 'nitrite', 'leukocyte esterase', 'blood', 'urobilinogen'],
            'microscopy': ['rbc', 'wbc', 'epithelial', 'cast', 'crystal', 'bacteria', 'yeast', 'pus cells', 'pus cell']
        }
        
        for category, test_keywords in urine_tests.items():
            parsed["urine_re"][category] = []
            for test_name, value_info in lab_values.items():
                test_lower = test_name.lower()
                if any(keyword in test_lower for keyword in test_keywords):
                    parsed["urine_re"][category].append({
                        "test": test_name,
                        "result": f"{value_info['value']} {value_info.get('unit', '')}".strip(),
                        "reference": value_info.get('reference', ''),
                        "status": value_info.get('status', 'Normal')
                    })
        
        # Extract Infection Screens with better structure
        # Malaria
        malaria_result = None
        malaria_text = re.search(r'(?:malaria|malarial\s+parasite|mp)[:\s]+([^.\n]+)', text_original, re.IGNORECASE)
        if malaria_text:
            result_text = malaria_text.group(1).strip()
            if 'not seen' in result_text.lower() or 'negative' in result_text.lower() or 'no' in result_text.lower():
                malaria_result = {"result": "No malarial parasite seen", "status": "Negative"}
            else:
                malaria_result = {"result": result_text, "status": "Positive"}
        else:
            malaria_result = {"result": "Not tested", "status": "Not tested"}
        parsed["infection_screens"]["malaria"] = malaria_result
        
        # Widal test - extract all antigens
        widal_list = []
        widal_patterns = [
            r'(?:S\.\s*typhi\s*O|TO|O\s+antigen)[:\s]+(?:1:)?(\d+)',
            r'(?:S\.\s*typhi\s*H|TH|H\s+antigen)[:\s]+(?:1:)?(\d+)',
            r'(?:S\.\s*paratyphi\s*A|AH|A\s+antigen)[:\s]+(?:1:)?(\d+|no\s+agglutination)',
            r'(?:S\.\s*paratyphi\s*B|BH|B\s+antigen)[:\s]+(?:1:)?(\d+|no\s+agglutination)',
        ]
        
        antigen_names = ['S. typhi O (TO)', 'S. typhi H (TH)', 'S. paratyphi A (AH)', 'S. paratyphi B (BH)']
        for i, pattern in enumerate(widal_patterns):
            match = re.search(pattern, text_original, re.IGNORECASE)
            if match:
                titer = match.group(1).strip()
                if 'no' in titer.lower() or 'nil' in titer.lower():
                    widal_list.append({
                        "antigen": antigen_names[i],
                        "result": "No agglutination",
                        "significance": "Not significant",
                        "status": "Negative"
                    })
                else:
                    titer_value = f"1:{titer}"
                    # Determine significance (typically >= 1:80 for O, >= 1:160 for H)
                    is_significant = False
                    if i == 0 and int(titer) >= 80:  # TO
                        is_significant = True
                    elif i == 1 and int(titer) >= 160:  # TH
                        is_significant = True
                    
                    widal_list.append({
                        "antigen": antigen_names[i],
                        "result": titer_value,
                        "significance": "Significant" if is_significant else "Not significant",
                        "status": "Positive" if is_significant else "Negative"
                    })
        parsed["infection_screens"]["widal"] = widal_list
        
        # Extract Liver Function (ALT/SGPT) with reference ranges
        liver_tests = ['alt', 'sgpt', 'ast', 'sgot', 'bilirubin', 'albumin', 'alkaline phosphatase', 'alp']
        parsed["liver_function"] = []
        for test_name, value_info in lab_values.items():
            test_lower = test_name.lower()
            if any(keyword in test_lower for keyword in liver_tests):
                parsed["liver_function"].append({
                    "test": test_name,
                    "result": f"{value_info['value']} {value_info.get('unit', '')}".strip(),
                    "reference": value_info.get('reference', 'N/A'),
                    "status": value_info.get('status', 'Normal')
                })
        
        # Extract Inflammation Marker (CRP) with reference ranges
        inflammation_tests = ['crp', 'c-reactive protein']
        parsed["inflammation_marker"] = []
        for test_name, value_info in lab_values.items():
            test_lower = test_name.lower()
            if any(keyword in test_lower for keyword in inflammation_tests):
                parsed["inflammation_marker"].append({
                    "test": test_name,
                    "result": f"{value_info['value']} {value_info.get('unit', '')}".strip(),
                    "reference": value_info.get('reference', 'N/A'),
                    "status": value_info.get('status', 'Normal')
                })
        
        # Key Highlights - High and Low values
        for ab in abnormal_values:
            test = ab.get('test', '')
            value = ab.get('value', '')
            status = ab.get('status', '')
            if status == 'High':
                parsed["key_highlights"]["high_values"].append(f"{test}: {value}")
            elif status == 'Low':
                parsed["key_highlights"]["low_values"].append(f"{test}: {value}")
        
        return parsed
    
    async def compare_reports(self, current_report: str, previous_report: str) -> Dict[str, Any]:
        return {"comparison": "Comparison feature available", "changes": []}