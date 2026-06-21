from flask import Blueprint, request, jsonify
from app.models.menu import MenuItem
import re
from difflib import SequenceMatcher

search_bp = Blueprint('search', __name__)

def clean_text(text):
    """Clean and normalize text for comparison"""
    return text.lower().strip()

def calculate_relevance_score(query, item):
    """
    Calculate relevance score for menu item based on query.
    Uses multi-factor scoring:
    1. Direct keyword matching in name and description
    2. Dietary tag matching
    3. Category matching
    4. String similarity using SequenceMatcher
    """
    query_lower = clean_text(query)
    query_words = query_lower.split()
    
    score = 0
    
    # Exact phrase match in name (highest priority)
    if query_lower in clean_text(item.name):
        score += 100
    
    # Exact phrase match in description
    if query_lower in clean_text(item.description):
        score += 50
    
    # Individual word matching
    item_name_lower = clean_text(item.name)
    item_desc_lower = clean_text(item.description)
    
    for word in query_words:
        # Name word match
        if word in item_name_lower.split():
            score += 30
        # Description word match
        if word in item_desc_lower.split():
            score += 15
        # Partial word match in name
        if word in item_name_lower:
            score += 10
        # Partial word match in description
        if word in item_desc_lower:
            score += 5
    
    # Dietary tag matching
    item_tags = item.get_tags()
    for tag in item_tags:
        if query_lower.find(tag.lower()) != -1:
            score += 25
    
    # String similarity bonus (for similar but not exact matches)
    name_similarity = SequenceMatcher(None, query_lower, item_name_lower).ratio()
    desc_similarity = SequenceMatcher(None, query_lower, item_desc_lower).ratio()
    score += (name_similarity * 20) + (desc_similarity * 10)
    
    return score

# AI-powered natural language menu search
@search_bp.route('/', methods=['GET'])
def search_menu():
    """
    AI-powered natural language menu search.
    Returns available menu items ranked by relevance.
    """
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 2:
        return jsonify({
            'success': False,
            'error': 'Search query must be at least 2 characters'
        }), 400
    
    try:
        # Get all available items
        all_items = MenuItem.query.filter_by(available=True).all()
        
        # Try LLM search first if available
        from app.utils.llm import llm_search, is_llm_available
        llm_results = None
        if is_llm_available():
            llm_results = llm_search(query, all_items)
            
        if llm_results:
            items_by_id = {item.id: item for item in all_items}
            results = []
            for res in llm_results:
                item_id = res.get('id')
                if item_id in items_by_id:
                    item = items_by_id[item_id]
                    results.append({
                        **item.to_dict(),
                        'relevance_score': res.get('score', 100),
                        'match_reason': res.get('reason', '')
                    })
            return jsonify({
                'success': True,
                'query': query,
                'data': results,
                'total': len(results),
                'llm_powered': True
            }), 200
            
        # Fallback to local heuristic scoring
        scored_items = []
        for item in all_items:
            score = calculate_relevance_score(query, item)
            if score > 0:  # Only include items with non-zero relevance
                scored_items.append({
                    'item': item,
                    'score': score
                })
        
        # Sort by score (highest first)
        scored_items.sort(key=lambda x: x['score'], reverse=True)
        
        # Extract items and scores
        results = [
            {
                **item['item'].to_dict(),
                'relevance_score': round(item['score'], 2),
                'match_reason': ''
            }
            for item in scored_items
        ]
        
        return jsonify({
            'success': True,
            'query': query,
            'data': results,
            'total': len(results),
            'llm_powered': False
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Suggest search terms based on menu
@search_bp.route('/suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions based on available items"""
    try:
        items = MenuItem.query.filter_by(available=True).all()
        
        suggestions = set()
        
        # Add category names
        for item in items:
            suggestions.add(item.category)
        
        # Add dietary tags
        for item in items:
            tags = item.get_tags()
            suggestions.update(tags)
        
        # Add some item names
        for item in items[:15]:
            suggestions.add(item.name)
        
        return jsonify({
            'success': True,
            'data': list(suggestions)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Suggest recommendations based on cart items
@search_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get AI recommendations based on cart items"""
    cart_ids_str = request.args.get('cart_ids', '').strip()
    
    try:
        # Get all available menu items
        all_items = MenuItem.query.filter_by(available=True).all()
        
        cart_ids = []
        if cart_ids_str:
            cart_ids = [int(x) for x in cart_ids_str.split(',') if x.isdigit()]
            
        # Filter cart items
        cart_items = [item for item in all_items if item.id in cart_ids]
        
        # 1. Try LLM recommendations first if available
        from app.utils.llm import llm_recommend, is_llm_available
        llm_results = []
        if is_llm_available() and cart_items:
            llm_results = llm_recommend(cart_items, all_items)
            
        if llm_results:
            items_by_id = {item.id: item for item in all_items}
            results = []
            for res in llm_results:
                item_id = res.get('id')
                if item_id in items_by_id and item_id not in cart_ids:
                    item = items_by_id[item_id]
                    results.append({
                        **item.to_dict(),
                        'recommendation_reason': res.get('reason', '')
                    })
            
            # Pad to 3 items if needed
            if len(results) < 3:
                for item in all_items:
                    if item.id not in cart_ids and not any(r['id'] == item.id for r in results):
                        results.append({
                            **item.to_dict(),
                            'recommendation_reason': "Popular choice on FoodHub!"
                        })
                        if len(results) >= 3:
                            break
            
            return jsonify({
                'success': True,
                'data': results[:3],
                'llm_powered': True
            }), 200
            
        # 2. Heuristic fallback (suggest up to 3 items from other categories)
        cart_categories = {item.category for item in cart_items}
        suggestions = []
        
        for item in all_items:
            if item.id not in cart_ids and item.category not in cart_categories:
                suggestions.append({
                    **item.to_dict(),
                    'recommendation_reason': f"Pairs nicely as a delicious {item.category.lower()} choice."
                })
                if len(suggestions) >= 3:
                    break
                    
        # Pad with other available items from the same category or general available items if we still need 3
        if len(suggestions) < 3:
            for item in all_items:
                if item.id not in cart_ids and not any(s['id'] == item.id for s in suggestions):
                    suggestions.append({
                        **item.to_dict(),
                        'recommendation_reason': "Popular house choice!"
                    })
                    if len(suggestions) >= 3:
                        break
                    
        return jsonify({
            'success': True,
            'data': suggestions[:3],
            'llm_powered': False
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Chatbot endpoint
@search_bp.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Chatbot responder for user FAQs"""
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({
            'success': False,
            'error': 'Message is required'
        }), 400
        
    try:
        from app.models.menu import MenuItem
        all_items = MenuItem.query.filter_by(available=True).all()
        
        # Try LLM chatbot first
        from app.utils.llm import llm_chatbot, is_llm_available
        reply = None
        if is_llm_available():
            reply = llm_chatbot(message, all_items)
            
        if reply:
            return jsonify({
                'success': True,
                'reply': reply,
                'llm_powered': True
            }), 200
            
        # Fallback to local rule-based matching
        from app.utils.llm import rule_based_faq
        reply = rule_based_faq(message, all_items)
        
        return jsonify({
            'success': True,
            'reply': reply,
            'llm_powered': False
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

