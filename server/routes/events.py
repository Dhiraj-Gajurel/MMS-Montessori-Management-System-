from flask import Blueprint, request, jsonify
import os
from server.models import Event
from server.database import db
from server.utils.auth import admin_required
from server.utils.file_upload import save_uploaded_file
from server.config import Config

events_bp = Blueprint('events', __name__, url_prefix='/api/events')

@events_bp.route('', methods=['GET'])
def get_events():
    category = request.args.get('category')
    query = Event.query
    if category and category.lower() != 'all':
        query = query.filter(Event.category.ilike(f"%{category}%"))
    events = query.order_by(Event.is_important.desc(), Event.created_at.desc()).all()
    return jsonify([e.to_dict() for e in events]), 200

@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict()), 200

@events_bp.route('', methods=['POST'])
@admin_required()
def create_event():
    # Supports JSON or FormData
    if request.files or request.form:
        title = request.form.get('title')
        content = request.form.get('content')
        category = request.form.get('category', 'Event')
        event_date = request.form.get('event_date')
        is_important = request.form.get('is_important') in ['true', 'True', '1', True]
        
        file = request.files.get('featured_image')
        featured_image = None
        if file and file.filename != '':
            try:
                featured_image = save_uploaded_file(file, 'events')
            except ValueError as err:
                return jsonify({'error': str(err)}), 400
        else:
            featured_image = request.form.get('featured_image_url')
    else:
        data = request.get_json() or {}
        title = data.get('title')
        content = data.get('content')
        category = data.get('category', 'Event')
        event_date = data.get('event_date')
        is_important = bool(data.get('is_important', False))
        featured_image = data.get('featured_image')

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    event = Event(
        title=title,
        content=content,
        category=category,
        featured_image=featured_image,
        event_date=event_date,
        is_important=is_important
    )
    db.session.add(event)
    db.session.commit()

    return jsonify({'message': 'Event created successfully', 'event': event.to_dict()}), 201

@events_bp.route('/<int:event_id>', methods=['PUT'])
@admin_required()
def update_event(event_id):
    event = Event.query.get_or_404(event_id)

    if request.files or request.form:
        event.title = request.form.get('title', event.title)
        event.content = request.form.get('content', event.content)
        event.category = request.form.get('category', event.category)
        event.event_date = request.form.get('event_date', event.event_date)
        if 'is_important' in request.form:
            event.is_important = request.form.get('is_important') in ['true', 'True', '1', True]
            
        file = request.files.get('featured_image')
        if file and file.filename != '':
            try:
                event.featured_image = save_uploaded_file(file, 'events')
            except ValueError as err:
                return jsonify({'error': str(err)}), 400
        elif request.form.get('featured_image_url'):
            event.featured_image = request.form.get('featured_image_url')
    else:
        data = request.get_json() or {}
        event.title = data.get('title', event.title)
        event.content = data.get('content', event.content)
        event.category = data.get('category', event.category)
        event.event_date = data.get('event_date', event.event_date)
        if 'is_important' in data:
            event.is_important = bool(data['is_important'])
        if 'featured_image' in data:
            event.featured_image = data['featured_image']

    db.session.commit()
    return jsonify({'message': 'Event updated successfully', 'event': event.to_dict()}), 200

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@admin_required()
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    if event.featured_image and event.featured_image.startswith('/uploads/'):
        rel_path = event.featured_image.lstrip('/')
        full_path = os.path.join(Config.PROJECT_ROOT, rel_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except Exception:
                pass

    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully'}), 200
