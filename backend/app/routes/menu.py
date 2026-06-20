from flask import Blueprint, request, jsonify
from app import db
from app.models.menu import MenuItem

menu_bp = Blueprint('menu', __name__)

# Get all menu items (Customer view - browse by category)
@menu_bp.route('/', methods=['GET'])
def get_all_items():
    """Get all available menu items, optionally filtered by category"""
    category = request.args.get('category')
    
    query = MenuItem.query.filter_by(available=True)
    
    if category:
        query = query.filter_by(category=category)
    
    items = query.all()
    return jsonify({
        'success': True,
        'data': [item.to_dict() for item in items],
        'total': len(items)
    }), 200

# Get menu categories
@menu_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    categories = db.session.query(MenuItem.category).distinct().filter_by(available=True).all()
    category_list = [cat[0] for cat in categories]
    return jsonify({
        'success': True,
        'data': category_list
    }), 200

# Get single item (Customer view)
@menu_bp.route('/<int:item_id>', methods=['GET'])
def get_item(item_id):
    """Get single menu item details"""
    item = MenuItem.query.get(item_id)
    
    if not item:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    
    return jsonify({
        'success': True,
        'data': item.to_dict()
    }), 200

# Admin: Create menu item
@menu_bp.route('/', methods=['POST'])
def create_item():
    """Admin: Create new menu item"""
    data = request.get_json()
    
    # Validation
    required_fields = ['name', 'description', 'category', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    try:
        item = MenuItem(
            name=data['name'],
            description=data['description'],
            category=data['category'],
            price=float(data['price']),
            available=data.get('available', True)
        )
        
        if 'dietary_tags' in data:
            item.set_tags(data['dietary_tags'])
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item created successfully',
            'data': item.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin: Update menu item
@menu_bp.route('/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """Admin: Update menu item"""
    item = MenuItem.query.get(item_id)
    
    if not item:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    
    data = request.get_json()
    
    try:
        item.name = data.get('name', item.name)
        item.description = data.get('description', item.description)
        item.category = data.get('category', item.category)
        item.price = float(data.get('price', item.price))
        item.available = data.get('available', item.available)
        
        if 'dietary_tags' in data:
            item.set_tags(data['dietary_tags'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item updated successfully',
            'data': item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin: Delete menu item
@menu_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Admin: Delete menu item"""
    item = MenuItem.query.get(item_id)
    
    if not item:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    
    try:
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item deleted successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
