from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User
from app import db

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('main.home'))
        else:
            flash('Credenciais inválidas, tente novamente.', 'danger')

    return render_template('auth/login.html', hide_nav=True, title='Login')

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
        
    if request.method == 'POST':
        name = request.form.get('name')
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if password != confirm_password:
            flash('As senhas não coincidem. Tente novamente.', 'danger')
        else:
            existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
            if existing_user:
                if existing_user.username == username:
                    flash('Nome de usuário já em uso. Escolha outro.', 'danger')
                else:
                    flash('E-mail já cadastrado. Use outro e-mail ou faça login.', 'danger')
            else:
                hashed_password = generate_password_hash(password, method='sha256')
                new_user = User(name=name, username=username, email=email, password_hash=hashed_password)
                db.session.add(new_user)
                db.session.commit()
                flash('Registro realizado com sucesso! Faça login para continuar.', 'success')
                return redirect(url_for('auth.login'))

    return render_template('auth/register.html', hide_nav=True, title='Registrar')

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Você foi desconectado.', "info")
    return redirect(url_for('auth.login'))
