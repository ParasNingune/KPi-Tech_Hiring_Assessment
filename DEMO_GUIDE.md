# 🚀 Quick Start Guide - Demo Ready

## Pre-Demo Checklist

- [ ] Have backend running on localhost:5000
- [ ] Have frontend running on localhost:3000
- [ ] Both terminals open and visible
- [ ] Prepared talking points on design decisions
- [ ] Test account info ready (test orders)

---

## One-Click Demo Setup

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

**Expected output:**
```
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server. Do not use it in production deployment.
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v4.5.0  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

---

## Demo Flow (30 minutes)

### Part 1: Introduction (3 minutes)
- Brief system overview
- Architecture diagram walkthrough
- Tech stack explanation

### Part 2: Customer View (8 minutes)
1. Show homepage with menu items
2. Filter by category
3. **AI Search Demo:** Try these queries:
   - "something spicy and vegetarian"
   - "light lunch"
   - "high protein"
4. Add items to cart
5. Checkout flow
6. Order confirmation

### Part 3: Admin View (8 minutes)
1. Switch to Admin role
2. Show Dashboard with stats
3. Manage Menu tab:
   - Create new item
   - Edit existing item
   - Show dietary tags
4. Manage Orders tab:
   - View orders from customer
   - Update order status through workflow
   - See stats update

### Part 4: Technical Deep Dive (8 minutes)
1. Show code structure
2. Explain AI search algorithm
3. Database schema
4. API endpoints
5. Design decisions & trade-offs

### Part 5: Q&A (3 minutes)
- Edge cases
- Scale to production
- Future improvements
- Problem-solving approach

---

## Sample Data for Testing

### Test Customer
- Name: John Doe
- Email: john@example.com
- Phone: (555) 123-4567

### Test Queries for Search
```
Light lunch
Spicy vegetarian
High protein
Sweet dessert
Healthy option
Gluten free
```

### Test Orders to Create
1. Order 1: Margherita Pizza (qty: 2) + Spring Rolls (qty: 1)
2. Order 2: Grilled Chicken Steak (qty: 1) + Iced Coffee (qty: 2)
3. Order 3: Spicy Vegetable Curry (qty: 1) + Cheesecake (qty: 1)

---

## Dashboard Stats to Show
After creating a few orders, show:
- Total Orders count
- Orders by Status breakdown
- Today's Revenue calculation
- Popular Items ranking

---

## Key Talking Points

### Why Flask?
- Lightweight, perfect for demo
- Python for data processing (AI search)
- Easy to explain to non-technical evaluators
- Production-ready with FastAPI alternative

### Why Chakra UI?
- Professional, accessible components
- Built-in dark mode
- Responsive design without boilerplate
- Clear design system

### Why Context API?
- Suitable for app complexity
- No external dependencies
- Clear component tree
- Easy to refactor to Redux if needed

### AI Search Algorithm
- Simple, deterministic, explainable
- Multi-factor scoring based on relevance
- No ML model needed (avoids complexity)
- Works well for small/medium menus

### Database Design
- SQLite for zero-config setup
- SQLAlchemy for easy migration
- Normalized schema for integrity
- Ready for PostgreSQL in production

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found (Backend)
```bash
pip install -r requirements.txt
```

### npm Dependencies (Frontend)
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
- Both services should be running
- Frontend ports to http://localhost:5000
- Vite config has proxy setup

### Database Reset
Remove `backend/foodstore.db` and restart backend to reinitialize with sample data.

---

## Performance Tips

- Frontend loads in < 2s
- Search response < 100ms
- API requests < 500ms
- Responsive to user clicks
- Smooth animations with Framer Motion

---

## Code Quality Indicators

✅ **Clean Code:**
- Clear variable names
- Proper separation of concerns
- Modular component structure

✅ **Error Handling:**
- Try-catch blocks in API calls
- User feedback via toast notifications
- Endpoint status code validation

✅ **State Management:**
- Single source of truth (Context)
- Proper props drilling
- Memoization where needed

✅ **Best Practices:**
- RESTful API design
- DRY principle
- Accessibility (Chakra UI)
- Mobile responsive

---

## Time Management

Total: 30 minutes
- Setup/Intro: 5 min
- Demo Features: 15 min
- Code Review: 7 min
- Q&A: 3 min

**Buffer:** Keep 2-3 minutes for unexpected issues

---

Good luck! 🎯
