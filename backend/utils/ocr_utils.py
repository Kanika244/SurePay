import re
import cv2
import pytesseract
import fitz  # PyMuPDF
import numpy as np
from fastapi.concurrency import run_in_threadpool

# Ensure Tesseract path is set if on Windows
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_bytes):
    """
    Convert bytes -> Grayscale -> Thresholding for better OCR
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Otsu's thresholding cleans up the background
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    return gray

def _extract_text_sync(file_content: bytes, is_pdf: bool) -> str:
    """Blocking function to read text"""
    if is_pdf:
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    else:
        processed_img = preprocess_image(file_content)
        return pytesseract.image_to_string(processed_img, lang='eng')

async def extract_text_async(file_content: bytes, is_pdf: bool) -> str:
    """Non-blocking wrapper for FastAPI"""
    return await run_in_threadpool(_extract_text_sync, file_content, is_pdf)

def parse_id_card(text: str):
    """Parses raw text for Name and Aadhaar/PAN"""
    
    # 1. Regex for Aadhaar (Matches 12 digits with optional spaces)
    aadhaar_match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", text)
    extracted_id = aadhaar_match.group().replace(" ", "").replace("\n", "") if aadhaar_match else None

    # 2. Heuristic for Name extraction
    extracted_name = None
    lines = text.split("\n")
    blocklist = ["GOVERNMENT", "INDIA", "INCOME", "TAX", "DOB", "YEAR", "MALE", "FEMALE", "AADHAAR"]

    for line in lines:
        clean = line.strip()
        # Look for Uppercase lines with multiple words that aren't metadata
        if (clean.isupper() and len(clean.split()) > 1 
            and not any(x in clean for x in blocklist)
            and not re.search(r"\d", clean)):
            extracted_name = clean
            break

    return extracted_id, extracted_name