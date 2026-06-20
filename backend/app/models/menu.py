from app import db
from datetime import datetime
import json

class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    dietary_tags = db.Column(db.String(500), default='[]')  # JSON string
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True, cascade='all, delete-orphan')
    
    def get_tags(self):
        """Get dietary tags as list"""
        try:
            return json.loads(self.dietary_tags)
        except:
            return []
    
    def set_tags(self, tags):
        """Set dietary tags from list"""
        self.dietary_tags = json.dumps(tags)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'price': self.price,
            'dietary_tags': self.get_tags(),
            'available': self.available,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
