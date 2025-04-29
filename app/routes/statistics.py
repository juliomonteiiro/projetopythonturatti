from flask import Blueprint, render_template
from app.models import Statistics

bp = Blueprint('statistics', __name__)

@bp.route('/statistics')
def list_statistics():
    statistics = Statistics.query.all()
    return render_template('statistics.html', statistics=statistics)
