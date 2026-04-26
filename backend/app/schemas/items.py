from ..extensions import ma
from ..models.item import Item, Category, Location, Status

class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True

class ItemSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Item
        load_instance = True
        include_fk = True
    
    category_name = ma.Function(lambda obj: obj.category.name if obj.category else "N/A")
    status_name = ma.Function(lambda obj: obj.status_obj.name if obj.status_obj else "N/A")
    location_name = ma.Function(lambda obj: obj.location.name if obj.location else "N/A")

class LocationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Location
        load_instance = True
