from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date

from app import db, login_manager

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    team = db.Column(db.String(20), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    height = db.Column(db.Float, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.current_timestamp(),
        default=db.func.current_timestamp()
    )

    statistics = db.relationship('Statistics', backref='player', cascade="all, delete", lazy=True, order_by='Statistics.game_date.desc()')

    def __repr__(self):
        return f"Player('{self.name}', '{self.age}', '{self.team}', '{self.position}', '{self.height}', '{self.weight}', '{self.number}')"

class Statistics(db.Model):
    __tablename__ = 'statistics'
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    game_date = db.Column(db.Date, nullable=False, default=date.today)
    adverse_team = db.Column(db.String(20), nullable=False)
    minutes_played = db.Column(db.Integer, nullable=False)
    
    field_goals_made = db.Column(db.Integer, nullable=False, default=0)
    field_goals_attempted = db.Column(db.Integer, nullable=False, default=0)
    field_goal_percentage = db.Column(db.Float, nullable=True)
    
    three_points_made = db.Column(db.Integer, nullable=False, default=0)
    three_points_attempted = db.Column(db.Integer, nullable=False, default=0)
    three_point_percentage = db.Column(db.Float, nullable=True)
    
    free_throws_made = db.Column(db.Integer, nullable=False, default=0)
    free_throws_attempted = db.Column(db.Integer, nullable=False, default=0)
    free_throw_percentage = db.Column(db.Float, nullable=True)
    
    points = db.Column(db.Integer, nullable=False, default=0)
    rebounds = db.Column(db.Integer, nullable=False, default=0)
    assists = db.Column(db.Integer, nullable=False, default=0)
    steals = db.Column(db.Integer, nullable=False, default=0)
    blocks = db.Column(db.Integer, nullable=False, default=0)
    turnovers = db.Column(db.Integer, nullable=False, default=0)
    fouls = db.Column(db.Integer, nullable=False, default=0)

    def __init__(self, **kwargs):
        super(Statistics, self).__init__(**kwargs)
        self.calculate_percentages()
    
    def calculate_percentages(self):
        if self.field_goals_attempted > 0:
            self.field_goal_percentage = round((self.field_goals_made / self.field_goals_attempted) * 100, 1)
        
        if self.three_points_attempted > 0:
            self.three_point_percentage = round((self.three_points_made / self.three_points_attempted) * 100, 1)
        
        if self.free_throws_attempted > 0:
            self.free_throw_percentage = round((self.free_throws_made / self.free_throws_attempted) * 100, 1)

        self.points = (self.field_goals_made * 2) + (self.three_points_made * 3) + self.free_throws_made

    def __repr__(self):
        return f"Statistics('{self.game_date}', '{self.adverse_team}', {self.points} pts)"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
