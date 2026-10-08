from flask import Blueprint, request, jsonify, send_from_directory
import os
from server.models import Resource
from server.database import db
from server.utils.auth import admin_required
from server.utils.file_upload import save_uploaded_file
from server.config import Config

resources_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@resources_bp.route('', methods=['GET'])
def get_resources():
    category = request.args.get('category')
    query = Resource.query
    if category and category.lower() != 'all':
        query = query.filter(Resource.category.ilike(f"%{category}%"))
    resources = query.order_by(Resource.created_at.desc()).all()
    return jsonify([r.to_dict() for r in resources]), 200

@resources_bp.route('/<int:resource_id>', methods=['GET'])
def get_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    return jsonify(resource.to_dict()), 200

@resources_bp.route('', methods=['POST'])
@admin_required()
def create_resource():
    title = request.form.get('title')
    description = request.form.get('description', '')
    category = request.form.get('category', 'Worksheets')
    file_type = request.form.get('file_type', 'PDF')
    
    file = request.files.get('file')
    file_path = None
    
    if file and file.filename != '':
        try:
            file_path = save_uploaded_file(file, 'resources')
        except ValueError as err:
            return jsonify({'error': str(err)}), 400
    else:
        # Check if direct path or external URL provided
        file_path = request.form.get('file_path') or (request.get_json() or {}).get('file_path')

    if not title or not file_path:
        return jsonify({'error': 'Title and a file/file path are required'}), 400

    resource = Resource(
        title=title,
        description=description,
        category=category,
        file_path=file_path,
        file_type=file_type
    )
    db.session.add(resource)
    db.session.commit()

    return jsonify({'message': 'Resource added successfully', 'resource': resource.to_dict()}), 201

@resources_bp.route('/<int:resource_id>', methods=['PUT'])
@admin_required()
def update_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    
    # Handle form or JSON
    if request.files or request.form:
        title = request.form.get('title', resource.title)
        description = request.form.get('description', resource.description)
        category = request.form.get('category', resource.category)
        file_type = request.form.get('file_type', resource.file_type)
        
        file = request.files.get('file')
        if file and file.filename != '':
            try:
                resource.file_path = save_uploaded_file(file, 'resources')
            except ValueError as err:
                return jsonify({'error': str(err)}), 400
    else:
        data = request.get_json() or {}
        title = data.get('title', resource.title)
        description = data.get('description', resource.description)
        category = data.get('category', resource.category)
        file_type = data.get('file_type', resource.file_type)
        if 'file_path' in data:
            resource.file_path = data['file_path']

    resource.title = title
    resource.description = description
    resource.category = category
    resource.file_type = file_type
    
    db.session.commit()
    return jsonify({'message': 'Resource updated successfully', 'resource': resource.to_dict()}), 200

@resources_bp.route('/<int:resource_id>', methods=['DELETE'])
@admin_required()
def delete_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    
    # Optionally delete physical file if inside /uploads/
    if resource.file_path and resource.file_path.startswith('/uploads/'):
        rel_path = resource.file_path.lstrip('/')
        full_path = os.path.join(Config.PROJECT_ROOT, rel_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass
                
    db.session.delete(resource)
    db.session.commit()
    return jsonify({'message': 'Resource deleted successfully'}), 200
