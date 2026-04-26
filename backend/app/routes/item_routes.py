from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.item import Item, Category, Status, Location
from ..schemas.items import ItemSchema
from sqlalchemy import func

items_bp = Blueprint('items', __name__)
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)

@items_bp.route('/', methods=['GET'])
def get_items():
    search = request.args.get('search', '')
    category_id = request.args.get('category_id')
    status_id = request.args.get('status_id')
    location_id = request.args.get('location_id')

    query = Item.query

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                func.concat(Item.id, ' ', Item.name, ' ', Item.code, ' ', Item.brand, ' ', Item.model, ' ', Item.serial_number).ilike(search_filter)
            )
        )

    if category_id and category_id != 'ALL':
        query = query.filter_by(category_id=category_id)
    if status_id and status_id != 'ALL':
        query = query.filter_by(status_id=status_id)
    if location_id and location_id != 'ALL':
        query = query.filter_by(location_id=location_id)

    all_items = query.all()
    return items_schema.jsonify(all_items)

@items_bp.route('/filters', methods=['GET'])
def get_item_filters():
    categories = Category.query.all()
    statuses = Status.query.all()
    locations = Location.query.all()
    
    return jsonify({
        "categories": [{"id": c.id, "name": c.name} for c in categories],
        "statuses": [{"id": s.id, "name": s.name} for s in statuses],
        "locations": [{"id": l.id, "name": l.name} for l in locations]
    })

@items_bp.route('/<int:id>', methods=['GET'])
def get_item(id):
    item = Item.query.get_or_404(id)
    return item_schema.jsonify(item)

@items_bp.route('/', methods=['POST'])
def add_item():
    data = request.json
    new_item = Item(
        name=data.get('name') or data.get('nombre'),
        description=data.get('description') or data.get('descripcion'),
        code=data.get('code') or data.get('codigo'),
        category_id=data.get('category_id'),
        location_id=data.get('location_id'),
        status_id=data.get('status_id'),
        supplier_id=data.get('supplier_id'),
        brand=data.get('brand'),
        model=data.get('model'),
        serial_number=data.get('serial_number'),
        image_url=data.get('image_url'),
        stock=data.get('stock', 1)
    )
    db.session.add(new_item)
    db.session.commit()
    return item_schema.jsonify(new_item), 201
