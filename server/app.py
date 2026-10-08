import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from server.config import Config
from server.database import db
from server.routes.auth import auth_bp
from server.routes.programs import programs_bp
from server.routes.resources import resources_bp
from server.routes.gallery import gallery_bp
from server.routes.events import events_bp
from server.routes.contact import contact_bp
from server.init_db import seed_database

def create_app():
    app = Flask(
        __name__, 
        static_folder=os.path.join(Config.PROJECT_ROOT, 'client'),
        static_url_path=''
    )
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(programs_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(gallery_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(contact_bp)

    # Serve static uploads
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    # Serve HTML Client Pages
    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:filename>')
    def serve_client_file(filename):
        client_dir = app.static_folder
        if os.path.exists(os.path.join(client_dir, filename)):
            return send_from_directory(client_dir, filename)
        # Fallback to index if route unknown
        return send_from_directory(client_dir, 'index.html')

    # Seed Database on Startup
    with app.app_context():
        seed_database(app)

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Montessori School Web Server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
