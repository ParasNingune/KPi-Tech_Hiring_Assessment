from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foodstore.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_SORT_KEYS'] = False
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from app.routes.menu import menu_bp
    from app.routes.orders import orders_bp
    from app.routes.search import search_bp
    
    app.register_blueprint(menu_bp, url_prefix='/api/menu')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    
    # Create tables
    with app.app_context():
        db.create_all()
        from app.models.menu import MenuItem
        # Seed initial data if empty
        if MenuItem.query.count() == 0:
            _seed_initial_data()
    
    return app

def _seed_initial_data():
    """Seed database with initial menu items"""
    from app.models.menu import MenuItem
    import json
    
    initial_items = [
        # Appetizers
        MenuItem(
            name="Garlic Bread",
            description="Crispy bread with garlic butter and herbs",
            category="Appetizers",
            price=4.99,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Spring Rolls",
            description="Crispy spring rolls with sweet chili sauce",
            category="Appetizers",
            price=5.99,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            available=True
        ),
        # Main Courses
        MenuItem(
            name="Margherita Pizza",
            description="Fresh mozzarella, basil, and tomato sauce",
            category="Main Courses",
            price=12.99,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Grilled Chicken Steak",
            description="Juicy grilled chicken breast with herb butter",
            category="Main Courses",
            price=15.99,
            dietary_tags=json.dumps(["gluten-free", "high-protein"]),
            available=True
        ),
        MenuItem(
            name="Spicy Vegetable Curry",
            description="Aromatic curry with mixed vegetables and coconut milk",
            category="Main Courses",
            price=11.99,
            dietary_tags=json.dumps(["vegetarian", "vegan", "spicy"]),
            available=True
        ),
        MenuItem(
            name="Salmon Fillet",
            description="Pan-seared salmon with lemon and capers",
            category="Main Courses",
            price=18.99,
            dietary_tags=json.dumps(["gluten-free", "high-protein"]),
            available=True
        ),
        # Desserts
        MenuItem(
            name="Chocolate Cake",
            description="Rich chocolate cake with vanilla frosting",
            category="Desserts",
            price=6.99,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Cheesecake",
            description="Creamy New York style cheesecake",
            category="Desserts",
            price=7.99,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        # Beverages
        MenuItem(
            name="Fresh Orange Juice",
            description="Freshly squeezed orange juice",
            category="Beverages",
            price=3.99,
            dietary_tags=json.dumps(["vegetarian", "vegan", "gluten-free"]),
            available=True
        ),
        MenuItem(
            name="Iced Coffee",
            description="Cold brew coffee with ice and milk",
            category="Beverages",
            price=4.49,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
    ]
    
    for item in initial_items:
        db.session.add(item)
    
    db.session.commit()
