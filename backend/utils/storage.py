import os
import shutil
from fastapi import UploadFile
from datetime import datetime

UPLOAD_DIR = "uploads/poc_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(file: UploadFile, prefix: str) -> str:
    """
    Saves file to disk and returns the path.
    Example: uploads/poc_docs/company123_gov_file.jpg
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    sanitized_filename = f"{prefix}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, sanitized_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return file_path