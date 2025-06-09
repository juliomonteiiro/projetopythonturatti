from flask import Blueprint, render_template
from flask_login import login_required

bp = Blueprint('main', __name__)

@bp.route('/home')
@login_required
def home():
    """Rota principal da aplicação"""
    return render_template('main/home.html')

@bp.route('/team')
@login_required
def team():
    """Rota da página da equipe"""
    return render_template('main/team.html')

@bp.route('/stats')
@login_required
def stats():
    """Rota da página de estatísticas"""
    return render_template('main/stats.html')