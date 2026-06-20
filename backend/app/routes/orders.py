from flask import Blueprint, request, jsonify
from app import db
from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from datetime import datetime

orders_bp = Blueprint('orders', __name__)

# Customer: Create order
@orders_bp.route('/', methods=['POST'])
def create_order():
    """Customer: Create new order"""
    data = request.get_json()
    
    # Validation
    required_fields = ['customer_name', 'customer_email', 'customer_phone', 'items']
    if not all(field in data for field in required_fields):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    if not data['items']:
        return jsonify({'success': False, 'error': 'Order must contain at least one item'}), 400
    
    try:
        total_price = 0
        order_items = []
        
        # Validate and calculate total
        for item_data in data['items']:
            menu_item = MenuItem.query.get(item_data['menu_item_id'])
            
            if not menu_item:
                return jsonify({'success': False, 'error': f'Item {item_data["menu_item_id"]} not found'}), 404
            
            if not menu_item.available:
                return jsonify({'success': False, 'error': f'Item {menu_item.name} is not available'}), 400
            
            quantity = item_data.get('quantity', 1)
            subtotal = menu_item.price * quantity
            total_price += subtotal
            
            order_items.append({
                'menu_item': menu_item,
                'quantity': quantity,
                'price': menu_item.price
            })
        
        # Create order
        order = Order(
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data['customer_phone'],
            total_price=total_price,
            special_instructions=data.get('special_instructions', ''),
            status='Placed'
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Add order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item_data['menu_item'].id,
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order placed successfully',
            'data': order.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Get all orders (Admin: dashboard view)
@orders_bp.route('/', methods=['GET'])
def get_all_orders():
    """Get orders with optional status and customer email filters"""
    status = request.args.get('status')
    customer_email = request.args.get('email')
    
    query = Order.query
    
    if status and status in Order.ORDER_STATUSES:
        query = query.filter_by(status=status)

    if customer_email:
        query = query.filter(db.func.lower(Order.customer_email) == customer_email.strip().lower())
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [order.to_dict() for order in orders],
        'total': len(orders)
    }), 200

# Get single order (Admin & Customer)
@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get single order details"""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'success': False, 'error': 'Order not found'}), 404
    
    return jsonify({
        'success': True,
        'data': order.to_dict()
    }), 200

# Admin: Update order status
@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Admin: Update order status"""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'success': False, 'error': 'Order not found'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'success': False, 'error': 'Status is required'}), 400
    
    if new_status not in Order.ORDER_STATUSES:
        return jsonify({'success': False, 'error': f'Invalid status. Allowed: {", ".join(Order.ORDER_STATUSES)}'}), 400
    
    try:
        order.status = new_status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Order status updated to {new_status}',
            'data': order.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Admin: Get dashboard stats
@orders_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """Admin: Get dashboard statistics"""
    try:
        # Get today's date
        from datetime import date
        today = date.today()
        
        # Orders by status
        status_breakdown = {}
        for status in Order.ORDER_STATUSES:
            count = Order.query.filter_by(status=status).count()
            status_breakdown[status] = count
        
        # Today's revenue
        today_orders = Order.query.filter(
            db.func.date(Order.created_at) == today
        ).all()
        today_revenue = sum(order.total_price for order in today_orders)
        
        # Popular items
        from sqlalchemy import func
        popular_items = db.session.query(
            MenuItem.name,
            func.count(OrderItem.id).label('count')
        ).join(OrderItem, MenuItem.id == OrderItem.menu_item_id).group_by(MenuItem.id).order_by(func.count(OrderItem.id).desc()).limit(5).all()
        
        popular_items_list = [{'name': item[0], 'count': item[1]} for item in popular_items]
        
        return jsonify({
            'success': True,
            'data': {
                'total_orders': Order.query.count(),
                'orders_by_status': status_breakdown,
                'today_revenue': today_revenue,
                'today_orders': len(today_orders),
                'popular_items': popular_items_list
            }
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
