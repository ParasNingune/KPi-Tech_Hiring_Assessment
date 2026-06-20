# FoodHub - AI-Powered Food Ordering System

## Project Overview

FoodHub is a full-stack web application for a restaurant with AI-powered natural language menu search. It demonstrates proficiency in React, Flask, and modern web development practices. The application features two user roles: **Admin** (manage menu and orders) and **Customer** (browse menu and place orders).

**Demo Duration:** 30 minutes on Microsoft Teams  
**Submission Deadline:** 3 days from brief receipt  
**Evaluation Focus:** System architecture, design decisions, and engineering mindset

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
6. [API Documentation](#api-documentation)
7. [Design Decisions](#design-decisions)
8. [Key Features Implementation](#key-features-implementation)
9. [Future Improvements](#future-improvements)

---

## ✨ Features

### Customer Role
- ✅ **Browse Menu by Category** - Clean, minimalist interface for browsing items by category (Appetizers, Main Courses, Desserts, Beverages)
- ✅ **View Item Details** - See full description, price, and dietary information
- ✅ **AI-Powered Natural Language Search** - Type queries like:
  - "something spicy and vegetarian"
  - "a light lunch that is not fried"
  - "high protein meat dish"
  - "sweet dessert"
- ✅ **Shopping Cart** - Add items, adjust quantities, see total price
- ✅ **Place Orders** - Checkout with customer information and special instructions
- ✅ **Order Confirmation** - See order details with order ID

### Admin Role
- ✅ **Dashboard** - View real-time statistics:
  - Total orders and today's orders
  - Today's revenue
  - Orders breakdown by status
  - Most popular items
- ✅ **Menu Management** - Add, edit, delete menu items with:
  - Name, description, category, price
  - Dietary tags (vegetarian, vegan, gluten-free, spicy, high-protein)
  - Availability toggle
- ✅ **Order Management** - View all orders with status:
  - Track order workflow: Placed → Confirmed → Preparing → Ready → Picked Up
  - Update order status in real-time
  - View order details, items, and special instructions
  - Filter orders by status

### Technical Features
- ✅ **RESTful API** - Python Flask backend with proper HTTP status codes
- ✅ **Database** - SQLite with SQLAlchemy ORM
- ✅ **Clean UI** - Chakra UI components with responsive design
- ✅ **Context API** - Global state management (Cart, Auth)
- ✅ **Error Handling** - Proper validation and error messages
- ✅ **Dark Mode** - Light/dark theme toggle

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask 2.3.2
- **ORM:** SQLAlchemy 2.0
- **Database:** SQLite
- **Middleware:** Flask-CORS
- **Language:** Python 3.x

### Frontend
- **Library:** React 18.2
- **UI Framework:** Chakra UI 2.8
- **Build Tool:** Vite 4.5
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Router:** React Router 6.15
- **Styling:** Chakra UI + Emotion

### Development
- **Python Version:** 3.8+
- **Node Version:** 14+
- **Package Managers:** pip, npm

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FoodHub Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐                    ┌──────────────────┐        │
│  │   React         │                    │   Flask API      │        │
│  │   Frontend      │◄──────HTTP────────►│   Backend        │        │
│  │   (localhost    │      (JSON-RPC)    │   (localhost     │        │
│  │    :3000)       │                    │    :5000)        │        │
│  └──────┬──────────┘                    └────────┬─────────┘        │
│         │                                        │                  │
│         │ Context API                           │ SQLAlchemy ORM   │
│         │ - Cart                                └────────┬────────  │
│         │ - Auth (Admin/Customer)                       │           │
│         │ - Items & Orders                     ┌────────▼───────┐  │
│         │                                       │    SQLite      │  │
│         └───────────────────────────────────►  │    Database    │  │
│                                                  │ foodstore.db   │  │
│                    Pages:                        └────────────────┘  │
│                    - HomePage                                        │
│                    - CustomerPage                                    │
│                    - AdminPage                                       │
│                    - OrdersManagement                                │
│                    - MenuManagement                                  │
│                    - Dashboard                                       │
│                                                                       │
│  Routes:                                Routes:                      │
│  /api/menu                              /menu (GET, POST, PUT, DEL)  │
│  /api/search                            /orders (GET, POST, PUT)     │
│  /api/orders                            /search (GET)                │
│                                                                       │
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

## 📁 Project Structure

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

## 🚀 Setup Instructions

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

The Flask API will be available at: **http://localhost:5000**

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

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
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

## 💡 Design Decisions

### 1. **AI Search Implementation**
**Decision:** Multi-factor relevance scoring using keyword matching + string similarity

**Rationale:**
- Avoids complexity of ML models which require training data
- Still provides meaningful results for natural language queries
- Explainable: Each relevance score is computed deterministically
- Scalable: Works well for small to medium-sized menus
- Easy to debug and improve during demo

**Algorithm:**
```
Score = Exact phrase match (100) 
      + Word matches (30/15/10/5 depending on context)
      + Dietary tag matches (25)
      + String similarity bonus (SequenceMatcher)
```

### 2. **Database Design**
**Decision:** SQLite with SQLAlchemy ORM, no authentication/authorization layer

**Rationale:**
- SQLite needs no external dependency setup
- SQLAlchemy provides ORM abstraction, easy to migrate to PostgreSQL
- Role switching in UI (not backend) for demo simplicity
- Focus on core features rather than auth infrastructure
- Assumption: This is demo app, production would use proper auth

**Schema:**
- `MenuItem`: name, description, category, price, dietary_tags, available
- `Order`: customer_info, status, total_price
- `OrderItem`: order_id, menu_item_id, quantity, price (snapshot)

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

### 6. **API Design**
**Decision:** RESTful, JSON-based, proper HTTP status codes

**Rationale:**
- Industry standard
- Easy to test and document
- Frontend can easily migrate to mobile apps
- Clear separation of concerns from UI logic

---

## 🎯 Key Features Implementation

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
│          ORDER LIFECYCLE                         │
├──────────────────────────────────────────────────┤
│ 1. PLACED (Customer submits order)              │
│    • Order created with items and customer info │
│    • Cart cleared                               │
│                                                   │
│ 2. CONFIRMED (Admin confirms receipt)          │
│    • Payment verified, order acknowledged       │
│                                                   │
│ 3. PREPARING (Kitchen starts preparation)      │
│    • Items are being prepared                   │
│                                                   │
│ 4. READY (Order completed)                      │
│    • Customer notified (in real app)            │
│    • Waiting for pickup                         │
│                                                   │
│ 5. PICKED UP (Customer picks up order)         │
│    • Order complete                             │
│    • Can be archived                            │
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

## 🔄 Future Improvements

### Phase 2 - Production Ready
1. **Authentication & Authorization**
   - User registration/login
   - JWT tokens
   - Role-based access control (backend)
   - Session management

2. **Payment Integration**
   - Stripe or PayPal integration
   - Order payment tracking
   - Receipt generation

3. **Real-time Updates**
   - WebSocket for live order status
   - Admin/customer notifications
   - Real-time dashboard updates

4. **Cloud Deployment**
   - Backend: AWS/Heroku
   - Frontend: Vercel/Netlify
   - Database: PostgreSQL on RDS

5. **Enhanced Search**
   - Machine learning model (TF-IDF, word embeddings)
   - Semantic search
   - Autocomplete suggestions
   - Search analytics

6. **Advanced Features**
   - Inventory management
   - Kitchen display system (KDS)
   - Customer reviews/ratings
   - Loyalty programs
   - Multi-language support

7. **Analytics & Reporting**
   - Sales trends
   - Inventory forecasting
   - Customer analytics
   - Performance metrics

### Phase 3 - Enterprise
- Multi-restaurant support
- Delivery integrations
- Mobile app
- Advanced admin features
- API for third-party integrations

---

## 📝 Assumptions & Constraints

1. **No Real Authentication:** Role switching is UI-based for demo
2. **Local Database:** SQLite for simplicity (production would use PostgreSQL)
3. **No Payment Gateway:** Payment is not connected to real providers
4. **Single Restaurant:** App manages one restaurant, not multi-location
5. **No Email Notifications:** Orders are stored but notifications not sent
6. **Simple Search:** Not using ML/semantic search for demo
7. **CORS Enabled:** Allows local testing, would be restricted in production
8. **No Rate Limiting:** Added for production environment

---

## 🧪 Testing the Application

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

---

## 🤝 Support & Questions

For questions during the demo, I'm prepared to discuss:
- Why certain tech choices were made
- How to scale to production
- Edge cases and error handling
- Database schema evolution
- Performance optimization strategies
- Trade-offs between simplicity and features

---

## 📄 License

This project is part of KPi-Tech Services Inc. Hiring Assessment.

---

**Created:** June 18, 2026  
**Submission Format:** GitHub Repository with live demo on Microsoft Teams
