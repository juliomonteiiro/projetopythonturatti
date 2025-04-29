# Projeto Flask - Basquete

Este é um projeto baseado no **Flask**, utilizando banco de dados com **SQLAlchemy** e migrações com **Flask-Migrate**.  
O projeto permite gerenciar informações sobre um time de basquete (ou qualquer outro tipo de dados que você desejar).

## Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas:

- Python 3.x (recomenda-se a versão mais recente)
- pip (gerenciador de pacotes do Python)
- Git (para controle de versão)

## Iniciando o Projeto

### 1. Clone o repositório

Clone este repositório para sua máquina local:

```bash
https://github.com/juliomonteiiro/projetopythonturatti.git
cd projeto_basquete
```

### 2. Crie um ambiente virtual

É uma boa prática usar um ambiente virtual para isolar as dependências do projeto.  
Para criar e ativar um ambiente virtual:

- **No Windows**:

```bash
python -m venv venv
.\venv\Scripts\activate
```

- **No Linux/Mac**:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as dependências

Com o ambiente virtual ativado, instale as dependências do projeto:

```bash
pip install -r requirements.txt
```

### 4. Configuração do banco de dados

Certifique-se de que o seu banco de dados está configurado corretamente no arquivo `config.py`.  
Exemplo de configuração usando **SQLite**:

```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = 'sua-chave-secreta'
```

Se estiver usando **PostgreSQL**, **MySQL** ou outro banco de dados, altere a URI conforme suas configurações.

### 5. Criar e aplicar as migrações

Com o **Flask-Migrate**, você pode gerar migrações automaticamente para criar e atualizar o banco de dados.

- Inicialize o banco de dados:

```bash
flask db init
```

- Crie as migrações:

```bash
flask db migrate -m "Initial migration"
```

- Aplique as migrações:

```bash
flask db upgrade
```

### 6. Rodando o Servidor Flask

Agora, você pode rodar o servidor de desenvolvimento Flask:

```bash
flask run
```

O servidor estará rodando em:  
[http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### 7. Verificando o funcionamento

Abra o navegador e acesse:  
[http://127.0.0.1:5000/](http://127.0.0.1:5000/)  

Você poderá interagir com a aplicação ou testar os endpoints, dependendo da estrutura do projeto.

### 8. Comandos úteis

- Iniciar a aplicação:

```bash
flask run
```

- Criar migração após modificar os models:

```bash
flask db migrate -m "mensagem explicativa da migração"
```

- Aplicar migrações:

```bash
flask db upgrade
```

- Reverter migrações:

```bash
flask db downgrade
```

## 9. Estrutura e arquivos importantes

- `config.py`: Contém as configurações do Flask, como a URI do banco de dados e a chave secreta.
- `app/`: Contém a lógica do aplicativo, incluindo modelos, views e controllers.
- `migrations/`: Diretório gerado pelo Flask-Migrate para armazenar as migrações do banco de dados.
- `requirements.txt`: Lista as dependências necessárias para rodar o projeto.
- `run.py`: Arquivo principal para rodar a aplicação.

## Contribuição

Se você quiser contribuir com o projeto, siga estas etapas:

1. Faça um **fork** deste repositório.
2. Crie uma **nova branch** para suas alterações.
3. Faça suas alterações e envie um **pull request** para a branch `master`.

## Licença

Este projeto está licenciado sob a **Licença MIT**.

## Adicionando dependências

No arquivo `requirements.txt`, adicione as seguintes dependências (ajuste conforme necessário):

```
Flask
Flask-SQLAlchemy
Flask-Migrate
python-dotenv
```

Depois de adicionar ou alterar as dependências, instale novamente:

```bash
pip install -r requirements.txt
```
