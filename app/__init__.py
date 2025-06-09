from flask import Flask, Response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_required
from dotenv import load_dotenv
import os

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app():
    load_dotenv()
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object('config.Config')
    app.config.from_pyfile('config.py')
    
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @app.after_request
    def add_no_cache_headers(response):
        """Add headers to disable caching for all responses."""

        response.cache_control.no_store = True
        response.cache_control.no_cache = True
        response.cache_control.must_revalidate = True
        response.expires = 0
        return response

    from app.routes import auth, players, statistics, main
    app.register_blueprint(auth.bp)
    app.register_blueprint(players.bp)
    app.register_blueprint(statistics.bp)
    app.register_blueprint(main.bp, url_prefix='')
    
    # Rota raiz redireciona para a página inicial principal
    @app.route('/')
    @login_required
    def index():
        from flask import redirect, url_for
        return redirect(url_for('main.home'))

    return app

@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))
