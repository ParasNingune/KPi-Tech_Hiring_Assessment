# FoodHub - AI-Powered Food Ordering System

## Project Overview

FoodHub is a full-stack web application for a restaurant with AI-powered natural language menu search. It demonstrates proficiency in React, Flask, and modern web development practices. The application features two user roles: **Admin** (manage menu and orders) and **Customer** (browse menu and place orders).

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
6. [API Documentation](#api-documentation)
7. [Design Decisions](#design-decisions)
8. [Key Features Implementation](#key-features-implementation)

---

## Features

### Customer Role
-  **Browse Menu by Category** - Full-width, clean responsive interface for browsing items by categories
-  **AI-Powered Natural Language Search** - Dynamic query search powered by Google's Gemini LLM (with a local keyword/SequenceMatcher fallback)
-  **FAQ Chatbot Widget** - Floating chatbot powered by Gemini LLM (with a local rule-based fallback) for answering menu, hours, and location questions
-  **Selected For You (ML Recommendations)** - Personalized menu recommendations computed using Collaborative Filtering (Cosine Similarity) based on order history (falls back to popular items)
-  **Place Orders** - Checkout with name, email, phone, and cooking instructions

### Admin Role
-  **Interactive Analytics Dashboard** - Modern SVG charts populated from database aggregations:
  - **7-Day Revenue Trend**: Responsive Line/Area chart displaying revenue trends
  - **Orders Status Breakdown**: Center-aligned SVG Pie chart displaying order states
  - **Category Revenue Share**: Responsive SVG Donut chart mapping revenue categories
  - **Frequently Bought Together Pairs**: Aggregated SQL self-join list of items frequently ordered together
  - **Most Popular Items**: Horizontal bar chart mapping popularity counts
-  **Menu Management** - Full CRUD with styled green badges for dietary tags, and an inline **Switch toggle button** for stock availability (unavailable items automatically sorted to the bottom of lists and hidden from customer views)
-  **Order Management** - Real-time queue tracker following the status pipeline

### Technical Features
-  **Secure Authentication** - Database-backed user management and login/signup portals with password hashing
-  **RESTful API** - Python Flask backend on port `5001` with error handlers and JSON routing
-  **Unified Architecture** - Consolidated analytics and recommendation microservices directly inside Flask
- **Clean UI & Dark Mode** - Responsive Chakra UI styled with global Semantic Tokens for seamless light/dark theme switching

---

## Tech Stack

### Backend
- **Framework:** Flask
- **Database:** SQLite
- **Language:** Python 3.x

### Frontend
- **Library:** React
- **UI Framework:** Chakra UI
- **Build Tool:** Vite
- **State Management:** React Context API
- **Router:** React Router
- **Styling:** Chakra UI

### Development
- **Python Version:** 3.8+
- **Node Version:** 14+
- **Package Managers:** pip, npm

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FoodHub Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐                    ┌──────────────────┐        │
│  │   React         │                    │   Flask API      │        │
│  │   Frontend      │◄──────HTTP────────►│   Backend        │        │
│  │   (localhost    │      (JSON-RPC)    │   (localhost     │        │
│  │    :3000)       │                    │    :5001)        │        │
│  └──────┬──────────┘                    └────────┬─────────┘        │
│         │                                        │                  │
│         │ Context API                            │ SQLAlchemy ORM   │
│         │ - Cart                                 └────────┬───────  │
│         │ - Auth (Admin/Customer)                         │         │
│         │ - Items & Orders                     ┌──────────▼─────┐   │
│         │                                      │    SQLite      │   │
│         └───────────────────────────────────►  │    Database    │   │
│                                                │ foodstore.db.  │   │
│                    Pages:                      └────────────────┘   │
│                    - HomePage                                       │
│                    - CustomerPage                                   │
│                    - AdminPage                                      │
│                    - OrdersManagement                               │
│                    - MenuManagement                                 │
│                    - Dashboard                                      │
│                                                                     │
│  Routes:                                Routes:                     │
│  /api/menu                              /menu (GET, POST, PUT, DEL) │
│  /api/search                            /orders (GET, POST, PUT)    │
│  /api/orders                            /search (GET)               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Customer Browsing**:
   ```
   Customer clicks category → Frontend fetches items → 
   API returns filtered items → UI renders menu
   ```

2. **AI Search**:
   ```
   Customer enters query → Search component calculates relevance score
   → Returns ranked results → UI displays with relevance indicators
   ```

3. **Checkout Flow**:
   ```
   Add to cart → Checkout → Collect customer info → 
   Create order (items + customer) → API validates & saves → 
   Confirmation view
   ```

4. **Admin Order Management**:
   ```
   Admin views orders → Updates status → API updates database → 
   Real-time status change visible
   ```

---

## Project Structure

```
KPi-Tech_Hiring_Assessment/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory & initialization
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── menu.py              # MenuItem model
│   │   │   └── order.py             # Order & OrderItem models
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── menu.py              # Menu CRUD endpoints
│   │       ├── orders.py            # Order CRUD & status endpoints
│   │       └── search.py            # AI search endpoint
│   ├── run.py                       # Flask app entry point
│   └── requirements.txt             # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation with role switcher
│   │   │   ├── MenuItemCard.jsx     # Menu item display & add to cart
│   │   │   ├── Cart.jsx             # Shopping cart & checkout
│   │   │   ├── Dashboard.jsx        # Admin dashboard stats
│   │   │   ├── MenuManagement.jsx   # Admin menu CRUD
│   │   │   └── OrdersManagement.jsx # Admin order management
│   │   ├── pages/
│   │   │   ├── CustomerPage.jsx     # Customer home page
│   │   │   └── AdminPage.jsx        # Admin dashboard page
│   │   ├── utils/
│   │   │   ├── api.js               # Axios API client
│   │   │   ├── CartContext.jsx      # Cart state management
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global styles
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   └── package.json                 # NPM dependencies
│
└── README.md                        # Documentation
```

---

## Setup Instructions

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ and npm installed
- Git installed

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python run.py
```

The Flask API will be available at: **http://localhost:5001**

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The React app will be available at: **http://localhost:3000**

### Database

The SQLite database (`foodstore.db`) is automatically created on first run with sample data:
- 10 menu items across 4 categories
- Dietary tags pre-configured
- Ready for admin modifications

---

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Menu Endpoints

#### Get All Menu Items
```http
GET /menu?category=Main Courses
```
**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "Grilled Chicken Steak",
      "description": "Juicy grilled chicken breast with herb butter",
      "category": "Main Courses",
      "price": 15.99,
      "dietary_tags": ["gluten-free", "high-protein"],
      "available": true
    }
  ]
}
```

#### Get Categories
```http
GET /menu/categories
```

#### Create Menu Item (Admin)
```http
POST /menu
Content-Type: application/json

{
  "name": "Caesar Salad",
  "description": "Fresh romaine lettuce with Caesar dressing",
  "category": "Appetizers",
  "price": 8.99,
  "dietary_tags": ["vegetarian", "gluten-free"],
  "available": true
}
```

#### Update Menu Item (Admin)
```http
PUT /menu/{item_id}
```

#### Delete Menu Item (Admin)
```http
DELETE /menu/{item_id}
```

### Order Endpoints

#### Create Order (Customer)
```http
POST /orders
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "(123) 456-7890",
  "special_instructions": "No onions please",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2
    }
  ]
}
```
**Response:** `201 Created`

#### Get All Orders (Admin)
```http
GET /orders?status=Preparing
```

#### Update Order Status (Admin)
```http
PUT /orders/{order_id}/status
Content-Type: application/json

{
  "status": "Ready"
}
```

#### Get Admin Stats
```http
GET /orders/admin/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total_orders": 42,
    "orders_by_status": {
      "Placed": 5,
      "Confirmed": 3,
      "Preparing": 2,
      "Ready": 1,
      "Picked Up": 31
    },
    "today_revenue": 245.50,
    "today_orders": 8,
    "popular_items": [
      {
        "name": "Margherita Pizza",
        "count": 12
      }
    ]
  }
}
```

### Search Endpoints

#### AI Natural Language Search
```http
GET /search?q=something spicy and vegetarian
```
**Response:** `200 OK`
```json
{
  "success": true,
  "query": "something spicy and vegetarian",
  "data": [
    {
      "id": 5,
      "name": "Spicy Vegetable Curry",
      "description": "Aromatic curry with mixed vegetables and coconut milk",
      "category": "Main Courses",
      "price": 11.99,
      "dietary_tags": ["vegetarian", "vegan", "spicy"],
      "relevance_score": 85.5
    }
  ]
}
```

---

## Design Decisions

### 1. **AI Search & Chatbot Integration**
**Decision:** Dual-mode execution combining Google's Gemini LLM (`gemini-flash-latest`) with local NLP string-matching fallbacks.

**Rationale:**
- **Semantic Reasoning**: The Gemini model provides natural, semantic search matching (e.g., matching "spicy chicken" with a relevant main course) and explains its choices dynamically to the user.
- **High Availability**: If the API key is missing or the external API call fails, the search and chatbot engines fall back to a local token scoring algorithm (TF-IDF & SequenceMatcher) and rule-based matches, ensuring zero page crashes.

### 2. **Database Design & Authentication**
**Decision:** SQLite with SQLAlchemy, securing roles with a dedicated `users` table and salted password hashing.

**Rationale:**
- **Zero Configuration**: SQLite operates locally, requiring no database installation or service setup.
- **Hashed Passwords**: Password validation uses Werkzeug's `generate_password_hash` and `check_password_hash` to secure accounts, deprecating plain text comparisons.
- **Schemas**:
  - `User`: Handles accounts (`admin` or `customer`) and securely hashes passwords.
  - `MenuItem`: Represents inventory, price in Rupees (₹), dietary tags, and availability.
  - `Order` & `OrderItem`: Tracks order metrics and details.

### 3. **Recommendation Engines (ML & SQL)**
**Decision:** Cosine Similarity Collaborative Filtering for personalization and SQL self-joins for cross-sell recommendations.

**Rationale:**
- **User-Based Filtering**: Personalized recommendations calculate correlation matrices between user purchasing profiles, predicting item interest based on order habits of similar users.
- **Order Correlation**: Cart cross-sells run high-speed SQL self-joins on the database server to find items frequently checked out together.

### 4. **SVG Dashboard Charts**
**Decision:** Render responsive vector SVGs inside React, backed by database query calculations.

**Rationale:**
- **Direct Aggregation**: All statistics (such as revenue timelines, slice percentages, and category shares) are computed inside SQLite via SQL queries, keeping front-end operations fast.
- **Adaptive SVGs**: Light/dark compatible vector diagrams render perfectly without additional heavy JS charting libraries.

### 3. **Frontend State Management**
**Decision:** React Context API instead of Redux

**Rationale:**
- Simpler for small-to-medium app
- No additional dependencies
- Clear data flow: CartContext, AuthContext
- Suitable for demo environment
- Easy to explain during presentation

### 4. **UI/UX Approach**
**Decision:** Minimalist Chakra UI design with clean, functional interface

**Rationale:**
- Chakra UI provides accessible, professional components out-of-box
- Colors used: Orange (primary actions), Blue (admin), Green (success)
- Consistency across all pages
- Responsive: Works well on desktop/tablet/mobile
- Dark mode support for accessibility

### 5. **Role Separation**
**Decision:** Separate views (CustomerPage vs AdminPage) with role context

**Rationale:**
- Clear isolation of concerns
- Different features for different user types
- Easy to understand during demo
- Can be expanded with proper backend auth
- Navbar role switcher for demo purposes

---

## Key Features Implementation

### AI-Powered Menu Search

The search algorithm balances accuracy with simplicity:

1. **Query Processing:**
   - Clean and normalize query text
   - Split into individual words
   - Search across menu item names and descriptions

2. **Relevance Scoring:**
   - **Exact phrase match in name:** 100 points
   - **Exact phrase match in description:** 50 points
   - **Word match in name:** 30 points per word
   - **Word match in description:** 15 points per word
   - **Partial word match:** 10/5 points (name/description)
   - **Dietary tag match:** 25 points per tag
   - **String similarity:** Bonus using SequenceMatcher

3. **Results:**
   - Filter items with score > 0
   - Sort by score (highest first)
   - Return with relevance indicator

**Example Queries:**
- "spicy vegetarian" → Finds Spicy Vegetable Curry
- "light lunch" + "not fried" → Filters to lighter options
- "high protein" → Finds Chicken Steak, Salmon
- "sweet" → Finds Desserts

### Order Workflow

```
┌──────────────────────────────────────────────────┐
│                ORDER LIFECYCLE                   │
├──────────────────────────────────────────────────┤
│ 1. PLACED (Customer submits order)               │
│    • Order created with items and customer info  │
│    • Cart cleared                                │
│                                                  │
│ 2. CONFIRMED (Admin confirms receipt)            │
│    • Payment verified, order acknowledged        │
│                                                  │
│ 3. PREPARING (Kitchen starts preparation)        │
│    • Items are being prepared                    │
│                                                  │
│ 4. READY (Order completed)                       │
│    • Customer notified (in real app)             │
│    • Waiting for pickup                          │
│                                                  │
│ 5. PICKED UP (Customer picks up order)           │
│    • Order complete                              │
│    • Can be archived                             │
└──────────────────────────────────────────────────┘
```

### Admin Dashboard Stats

Real-time statistics showing:
- **Total Orders:** All time
- **Today's Orders:** Orders placed today
- **Today's Revenue:** Sum of today's orders
- **Orders by Status:** Breakdown of each status
- **Popular Items:** Top 5 most ordered items

---

## Testing the Application

### Test Customer Workflow
1. Start with "Customer" role in navbar
2. Browse menu by clicking categories
3. Try AI search:
   - Try: "spicy vegetarian"
   - Try: "light dessert" 
   - Try: "high protein"
4. Add items to cart
5. Adjust quantities
6. Checkout with sample info
7. See confirmation

### Test Admin Workflow
1. Switch to "Admin" role
2. View Dashboard stats
3. Create new menu item in "Manage Menu"
4. View all orders in "Manage Orders"
5. Update order status
6. Watch dashboard update