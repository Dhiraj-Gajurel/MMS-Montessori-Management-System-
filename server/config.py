import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))

db_path = os.path.join(BASE_DIR, 'montessori.db').replace('\\', '/')

class Config:
    BASE_DIR = BASE_DIR
    PROJECT_ROOT = PROJECT_ROOT
    SECRET_KEY = os.environ.get('SECRET_KEY', 'montessori-super-secret-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-montessori-secret-key-98765')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    # Database configuration (SQLite by default, easily swapped to PostgreSQL/MySQL via env)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{db_path}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload configurations
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf', 'doc', 'docx', 'mp4', 'webm'}
