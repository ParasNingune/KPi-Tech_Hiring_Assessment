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
    """Seed database with initial menu items and historical orders"""
    from app.models.menu import MenuItem
    from app.models.order import Order, OrderItem
    from datetime import datetime, timedelta
    import json
    
    initial_items = [
        # Appetizers
        MenuItem(
            name="Garlic Bread",
            description="Crispy bread with garlic butter and herbs",
            category="Appetizers",
            price=199.00,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Spring Rolls",
            description="Crispy spring rolls with sweet chili sauce",
            category="Appetizers",
            price=249.00,
            dietary_tags=json.dumps(["vegetarian", "gluten-free"]),
            available=True
        ),
        # Main Courses
        MenuItem(
            name="Margherita Pizza",
            description="Fresh mozzarella, basil, and tomato sauce",
            category="Main Courses",
            price=399.00,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Grilled Chicken Steak",
            description="Juicy grilled chicken breast with herb butter",
            category="Main Courses",
            price=549.00,
            dietary_tags=json.dumps(["gluten-free", "high-protein"]),
            available=True
        ),
        MenuItem(
            name="Spicy Vegetable Curry",
            description="Aromatic curry with mixed vegetables and coconut milk",
            category="Main Courses",
            price=349.00,
            dietary_tags=json.dumps(["vegetarian", "vegan", "spicy"]),
            available=True
        ),
        MenuItem(
            name="Salmon Fillet",
            description="Pan-seared salmon with lemon and capers",
            category="Main Courses",
            price=899.00,
            dietary_tags=json.dumps(["gluten-free", "high-protein"]),
            available=True
        ),
        # Desserts
        MenuItem(
            name="Chocolate Cake",
            description="Rich chocolate cake with vanilla frosting",
            category="Desserts",
            price=249.00,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        MenuItem(
            name="Cheesecake",
            description="Creamy New York style cheesecake",
            category="Desserts",
            price=299.00,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
        # Beverages
        MenuItem(
            name="Fresh Orange Juice",
            description="Freshly squeezed orange juice",
            category="Beverages",
            price=149.00,
            dietary_tags=json.dumps(["vegetarian", "vegan", "gluten-free"]),
            available=True
        ),
        MenuItem(
            name="Iced Coffee",
            description="Cold brew coffee with ice and milk",
            category="Beverages",
            price=179.00,
            dietary_tags=json.dumps(["vegetarian"]),
            available=True
        ),
    ]
    
    for item in initial_items:
        db.session.add(item)
    db.session.commit()

    # Now seed some sample orders for the last 7 days
    menu_map = {item.name: item for item in initial_items}

    # Customers info
    customers = [
        {"name": "Aarav Sharma", "email": "aarav.sharma@example.com", "phone": "9876543210"},
        {"name": "Priya Patel", "email": "priya.patel@example.com", "phone": "9812345678"},
        {"name": "Rohan Das", "email": "rohan.das@example.com", "phone": "9765432109"},
        {"name": "Ananya Sen", "email": "ananya.sen@example.com", "phone": "9654321098"}
    ]

    # Historical orders specification (days_ago, customer, items_list)
    history = [
        (6, customers[0], [("Spring Rolls", 1), ("Iced Coffee", 1)]), # 249 + 179 = 428
        (5, customers[1], [("Margherita Pizza", 1), ("Fresh Orange Juice", 1)]), # 399 + 149 = 548
        (4, customers[2], [("Garlic Bread", 2), ("Chocolate Cake", 1)]), # 398 + 249 = 647
        (3, customers[3], [("Grilled Chicken Steak", 1)]), # 549
        (2, customers[0], [("Spicy Vegetable Curry", 1), ("Spring Rolls", 1)]), # 349 + 249 = 598
        (1, customers[1], [("Salmon Fillet", 1), ("Cheesecake", 1)]), # 899 + 299 = 1198
        (0, customers[2], [("Margherita Pizza", 1), ("Iced Coffee", 1)]), # 399 + 179 = 578
    ]

    for days_ago, cust, items_to_buy in history:
        order_date = datetime.now() - timedelta(days=days_ago)
        
        total_price = 0
        order_items_to_add = []
        for name, qty in items_to_buy:
            menu_item = menu_map[name]
            subtotal = menu_item.price * qty
            total_price += subtotal
            order_items_to_add.append((menu_item.id, qty, menu_item.price))

        order = Order(
            customer_name=cust["name"],
            customer_email=cust["email"],
            customer_phone=cust["phone"],
            status="Picked Up" if days_ago > 0 else "Placed",
            total_price=total_price,
            special_instructions="Seeded historical order",
            created_at=order_date,
            updated_at=order_date
        )
        db.session.add(order)
        db.session.flush()

        for menu_item_id, qty, price in order_items_to_add:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=menu_item_id,
                quantity=qty,
                price=price
            )
            db.session.add(order_item)

    db.session.commit()
