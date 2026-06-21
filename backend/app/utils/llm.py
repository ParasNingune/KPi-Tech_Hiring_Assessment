import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure GenAI
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def is_llm_available():
    return bool(api_key)

def llm_search(query, menu_items):
    """
    Use Gemini to rank and explain menu item relevance
    """
    if not is_llm_available():
        return None
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Format menu items for prompt
        items_data = []
        for item in menu_items:
            items_data.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'tags': item.get_tags()
            })
            
        prompt = f"""
        You are an AI restaurant assistant.
        Given the following menu items:
        {json.dumps(items_data, indent=2)}
        
        The customer is searching for: "{query}"
        
        Task:
        1. Find and rank the items that match the customer's craving. Only return items that have a positive match.
        2. Assign a relevance score between 1 and 100 for each match.
        3. Write a brief, friendly, 1-sentence explanation of why it matches (e.g. "Spicy Vegetable Curry is a perfect fit for a vegetarian craving some heat").
        
        Return ONLY a JSON array of objects, with no markdown code blocks or other text.
        Format:
        [
          {{"id": 1, "score": 90, "reason": "..."}},
          ...
        ]
        """
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        print("LLM generated content")
        text = response.text.strip()
        # Clean potential markdown wrapping
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"LLM Search Error: {e}")
        return None

def llm_recommend(cart_items, menu_items):
    """
    Use Gemini to suggest up to 2 items based on cart
    """
    if not is_llm_available() or not cart_items:
        return []
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Format cart
        cart_data = [{
            'id': item.id,
            'name': item.name,
            'category': item.category
        } for item in cart_items]
        
        # Format menu items excluding items already in cart
        cart_ids = {item.id for item in cart_items}
        available_items = [item for item in menu_items if item.id not in cart_ids]
        
        items_data = [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'tags': item.get_tags()
        } for item in available_items]
        
        if not items_data:
            return []
            
        prompt = f"""
        You are an AI restaurant assistant.
        The customer currently has these items in their cart:
        {json.dumps(cart_data, indent=2)}
        
        Here is the rest of our menu:
        {json.dumps(items_data, indent=2)}
        
        Task:
        1. Suggest up to 2 items from the menu that would pair well with their cart.
        2. Write a brief, friendly, 1-sentence recommendation reason (e.g., "Garlic Bread pairs perfectly with Margherita Pizza").
        
        Return ONLY a JSON array of objects, with no markdown code blocks or other text.
        Format:
        [
          {{"id": 1, "reason": "..."}},
          ...
        ]
        """
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        text = response.text.strip()
        # Clean potential markdown wrapping
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"LLM Recommend Error: {e}")
        return []

def llm_chatbot(user_message, menu_items):
    """
    Use Gemini to answer customer FAQs using menu items and restaurant info as context
    """
    if not is_llm_available():
        return None
        
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Format menu items for prompt
        items_data = []
        for item in menu_items:
            items_data.append({
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'price': f"₹{item.price:.2f}",
                'tags': item.get_tags()
            })
            
        system_context = f"""
        You are a friendly and helpful AI chatbot for "FoodHub", a premium restaurant.
        
        Here is our current menu:
        {json.dumps(items_data, indent=2)}
        
        Restaurant Information:
        - Hours: Open daily from 11:00 AM to 10:00 PM.
        - Location: 123 Food Street, Gourmet City.
        - Pickup Time: Usually ready in 15 to 30 minutes.
        - Order type: Currently we only support online pickup orders. No direct delivery, but they can place orders on this portal.
        
        Guidelines:
        - Be concise, friendly, and helpful. Keep responses to 1-3 sentences.
        - If they ask about menu recommendations, suggest items from our menu.
        - If they ask about prices, always state them in Rupees (₹).
        - If they ask about something not related to the restaurant or menu, politely steer them back to FoodHub.
        """
        
        prompt = f"{system_context}\n\nUser: {user_message}\nAssistant:"
        
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"LLM Chatbot Error: {e}")
        return None

def rule_based_faq(user_message, menu_items):
    """
    Local FAQ rule-based fallback when Gemini API key is missing
    """
    message_lower = user_message.lower()
    
    # Common questions
    if any(k in message_lower for k in ['hour', 'time', 'open', 'close']):
        return "We are open daily from 11:00 AM to 10:00 PM. We look forward to serving you!"
    if any(k in message_lower for k in ['location', 'where', 'address', 'located']):
        return "You can find us at 123 Food Street, Gourmet City. Stop by for your pickup!"
    if any(k in message_lower for k in ['pickup', 'ready', 'how long', 'prepare']):
        return "Most orders are freshly prepared and ready for pickup within 15 to 30 minutes."
    if any(k in message_lower for k in ['delivery', 'deliver', 'ship']):
        return "We currently specialize in online pickup orders only, so there is no delivery option at this time."
    if any(k in message_lower for k in ['menu', 'food', 'eat', 'dish', 'item', 'recommend', 'suggest']):
        recommendations = [item.name for item in menu_items[:2]]
        return f"We have delicious items like {', '.join(recommendations)}. What category are you in the mood for?"
    if any(k in message_lower for k in ['vegetarian', 'veg', 'vegan']):
        veg_items = [item.name for item in menu_items if any(t in item.get_tags() for t in ['vegetarian', 'vegan'])][:2]
        return f"Yes! We offer great vegetarian options like {', '.join(veg_items)}."
    if any(k in message_lower for k in ['spicy', 'hot', 'chili']):
        spicy_items = [item.name for item in menu_items if 'spicy' in item.get_tags()][:2]
        return f"If you like heat, try our {', '.join(spicy_items)}!"
    
    return "I'm here to help with any questions about FoodHub's menu, hours, location, or pickup orders. Ask away!"
