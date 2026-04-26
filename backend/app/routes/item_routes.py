from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.item import Item, Category, Status, Location
from ..schemas.items import ItemSchema
from sqlalchemy import func, or_, String

items_bp = Blueprint('items', __name__)
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)

@items_bp.route('/', methods=['GET'])
def get_items():
    search = request.args.get('search', '')
    cat_id = request.args.get('category_id')
    stat_id = request.args.get('status_id')
    loc_id = request.args.get('location_id')

    # Query base sin joins innecesarios al inicio
    query = Item.query

    # Búsqueda global
    if search:
        search_filter = f"%{search}%"
        # Hacemos join solo si hay búsqueda para evitar duplicados o lentitud
        query = query.outerjoin(Category, Item.category_id == Category.id).outerjoin(Status, Item.status_id == Status.id)
        query = query.filter(
            or_(
                Item.id.cast(String).ilike(search_filter),
                Item.name.ilike(search_filter),
                Item.code.ilike(search_filter),
                Item.brand.ilike(search_filter),
                Item.model.ilike(search_filter),
                Item.serial_number.ilike(search_filter),
                Category.name.ilike(search_filter),
                Status.name.ilike(search_filter)
            )
        )

    # Filtros específicos (Solo si no son 'ALL', '', o 'undefined')
    if cat_id and cat_id not in ['ALL', '', 'undefined', 'null']:
        query = query.filter(Item.category_id == cat_id)
    
    if stat_id and stat_id not in ['ALL', '', 'undefined', 'null']:
        query = query.filter(Item.status_id == stat_id)
        
    if loc_id and loc_id not in ['ALL', '', 'undefined', 'null']:
        query = query.filter(Item.location_id == loc_id)

    items = query.order_by(Item.id.desc()).all()
    return items_schema.jsonify(items)

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
    # Manejo de categoría y ubicación por defecto
    category_id = data.get('category_id')
    if not category_id:
        default_cat = Category.query.filter_by(name='GENERAL').first()
        category_id = default_cat.id if default_cat else 1 # Fallback al ID 1
        
    location_id = data.get('location_id')
    if not location_id:
        default_loc = Location.query.filter_by(name='ALMACEN GENERAL').first()
        location_id = default_loc.id if default_loc else 1

    new_item = Item(
        name=data.get('name') or data.get('nombre'),
        description=data.get('description') or data.get('descripcion'),
        code=data.get('code') or data.get('codigo'),
        category_id=category_id,
        location_id=location_id,
        status_id=data.get('status_id'),
        supplier_id=data.get('supplier_id'),
        brand=data.get('brand'),
        model=data.get('model'),
        serial_number=data.get('serial_number'),
        image_url=data.get('image_url'),
        stock=data.get('stock', 1)
    )
    try:
        db.session.add(new_item)
        db.session.commit()
        return item_schema.jsonify(new_item), 201
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        if "UNIQUE constraint failed" in error_msg:
            if "items.code" in error_msg:
                return jsonify({"error": "El código (QR/Barras) ya está registrado en otro elemento"}), 400
            if "items.serial_number" in error_msg:
                return jsonify({"error": "El número de serie ya está registrado"}), 400
        return jsonify({"error": "Error de validación: Verifique que todos los campos obligatorios estén llenos"}), 400
