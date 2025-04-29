from flask import Blueprint, render_template
from app.models import Player

bp = Blueprint('players', __name__)

@bp.route('/players')
def list_players():
    players = Player.query.all()
    return render_template('players.html', players=players)

@bp.route('/players/<int:id>')
def view_player(id):
    player = Player.query.get_or_404(id)
    return render_template('player_profile.html', player=player)
