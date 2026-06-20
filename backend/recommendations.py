import os
import json
import sqlite3
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="FoodHub Recommendation API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "instance", "foodstore.db")

def get_db_connection():
    if not os.path.exists(DATABASE_PATH):
        raise HTTPException(status_code=500, detail="Database not initialized yet")
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_popular_items(conn, limit=3):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT menu_item_id, COUNT(*) as sales_count
        FROM order_items
        GROUP BY menu_item_id
        ORDER BY sales_count DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    return [row['menu_item_id'] for row in rows]

# Endpoint 1: Frequently Bought Together (SQL Query)
@app.get("/api/recommendations/frequently-bought/{item_id}")
def get_frequently_bought_together(item_id: int, limit: int = 2):
    """
    Part 1: Frequently Bought Together
    Given an item_id, find other items that are most frequently ordered in the same orders.
    Uses a standard SQL subquery.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify item exists
        cursor.execute("SELECT id FROM menu_items WHERE id = ?", (item_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Item not found")

        # SQL Query to find items bought together in same orders
        query = """
            SELECT menu_item_id, COUNT(*) as frequency
            FROM order_items
            WHERE order_id IN (
                SELECT order_id 
                FROM order_items 
                WHERE menu_item_id = ?
            )
            AND menu_item_id != ?
            GROUP BY menu_item_id
            ORDER BY frequency DESC
            LIMIT ?
        """
        cursor.execute(query, (item_id, item_id, limit))
        rows = cursor.fetchall()
        
        frequent_ids = [row['menu_item_id'] for row in rows]
        
        # Fallback to general popular items if no pairings exist
        if len(frequent_ids) < limit:
            popular_ids = get_popular_items(conn, limit * 2)
            for pid in popular_ids:
                if pid != item_id and pid not in frequent_ids:
                    frequent_ids.append(pid)
                    if len(frequent_ids) >= limit:
                        break
                        
        results = []
        if frequent_ids:
            placeholders = ','.join('?' for _ in frequent_ids)
            cursor.execute(f"SELECT * FROM menu_items WHERE id IN ({placeholders})", frequent_ids)
            item_rows = cursor.fetchall()
            
            # Map database records back to dictionaries
            item_dict = {row['id']: dict(row) for row in item_rows}
            for fid in frequent_ids:
                if fid in item_dict:
                    item_data = item_dict[fid]
                    try:
                        item_data['dietary_tags'] = json.loads(item_data['dietary_tags'])
                    except:
                        item_data['dietary_tags'] = []
                    item_data['recommendation_reason'] = "Frequently ordered with this item!"
                    results.append(item_data)
                    
        conn.close()
        return {
            "success": True,
            "data": results,
            "engine": "SQL Frequently Bought Together"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint 2: Machine Learning Collaborative Filtering (Python)
@app.get("/api/recommendations/personalized")
def get_personalized_recommendations(customer_email: str = Query(..., alias="customer_email"), limit: int = 3):
    """
    Part 2: Machine Learning Collaborative Filtering
    Given a customer_email, calculate personalized recommendations based on Cosine Similarity
    of their order history vector compared to other customers' vectors.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Fetch all orders and items to build the user-item interaction matrix
        cursor.execute("""
            SELECT o.customer_email, oi.menu_item_id, SUM(oi.quantity) as total_qty
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.customer_email, oi.menu_item_id
        """)
        rows = cursor.fetchall()
        
        if not rows:
            conn.close()
            return {"success": True, "data": [], "engine": "ML Collaborative Filtering (No Data)"}
            
        # Build user ratings: {email: {item_id: total_qty}}
        user_ratings = {}
        all_item_ids = set()
        for row in rows:
            email = row['customer_email'].lower().strip()
            item_id = row['menu_item_id']
            qty = row['total_qty']
            
            if email not in user_ratings:
                user_ratings[email] = {}
            user_ratings[email][item_id] = qty
            all_item_ids.add(item_id)
            
        target_email = customer_email.lower().strip()
        
        # Check if user has order history
        if target_email not in user_ratings:
            # Fallback to popular items
            popular_ids = get_popular_items(conn, limit)
            placeholders = ','.join('?' for _ in popular_ids)
            results = []
            if popular_ids:
                cursor.execute(f"SELECT * FROM menu_items WHERE id IN ({placeholders})", popular_ids)
                item_rows = cursor.fetchall()
                for row in item_rows:
                    item_data = dict(row)
                    try:
                        item_data['dietary_tags'] = json.loads(item_data['dietary_tags'])
                    except:
                        item_data['dietary_tags'] = []
                    item_data['recommendation_reason'] = "Popular choice on FoodHub!"
                    results.append(item_data)
            conn.close()
            return {
                "success": True,
                "data": results,
                "engine": "ML Collaborative Filtering (Fallback: Popular Items)"
            }
            
        # 2. Collaborative Filtering: Calculate Cosine Similarity with other users
        target_vector = user_ratings[target_email]
        
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
            if other_email == target_email:
                continue
            sim = cosine_similarity(target_vector, other_vector)
            if sim > 0:
                similarities.append((other_email, sim))
                
        # Sort by similarity descending
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # 3. Predict scores for items the target user has NOT ordered yet
        item_scores = {}
        for other_email, sim in similarities:
            other_vector = user_ratings[other_email]
            for item, qty in other_vector.items():
                if item not in target_vector: # Only recommend new items
                    if item not in item_scores:
                        item_scores[item] = 0
                    item_scores[item] += qty * sim
                    
        # Sort item IDs by score descending
        recommended_item_ids = sorted(item_scores.keys(), key=lambda x: item_scores[x], reverse=True)[:limit]
        
        # Pad with popular items user has not tried if recommendations are sparse
        if len(recommended_item_ids) < limit:
            popular_ids = get_popular_items(conn, limit * 2)
            for pid in popular_ids:
                if pid not in recommended_item_ids and pid not in target_vector:
                    recommended_item_ids.append(pid)
                    if len(recommended_item_ids) >= limit:
                        break
                        
        results = []
        if recommended_item_ids:
            placeholders = ','.join('?' for _ in recommended_item_ids)
            cursor.execute(f"SELECT * FROM menu_items WHERE id IN ({placeholders})", recommended_item_ids)
            item_rows = cursor.fetchall()
            
            item_dict = {row['id']: dict(row) for row in item_rows}
            for item_id in recommended_item_ids:
                if item_id in item_dict:
                    item_data = item_dict[item_id]
                    try:
                        item_data['dietary_tags'] = json.loads(item_data['dietary_tags'])
                    except:
                        item_data['dietary_tags'] = []
                    item_data['recommendation_reason'] = "Based on tastes of customers similar to you!"
                    results.append(item_data)
                    
        conn.close()
        return {
            "success": True,
            "data": results,
            "engine": "ML User-based Collaborative Filtering"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
