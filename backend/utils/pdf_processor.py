import pdfplumber
from PIL import Image
import pytesseract
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class PDFProcessor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> Optional[str]:
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
            return None
    
    @staticmethod
    def extract_text_from_image(file_path: str) -> Optional[str]:
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            return None
    
    @staticmethod
    async def process_medical_report(file_path: str, file_type: str) -> Optional[str]:
        if file_type.lower() == ".pdf":
            return PDFProcessor.extract_text_from_pdf(file_path)
        elif file_type.lower() in [".jpg", ".jpeg", ".png"]:
            return PDFProcessor.extract_text_from_image(file_path)
        else:
            logger.error(f"Unsupported file type: {file_type}")
            return None