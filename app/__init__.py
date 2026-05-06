import os
from config import get_config
from .extensions import db, ma, migrate, jwt, mail, limiter

from flask import Flask, request, jsonify
from flask_cors import CORS

def create_app():
    config = get_config()
    app = Flask(
        __name__,
        template_folder='static/dist',
        static_folder='static/dist',
        static_url_path=''
    )
    app.config.from_object(config)

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)

    # ── JWT User Lookup ───────────────────────────────────────────────────────
    from .models.user import User
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        user = User.query.filter_by(id=str(identity), is_deleted=False).first()
        if not user:
            print(f"DEBUG AUTH: Usuario con ID {identity} no encontrado o inactivo.")
        return user

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # ── Audit Listeners ───────────────────────────────────────────────────────
    from .utils.audit_listener import register_audit_listeners_v2
    with app.app_context():
        register_audit_listeners_v2()

    # ── Scheduler (cola FIFO de reservas) ─────────────────────────────────────
    # Evitar doble-lanzamiento bajo el reloader de Flask en desarrollo.
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        from .services.scheduler import init_scheduler
        init_scheduler(app)

    # ── Blueprints ────────────────────────────────────────────────────────────
    from .routes.auth_routes import auth_bp
    from .routes.item_routes import items_bp
    from .routes.dashboard_routes import dashboard_bp
    from .routes.user_routes import user_bp
    from .routes.audit_routes import audit_bp
    from .routes.loan_routes import loan_bp
    from .routes.reservation_routes import reservation_bp
    from .routes.maintenance_routes import maintenance_bp
    from .routes.report_routes import report_bp
    from .routes.output_routes import output_bp
    from .routes.notification_routes import notification_bp
    from .routes.history_routes import history_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/v1/auth')
    app.register_blueprint(items_bp,     url_prefix='/api/v1/items')
    app.register_blueprint(dashboard_bp, url_prefix='/api/v1/dashboard')
    app.register_blueprint(user_bp,      url_prefix='/api/v1/users_mgmt')
    app.register_blueprint(audit_bp,     url_prefix='/api/v1/audit')
    app.register_blueprint(loan_bp,      url_prefix='/api/v1/loans')
    app.register_blueprint(reservation_bp, url_prefix='/api/v1/reservations')
    app.register_blueprint(maintenance_bp, url_prefix='/api/v1/maintenance')
    app.register_blueprint(report_bp,      url_prefix='/api/v1/reports_mgmt')
    app.register_blueprint(output_bp,      url_prefix='/api/v1/outputs')
    app.register_blueprint(notification_bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(history_bp,     url_prefix='/api/v1/history')

    # ── Security & Cache Headers ──────────────────────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Frame-Options']        = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy']        = 'strict-origin-when-cross-origin'
        if not app.debug:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Prevent caching of index.html and HTML responses so frontend updates are loaded instantly
        if request.path == '/' or request.path.endswith('.html') or response.mimetype == 'text/html':
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        return response

    # ── Error Handling ────────────────────────────────────────────────────────
    @app.errorhandler(404)
    def handle_404(e):
        if request.path.startswith('/api/'):
            return jsonify({"message": "Not found", "path": request.path}), 404
        return app.send_static_file('index.html')

    @app.errorhandler(429)
    def handle_rate_limit(e):
        return jsonify({"message": "Too many requests"}), 429

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        print("EXCEPCION NO CAPTURADA:", traceback.format_exc())
        if request.path.startswith('/api/'):
            return jsonify({"error": str(e)}), 500
        return jsonify({"error": "Unexpected error"}), 500

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    # Catch-all for React Router: serve index.html for all non-API routes
    @app.route('/<path:path>')
    def spa_fallback(path):
        if path.startswith('api/'):
            return jsonify({"message": "Not found"}), 404
        return app.send_static_file('index.html')

    return app
