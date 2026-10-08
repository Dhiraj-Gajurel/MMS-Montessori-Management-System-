from flask import Blueprint, request, jsonify
from server.models import ContactSubmission
from server.database import db
from server.utils.auth import admin_required

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('', methods=['POST'])
def submit_contact_form():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    phone = data.get('phone', '')

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    submission = ContactSubmission(
        name=name,
        email=email,
        phone=phone,
        message=message
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify({
        'message': 'Thank you! Your message has been received. We will contact you soon.'
    }), 201

@contact_bp.route('', methods=['GET'])
@admin_required()
def get_contact_submissions():
    submissions = ContactSubmission.query.order_by(ContactSubmission.submitted_at.desc()).all()
    return jsonify([s.to_dict() for s in submissions]), 200

@contact_bp.route('/<int:submission_id>/read', methods=['PUT'])
@admin_required()
def mark_submission_read(submission_id):
    sub = ContactSubmission.query.get_or_404(submission_id)
    sub.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read', 'submission': sub.to_dict()}), 200

@contact_bp.route('/<int:submission_id>', methods=['DELETE'])
@admin_required()
def delete_contact_submission(submission_id):
    sub = ContactSubmission.query.get_or_404(submission_id)
    db.session.delete(sub)
    db.session.commit()
    return jsonify({'message': 'Submission deleted successfully'}), 200
