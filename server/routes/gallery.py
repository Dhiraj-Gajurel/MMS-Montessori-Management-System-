from flask import Blueprint, request, jsonify
import os
from server.models import Gallery
from server.database import db
from server.utils.auth import admin_required
from server.utils.file_upload import save_uploaded_file
from server.config import Config

gallery_bp = Blueprint('gallery', __name__, url_prefix='/api/gallery')

@gallery_bp.route('', methods=['GET'])
def get_gallery():
    category = request.args.get('category')
    query = Gallery.query
    if category and category.lower() != 'all':
        query = query.filter(Gallery.category.ilike(f"%{category}%"))
    items = query.order_by(Gallery.created_at.desc()).all()
    return jsonify([g.to_dict() for g in items]), 200

@gallery_bp.route('', methods=['POST'])
@admin_required()
def add_gallery_item():
    title = request.form.get('title') or (request.get_json() or {}).get('title')
    description = request.form.get('description') or (request.get_json() or {}).get('description', '')
    media_type = request.form.get('media_type') or (request.get_json() or {}).get('media_type', 'image')
    category = request.form.get('category') or (request.get_json() or {}).get('category', 'Activities')
    
    file = request.files.get('file')
    file_path = None
    
    if file and file.filename != '':
        try:
            file_path = save_uploaded_file(file, 'gallery')
        except ValueError as err:
            return jsonify({'error': str(err)}), 400
    else:
        file_path = request.form.get('file_path') or (request.get_json() or {}).get('file_path')
        
    if not title or not file_path:
        return jsonify({'error': 'Title and media file/URL are required'}), 400
        
    gallery_item = Gallery(
        title=title,
        description=description,
        media_type=media_type,
        file_path=file_path,
        category=category
    )
    db.session.add(gallery_item)
    db.session.commit()
    
    return jsonify({'message': 'Gallery item added successfully', 'item': gallery_item.to_dict()}), 201

@gallery_bp.route('/<int:item_id>', methods=['DELETE'])
@admin_required()
def delete_gallery_item(item_id):
    item = Gallery.query.get_or_404(item_id)
    
    if item.file_path and item.file_path.startswith('/uploads/'):
        rel_path = item.file_path.lstrip('/')
        full_path = os.path.join(Config.PROJECT_ROOT, rel_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Gallery item deleted successfully'}), 200
