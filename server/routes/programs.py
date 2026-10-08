from flask import Blueprint, request, jsonify
from server.models import Program
from server.database import db
from server.utils.auth import admin_required

programs_bp = Blueprint('programs', __name__, url_prefix='/api/programs')

@programs_bp.route('', methods=['GET'])
def get_programs():
    programs = Program.query.order_by(Program.id.asc()).all()
    return jsonify([p.to_dict() for p in programs]), 200

@programs_bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    program = Program.query.get_or_404(program_id)
    return jsonify(program.to_dict()), 200

@programs_bp.route('', methods=['POST'])
@admin_required()
def create_program():
    data = request.get_json() or {}
    title = data.get('title')
    age_group = data.get('age_group')
    description = data.get('description')
    
    if not title or not age_group or not description:
        return jsonify({'error': 'Title, age group, and description are required'}), 400
        
    program = Program(
        title=title,
        age_group=age_group,
        description=description,
        objectives=data.get('objectives', ''),
        activities=data.get('activities', ''),
        highlights=data.get('highlights', ''),
        icon=data.get('icon', 'blocks')
    )
    db.session.add(program)
    db.session.commit()
    
    return jsonify({'message': 'Program created successfully', 'program': program.to_dict()}), 201

@programs_bp.route('/<int:program_id>', methods=['PUT'])
@admin_required()
def update_program(program_id):
    program = Program.query.get_or_404(program_id)
    data = request.get_json() or {}
    
    program.title = data.get('title', program.title)
    program.age_group = data.get('age_group', program.age_group)
    program.description = data.get('description', program.description)
    program.objectives = data.get('objectives', program.objectives)
    program.activities = data.get('activities', program.activities)
    program.highlights = data.get('highlights', program.highlights)
    program.icon = data.get('icon', program.icon)
    
    db.session.commit()
    return jsonify({'message': 'Program updated successfully', 'program': program.to_dict()}), 200

@programs_bp.route('/<int:program_id>', methods=['DELETE'])
@admin_required()
def delete_program(program_id):
    program = Program.query.get_or_404(program_id)
    db.session.delete(program)
    db.session.commit()
    return jsonify({'message': 'Program deleted successfully'}), 200
