import os
import uuid
from werkzeug.utils import secure_filename
from server.config import Config

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_uploaded_file(file, folder_name):
    """
    Saves an uploaded file to uploads/<folder_name>/ with a sanitized unique name.
    Returns relative web path (e.g., /uploads/resources/filename.pdf)
    """
    if not file or file.filename == '':
        return None
        
    if not allowed_file(file.filename):
        raise ValueError("File type not allowed")

    target_dir = os.path.join(Config.UPLOAD_FOLDER, folder_name)
    os.makedirs(target_dir, exist_ok=True)
    
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
    
    file_path = os.path.join(target_dir, unique_filename)
    file.save(file_path)
    
    # Return path accessible via web endpoint
    return f"/uploads/{folder_name}/{unique_filename}"
