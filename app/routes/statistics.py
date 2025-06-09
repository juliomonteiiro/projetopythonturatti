from flask import Blueprint, render_template, jsonify, request, url_for
from flask_login import login_required, current_user
from app.models import Statistics, Player, db
from sqlalchemy import func
from datetime import datetime
from sqlalchemy.sql import text

bp = Blueprint('statistics', __name__)

@bp.route('/api/teams/stats', methods=['GET'])
@login_required
def api_get_teams_stats():
    team_stats = db.session.query(
        Player.team,
        func.count(Player.id).label('player_count'),
        func.coalesce(func.avg(Statistics.points), 0).label('avg_points'),
        func.coalesce(func.avg(Statistics.rebounds), 0).label('avg_rebounds'),
        func.coalesce(func.avg(Statistics.assists), 0).label('avg_assists'),
        func.coalesce(func.avg(Statistics.steals), 0).label('avg_steals'),
        func.coalesce(func.avg(Statistics.blocks), 0).label('avg_blocks')
    ).outerjoin(Statistics, Player.id == Statistics.player_id)\
     .group_by(Player.team)\
     .order_by(Player.team)\
     .all()
    
    player_counts = db.session.query(
        Player.team,
        func.count(Player.id).label('player_count')
    ).group_by(Player.team).all()
    
    player_count_dict = {team: count for team, count in player_counts}
    
    teams = []
    for team, player_count, avg_pts, avg_reb, avg_ast, avg_stl, avg_blk in team_stats:
        teams.append({
            'name': team,
            'player_count': player_count_dict.get(team, 0),
            'avg_stats': {
                'points': round(float(avg_pts), 1),
                'rebounds': round(float(avg_reb), 1),
                'assists': round(float(avg_ast), 1),
                'steals': round(float(avg_stl), 1),
                'blocks': round(float(avg_blk), 1)
            }
        })
    
    return jsonify(teams)

@bp.route('/api/teams/<team_name>/players', methods=['GET'])
@login_required
def api_get_team_players(team_name):
    players = Player.query.filter_by(team=team_name).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'number': p.number,
        'position': p.position,
        'profile_url': url_for('main.player_stats', player_id=p.id, _external=True)
    } for p in players])

@bp.route('/statistics')
@login_required
def list_statistics():
    return render_template('stats.html')

@bp.route('/api/statistics', methods=['GET'])
@login_required
def api_get_statistics():
    stats = Statistics.query.all()
    return jsonify([{
        'id': s.id,
        'player_id': s.player_id,
        'game_date': s.game_date.isoformat(),
        'adverse_team': s.adverse_team,
        'points': s.points,
        'rebounds': s.rebounds,
        'assists': s.assists,
        'steals': s.steals,
        'blocks': s.blocks,
        'turnovers': s.turnovers,
        'fouls': s.fouls,
        'minutes_played': s.minutes_played
    } for s in stats])

@bp.route('/api/player-stats/<int:player_id>', methods=['GET'])
@login_required
def api_get_player_statistics(player_id):
    try:
        stats = Statistics.query.filter_by(player_id=player_id).order_by(Statistics.game_date.desc()).all()
        return jsonify([{
            'id': s.id,
            'game_date': s.game_date.isoformat(),
            'adverse_team': s.adverse_team,
            'minutes_played': s.minutes_played,
            'points': s.points,
            'field_goals_made': s.field_goals_made,
            'field_goals_attempted': s.field_goals_attempted,
            'field_goal_percentage': s.field_goal_percentage,
            'three_points_made': s.three_points_made,
            'three_points_attempted': s.three_points_attempted,
            'three_point_percentage': s.three_point_percentage,
            'free_throws_made': s.free_throws_made,
            'free_throws_attempted': s.free_throws_attempted,
            'free_throw_percentage': s.free_throw_percentage,
            'rebounds': s.rebounds,
            'assists': s.assists,
            'steals': s.steals,
            'blocks': s.blocks,
            'turnovers': s.turnovers,
            'fouls': s.fouls
        } for s in stats])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/player-stats', methods=['POST'])
@login_required
def api_add_statistic():
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = [
            'player_id', 'game_date', 'adverse_team', 'minutes_played',
            'field_goals_made', 'field_goals_attempted', 'three_points_made',
            'three_points_attempted', 'free_throws_made', 'free_throws_attempted',
            'rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls'
        ]
        
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return jsonify({'error': f'Campos obrigatórios faltando: {", ".join(missing_fields)}'}), 400
        
        # Converter tipos de dados
        try:
            game_date = datetime.strptime(data['game_date'], '%Y-%m-%d').date()
            
            # Validar valores numéricos
            stats_data = {
                'player_id': data['player_id'],
                'game_date': game_date,
                'adverse_team': data['adverse_team'],
                'minutes_played': max(0, int(data['minutes_played'])),
                'field_goals_made': max(0, int(data['field_goals_made'])),
                'field_goals_attempted': max(0, int(data['field_goals_attempted'])),
                'three_points_made': max(0, int(data['three_points_made'])),
                'three_points_attempted': max(0, int(data['three_points_attempted'])),
                'free_throws_made': max(0, int(data['free_throws_made'])),
                'free_throws_attempted': max(0, int(data['free_throws_attempted'])),
                'rebounds': max(0, int(data['rebounds'])),
                'assists': max(0, int(data['assists'])),
                'steals': max(0, int(data['steals'])),
                'blocks': max(0, int(data['blocks'])),
                'turnovers': max(0, int(data['turnovers'])),
                'fouls': max(0, min(5, int(data['fouls'])))  # Máximo de 5 faltas
            }
            
            # Validar consistência dos arremessos
            if stats_data['field_goals_made'] > stats_data['field_goals_attempted']:
                return jsonify({'error': 'Arremessos de quadra convertidos não podem ser maiores que tentados'}), 400
                
            if stats_data['three_points_made'] > stats_data['three_points_attempted']:
                return jsonify({'error': 'Arremessos de 3 pontos convertidos não podem ser maiores que tentados'}), 400
                
            if stats_data['free_throws_made'] > stats_data['free_throws_attempted']:
                return jsonify({'error': 'Lances livres convertidos não podem ser maiores que tentados'}), 400
            
            # Calcular pontos totais
            stats_data['points'] = (
                stats_data['field_goals_made'] * 2 +
                stats_data['three_points_made'] * 3 +
                stats_data['free_throws_made']
            )
            
            # Criar estatística
            stat = Statistics(**stats_data)
            
            # Calcular porcentagens
            stat.calculate_percentages()
            
            db.session.add(stat)
            db.session.commit()
            
            return jsonify({
                'message': 'Estatística adicionada com sucesso', 
                'id': stat.id,
                'points': stat.points
            }), 201
            
        except ValueError as e:
            return jsonify({'error': f'Erro na conversão de dados: {str(e)}'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao adicionar estatística: {str(e)}'}), 500

@bp.route('/api/player-stats/<int:stat_id>', methods=['PUT'])
@login_required
def api_update_statistic(stat_id):
    try:
        stat = Statistics.query.get_or_404(stat_id)
        data = request.get_json()
        
        if 'game_date' in data:
            stat.game_date = datetime.strptime(data['game_date'], '%Y-%m-%d').date()
        
        stat.adverse_team = data.get('adverse_team', stat.adverse_team)
        stat.minutes_played = int(data.get('minutes_played', stat.minutes_played))
        
        stat.field_goals_made = int(data.get('field_goals_made', stat.field_goals_made))
        stat.field_goals_attempted = int(data.get('field_goals_attempted', stat.field_goals_attempted))
        stat.three_points_made = int(data.get('three_points_made', stat.three_points_made))
        stat.three_points_attempted = int(data.get('three_points_attempted', stat.three_points_attempted))
        stat.free_throws_made = int(data.get('free_throws_made', stat.free_throws_made))
        stat.free_throws_attempted = int(data.get('free_throws_attempted', stat.free_throws_attempted))
        
        stat.rebounds = int(data.get('rebounds', stat.rebounds))
        stat.assists = int(data.get('assists', stat.assists))
        stat.steals = int(data.get('steals', stat.steals))
        stat.blocks = int(data.get('blocks', stat.blocks))
        stat.turnovers = int(data.get('turnovers', stat.turnovers))
        stat.fouls = int(data.get('fouls', stat.fouls))
        
        stat.calculate_percentages()
        
        db.session.commit()
        return jsonify({'message': 'Estatística atualizada com sucesso'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/player-stats/<int:stat_id>', methods=['DELETE'])
@login_required
def api_delete_statistic(stat_id):
    try:
        stat = Statistics.query.get_or_404(stat_id)
        player_id = stat.player_id
        db.session.delete(stat)
        db.session.commit()
        return jsonify({
            'message': 'Estatística removida com sucesso',
            'player_id': player_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
