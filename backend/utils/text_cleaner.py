import re
import logging

logger = logging.getLogger(__name__)

class TextCleaner:
    @staticmethod
    def clean_medical_text(text: str) -> str:
        if not text:
            return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,;:!?()\-]', '', text)
        text = text.strip()
        
        return text
    
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        text = re.sub(r'\n+', '\n', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    @staticmethod
    def remove_headers_footers(text: str) -> str:
        lines = text.split('\n')
        
        if len(lines) > 4:
            lines = lines[2:-2]
        
        return '\n'.join(lines)
    
    @staticmethod
    def extract_paragraphs(text: str, min_length: int = 50) -> list:
        paragraphs = text.split('\n\n')
        return [p.strip() for p in paragraphs if len(p.strip()) >= min_length]