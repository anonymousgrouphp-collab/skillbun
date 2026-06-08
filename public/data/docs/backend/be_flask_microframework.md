# Flask: Lightweight Micro-Framework

Flask is a popular Python web framework, classified as a micro-framework due to its minimalist design. It provides the essentials for web development without imposing strict dependencies or a rigid project structure. This makes Flask an excellent choice for building smaller applications, APIs, and microservices where flexibility and control are paramount.

## 1. Core Concepts of Flask

### What is a Micro-Framework?
Unlike full-stack frameworks (like Django), Flask doesn't include built-in features for databases, authentication, or ORMs. Instead, it relies on extensions to add functionality. This approach keeps the core small, easy to learn, and highly customizable.

### Key Components:
*   **Werkzeug**: A WSGI (Web Server Gateway Interface) utility library that handles requests and responses.
*   **Jinja2**: A powerful templating engine for rendering HTML pages.

## 2. Getting Started with Flask

### Installation
You can install Flask using pip:
```bash
pip install Flask
```

### Your First Flask Application (Hello World!)
Create a file (e.g., `app.py`):
```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Flask World!'

if __name__ == '__main__':
    app.run(debug=True)
```
To run the application:
```bash
python app.py
```
Open your browser and navigate to `http://127.0.0.1:5000/`. You should see "Hello, Flask World!".

## 3. Routing

Routing maps URL paths to specific functions in your application. The `@app.route()` decorator is used for this.

### Basic Routing
```python
@app.route('/about')
def about():
    return 'This is the About page.'
```

### Dynamic Routes
Flask allows you to add variable parts to URLs.
```python
@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return f'User: {username}'

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, which is an integer
    return f'Post ID: {post_id}'
```
`username` and `post_id` become arguments to the function. Type converters (like `int:`) ensure the variable matches a specific type.

## 4. Request Handling

The `request` object, imported from `flask`, provides access to incoming request data, such as form data, JSON payloads, headers, and query parameters.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username') # For form data
        password = request.form.get('password')
        # Process login...
        return f'Login attempt with username: {username}'
    return '''
        <form method="post">
            <p><input type=text name=username></p>
            <p><input type=password name=password></p>
            <p><input type=submit value=Login></p>
        </form>
    '''

@app.route('/api/data', methods=['POST'])
def receive_data():
    if request.is_json:
        data = request.get_json() # For JSON payload
        name = data.get('name')
        value = data.get('value')
        return jsonify({"message": f"Received name: {name}, value: {value}"}), 200
    return jsonify({"error": "Request must be JSON"}), 400

@app.route('/search')
def search():
    query = request.args.get('q') # For URL query parameters (e.g., /search?q=flask)
    return f'You searched for: {query}' if query else 'Please provide a search query.'

```
*   `request.method`: Checks the HTTP method.
*   `request.form`: A dictionary-like object for accessing form data (from POST requests).
*   `request.get_json()`: Parses JSON data from the request body.
*   `request.args`: A dictionary-like object for accessing query parameters in the URL.
*   `jsonify`: Helper to return JSON responses.

## 5. Blueprints: Modular Applications

Blueprints allow you to organize your Flask application into smaller, reusable components. This is crucial for larger projects. Each blueprint can have its own routes, templates, and static files.

### Example Structure with Blueprints
```
my_app/
├── app.py
├── auth/
│   ├── __init__.py
│   └── views.py
└── blog/
    ├── __init__.py
    └── views.py
```

### `my_app/auth/views.py`:
```python
from flask import Blueprint, render_template, request, redirect, url_for

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Handle login logic
        return redirect(url_for('auth.dashboard')) # 'auth.dashboard' refers to the blueprint's route
    return '<h1>Auth Login Page</h1>'

@auth_bp.route('/dashboard')
def dashboard():
    return '<h1>Auth Dashboard</h1>'
```

### `my_app/app.py`:
```python
from flask import Flask
from auth.views import auth_bp # Import the blueprint

app = Flask(__name__)

app.register_blueprint(auth_bp) # Register the blueprint

@app.route('/')
def index():
    return '<h1>Main Index Page</h1>'

if __name__ == '__main__':
    app.run(debug=True)
```
Now, the `login` route will be accessible via `/auth/login`.

## 6. Integrating with Extensions

Flask's strength lies in its extensive ecosystem of extensions. These provide solutions for common web development needs.

### Common Extensions:
*   **Flask-SQLAlchemy**: ORM for database interaction.
*   **Flask-WTF**: Integration with WTForms for form handling and validation.
*   **Flask-Login**: User session management.
*   **Flask-RESTful** or **Flask-RESTX**: For building RESTful APIs more easily.
*   **Flask-Migrate**: Database migrations (based on Alembic).

## Checklist / Exercise

1.  **Create a Basic API Endpoint**: Implement a Flask application with a `/greet/<name>` endpoint that returns a JSON response like `{"message": "Hello, <name>!"}`.
2.  **Handle POST Request with JSON**: Add an endpoint `/submit-data` that accepts a POST request with a JSON payload `{"item": "example", "quantity": 5}` and returns a confirmation JSON response.
3.  **Organize with Blueprint**: Refactor your application to use a blueprint for the `/greet` endpoint, registering it with a URL prefix like `/api`.