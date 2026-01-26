import re
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class MedicalValidators:
    @staticmethod
    def validate_phone(phone: str) -> bool:
        pattern = r'^(\+91)?[6-9]\d{9}$'
        return bool(re.match(pattern, phone))
    
    @staticmethod
    def validate_blood_group(blood_group: str) -> bool:
        valid_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        return blood_group in valid_groups
    
    @staticmethod
    def validate_medical_license(license_number: str) -> bool:
        if not license_number:
            return False
        return len(license_number) >= 5 and len(license_number) <= 20
    
    @staticmethod
    def sanitize_medical_text(text: str) -> str:
        text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL)
        text = re.sub(r'<.*?>', '', text)
        
        return text.strip()
    
    @staticmethod
    def validate_age(date_of_birth) -> Optional[int]:
        try:
            from datetime import datetime
            today = datetime.now()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            return age if 0 <= age <= 150 else None
        except Exception:
            return None