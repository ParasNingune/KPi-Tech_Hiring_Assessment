from flask import Blueprint, request, jsonify
from app import db
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem
from sqlalchemy import func

recommendations_bp = Blueprint('recommendations', __name__)

def get_popular_items(limit=10):
    popular = db.session.query(
        OrderItem.menu_item_id,
        func.count(OrderItem.id).label('sales_count')
    ).join(
        MenuItem, OrderItem.menu_item_id == MenuItem.id
    ).filter(
        MenuItem.available == True
    ).group_by(
        OrderItem.menu_item_id
    ).order_by(
        func.count(OrderItem.id).desc()
    ).limit(limit).all()
    return [p[0] for p in popular]

@recommendations_bp.route('/frequently-bought/<int:item_id>', methods=['GET'])
def get_frequently_bought_together(item_id):
    limit = request.args.get('limit', default=3, type=int)
    cart_ids_str = request.args.get('cart_ids', '').strip()
    
    # Verify item exists
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
        
    exclude_ids = {item_id}
    if cart_ids_str:
        try:
            exclude_ids.update(int(x) for x in cart_ids_str.split(',') if x.strip().isdigit())
        except ValueError:
            pass

    # Get all order IDs containing this item_id
    subquery = db.session.query(OrderItem.order_id).filter(OrderItem.menu_item_id == item_id).subquery()
    
    # Get frequently bought together items
    frequent = db.session.query(
        OrderItem.menu_item_id,
        func.count(OrderItem.id).label('frequency')
    ).join(
        MenuItem, OrderItem.menu_item_id == MenuItem.id
    ).filter(
        OrderItem.order_id.in_(subquery)
    ).filter(
        MenuItem.available == True
    ).filter(
        ~OrderItem.menu_item_id.in_(exclude_ids)
    ).group_by(
        OrderItem.menu_item_id
    ).order_by(
        func.count(OrderItem.id).desc()
    ).limit(limit).all()
    
    frequent_ids = [row[0] for row in frequent]
    
    # Fallback to popular items
    if len(frequent_ids) < limit:
        popular_ids = get_popular_items(limit * 3)
        for pid in popular_ids:
            if pid not in exclude_ids and pid not in frequent_ids:
                frequent_ids.append(pid)
                if len(frequent_ids) >= limit:
                    break
                    
    # If still not enough, fallback to any available menu items
    if len(frequent_ids) < limit:
        remaining_limit = limit - len(frequent_ids)
        any_items = MenuItem.query.filter_by(available=True).filter(~MenuItem.id.in_(exclude_ids | set(frequent_ids))).limit(remaining_limit).all()
        for i in any_items:
            frequent_ids.append(i.id)
            if len(frequent_ids) >= limit:
                break
                
    results = []
    if frequent_ids:
        # Load the menu items
        menu_items = MenuItem.query.filter(MenuItem.id.in_(frequent_ids)).filter(MenuItem.available == True).all()
        # Preserve the order in frequent_ids
        item_map = {mi.id: mi.to_dict() for mi in menu_items}
        for fid in frequent_ids:
            if fid in item_map:
                item_data = item_map[fid]
                item_data['recommendation_reason'] = "Frequently ordered with this item!"
                results.append(item_data)
                
    return jsonify({
        'success': True,
        'data': results,
        'engine': 'SQL Frequently Bought Together (Flask)'
    }), 200

@recommendations_bp.route('/personalized', methods=['GET'])
def get_personalized():
    customer_email = request.args.get('customer_email')
    limit = request.args.get('limit', default=3, type=int)
    
    if not customer_email:
        return jsonify({'success': False, 'error': 'Missing customer_email'}), 400
        
    customer_email = customer_email.lower().strip()
    
    # Fetch all orders and items to build the user-item interaction matrix
    interactions = db.session.query(
        Order.customer_email,
        OrderItem.menu_item_id,
        func.sum(OrderItem.quantity).label('total_qty')
    ).join(
        OrderItem, Order.id == OrderItem.order_id
    ).group_by(
        Order.customer_email, OrderItem.menu_item_id
    ).all()
    
    if not interactions:
        return jsonify({
            'success': True,
            'data': [],
            'engine': 'ML Collaborative Filtering (No Data)'
        }), 200
        
    # Build user ratings: {email: {item_id: total_qty}}
    user_ratings = {}
    all_item_ids = set()
    for email, item_id, total_qty in interactions:
        email_key = email.lower().strip()
        qty = int(total_qty)
        
        if email_key not in user_ratings:
            user_ratings[email_key] = {}
        user_ratings[email_key][item_id] = qty
        all_item_ids.add(item_id)
        
    # Check if target user has order history
    if customer_email not in user_ratings:
        # Fallback to popular items
        popular_ids = get_popular_items(limit)
        results = []
        if popular_ids:
            menu_items = MenuItem.query.filter(MenuItem.id.in_(popular_ids)).filter(MenuItem.available == True).all()
            item_map = {mi.id: mi.to_dict() for mi in menu_items}
            for pid in popular_ids:
                if pid in item_map:
                    item_data = item_map[pid]
                    item_data['recommendation_reason'] = "Popular choice on FoodHub!"
                    results.append(item_data)
        return jsonify({
            'success': True,
            'data': results,
            'engine': 'ML Collaborative Filtering (Fallback: Popular Items)'
        }), 200
        
    # Collaborative Filtering: Calculate Cosine Similarity with other users
    target_vector = user_ratings[customer_email]
    
    def cosine_similarity(v1, v2):
        dot_product = 0
        mag1 = 0
        mag2 = 0
        for item in all_item_ids:
            r1 = v1.get(item, 0)
            r2 = v2.get(item, 0)
            dot_product += r1 * r2
            mag1 += r1 * r1
            mag2 += r2 * r2
        if mag1 == 0 or mag2 == 0:
            return 0
        return dot_product / ((mag1 ** 0.5) * (mag2 ** 0.5))
        
    similarities = []
    for other_email, other_vector in user_ratings.items():
        if other_email == customer_email:
            continue
        sim = cosine_similarity(target_vector, other_vector)
        if sim > 0:
            similarities.append((other_email, sim))
            
    # Sort by similarity descending
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    # Predict scores for items the target user has NOT ordered yet
    item_scores = {}
    for other_email, sim in similarities:
        other_vector = user_ratings[other_email]
        for item, qty in other_vector.items():
            if item not in target_vector:  # Only recommend new items
                if item not in item_scores:
                    item_scores[item] = 0
                item_scores[item] += qty * sim
                
    # Sort item IDs by score descending
    recommended_item_ids = sorted(item_scores.keys(), key=lambda x: item_scores[x], reverse=True)[:limit]
    
    # Pad with popular items user has not tried if recommendations are sparse
    if len(recommended_item_ids) < limit:
        popular_ids = get_popular_items(limit * 2)
        for pid in popular_ids:
            if pid not in recommended_item_ids and pid not in target_vector:
                recommended_item_ids.append(pid)
                if len(recommended_item_ids) >= limit:
                    break
                    
    results = []
    if recommended_item_ids:
        menu_items = MenuItem.query.filter(MenuItem.id.in_(recommended_item_ids)).filter(MenuItem.available == True).all()
        item_map = {mi.id: mi.to_dict() for mi in menu_items}
        for item_id in recommended_item_ids:
            if item_id in item_map:
                item_data = item_map[item_id]
                item_data['recommendation_reason'] = "Based on tastes of customers similar to you!"
                results.append(item_data)
                
    return jsonify({
        'success': True,
        'data': results,
        'engine': 'ML User-based Collaborative Filtering (Flask)'
    }), 200
