from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from app.models import Player, db
from datetime import datetime, timezone, timedelta

bp = Blueprint('players', __name__)

BRASILIA_TZ = timezone(timedelta(hours=-3))

@bp.route('/players')
def list_players():
    players = Player.query.all()
    return render_template('main/team.html', players=players)

def to_brasilia(dt):
    if not dt:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=BRASILIA_TZ)
    return dt.astimezone(BRASILIA_TZ)

def player_to_dict(player):
    created_at = to_brasilia(player.created_at) if player.created_at else None
    return {
        'id': player.id,
        'name': player.name,
        'age': player.age,
        'team': player.team,
        'position': player.position,
        'height': float(player.height) if player.height is not None else None,
        'weight': float(player.weight) if player.weight is not None else None,
        'number': player.number,
        'created_at': created_at.isoformat() if created_at else None
    }

@bp.route('/api/players', methods=['GET'])
@login_required
def api_get_players():
    players = Player.query.all()
    response_data = [player_to_dict(p) for p in players]
    return jsonify(response_data)

@bp.route('/api/players/<int:player_id>', methods=['GET'])
@login_required
def api_get_player(player_id):
    player = Player.query.get_or_404(player_id)
    return jsonify(player_to_dict(player))

@bp.route('/api/players', methods=['POST'])
@login_required
def api_add_player():
    data = request.get_json()
    existing_player = Player.query.filter_by(team=data['team'], number=data['number']).first()
    if existing_player:
        return jsonify({'error': f'Já existe um jogador com o número {data["number"]} no time {data["team"]}'}), 400
    created_at = datetime.now(BRASILIA_TZ)
    player = Player(
        name=data['name'],
        age=data['age'],
        team=data['team'],
        position=data['position'],
        height=data['height'],
        weight=data['weight'],
        number=data['number'],
        created_at=created_at
    )
    db.session.add(player)
    db.session.commit()
    return jsonify({'message': 'Jogador adicionado com sucesso', 'id': player.id}), 201

@bp.route('/api/players/<int:player_id>', methods=['PUT'])
@login_required
def api_update_player(player_id):
    try:
        player = Player.query.get_or_404(player_id)
        data = request.get_json()
        team = data.get('team', player.team)
        if 'number' in data:
            new_number = None
            try:
                new_number = int(data['number']) if data['number'] is not None else None
            except (ValueError, TypeError):
                return jsonify({'error': 'Número de camisa inválido'}), 400
            if new_number != player.number:
                existing_player = Player.query.filter(
                    Player.team == team,
                    Player.number == new_number,
                    Player.id != player.id
                ).first()
                if existing_player:
                    return jsonify({'error': f'Já existe outro jogador com o número {new_number} no time {team}'}), 400
            if new_number is not None:
                player.number = new_number

        def convert_value(key, value, current_value):
            if value is None:
                return current_value
            if key in ['age', 'number']:
                try:
                    return int(value)
                except (ValueError, TypeError):
                    return current_value
            elif key in ['height', 'weight']:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    return current_value
            return value

        for key, value in data.items():
            if hasattr(player, key):
                setattr(player, key, convert_value(key, value, getattr(player, key)))

        db.session.commit()
        return jsonify({'message': 'Jogador atualizado com sucesso', 'player': player_to_dict(player)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/players/<int:player_id>', methods=['DELETE'])
@login_required
def api_delete_player(player_id):
    try:
        player = Player.query.get(player_id)
        if not player:
            return jsonify({'error': 'Jogador não encontrado'}), 404
        for stat in player.statistics:
            db.session.delete(stat)
        db.session.delete(player)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Jogador removido com sucesso', 'deleted_id': player_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': f'Erro ao excluir jogador: {str(e)}'}), 500
