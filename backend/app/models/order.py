from app import db
from datetime import datetime
import json

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Placed')  # Placed, Confirmed, Preparing, Ready, Picked Up
    total_price = db.Column(db.Float, nullable=False)
    special_instructions = db.Column(db.String(500), default='')
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    ORDER_STATUSES = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Picked Up']
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'status': self.status,
            'total_price': self.total_price,
            'special_instructions': self.special_instructions,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price at time of order
    
    def to_dict(self):
        return {
            'id': self.id,
            'menu_item': self.menu_item.to_dict(),
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.quantity * self.price
        }
