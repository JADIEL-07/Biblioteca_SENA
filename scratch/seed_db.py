from app import create_app, db
from app.models.item import Item, Category, Location
from datetime import datetime

app = create_app()
with app.app_context():
    try:
        loc = Location.query.first()
        cat_lib = Category.query.filter_by(name='Libros').first()
        cat_equ = Category.query.filter_by(name='Equipos de Cómputo').first()
        cat_her = Category.query.filter_by(name='Herramientas').first()
        cat_aud = Category.query.filter_by(name='Audiovisual').first()
        
        # Mapeo de IDs de estado verificados
        # 1: DISPONIBLE, 8: PRESTADO, 6: DAÑADO, 7: EN MANTENIMIENTO
        
        new_items = [
            Item(name='Laptop MacBook Pro 14\" M2', code='EQU-003', category_id=cat_equ.id, location_id=loc.id, 
                 status_id=1, physical_condition='Excelente', brand='Apple', model='M2 16GB/512GB',
                 description='Potente estación de trabajo para desarrollo y diseño.', stock=3,
                 image_url='https://images.unsplash.com/photo-1517336714731-489689fd1ca8'),
            
            Item(name='Osciloscopio Digital Rigol', code='HER-003', category_id=cat_her.id, location_id=loc.id, 
                 status_id=1, physical_condition='Excelente', brand='Rigol', model='DS1054Z',
                 description='Osciloscopio de 4 canales y 50 MHz para electrónica.', stock=2,
                 image_url='https://images.unsplash.com/photo-1581092160562-40aa08e78837'),
            
            Item(name='Cámara Sony Alpha A7 IV', code='EQU-004', category_id=cat_aud.id, location_id=loc.id, 
                 status_id=8, physical_condition='Bueno', brand='Sony', model='Alpha 7 IV',
                 description='Cámara Mirrorless Full-frame de 33MP.', stock=1,
                 image_url='https://images.unsplash.com/photo-1516035069371-29a1b244cc32'),
            
            Item(name='Taladro de Impacto Makita', code='HER-004', category_id=cat_her.id, location_id=loc.id, 
                 status_id=7, physical_condition='Regular', brand='Makita', model='HP1630',
                 description='Taladro profesional para trabajos pesados.', stock=5,
                 image_url='https://images.unsplash.com/photo-1504148455328-c376907d081c'),
            
            Item(name='iPad Air 5ta Gen', code='EQU-005', category_id=cat_equ.id, location_id=loc.id, 
                 status_id=1, physical_condition='Excelente', brand='Apple', model='Air M1',
                 description='Tablet versátil para toma de notas y diseño.', stock=8,
                 image_url='https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0'),
            
            Item(name='Libro: Python Crash Course', code='LIB-002', category_id=cat_lib.id, location_id=loc.id, 
                 status_id=1, physical_condition='Excelente', brand='No Starch Press', model='3rd Edition',
                 description='Una introducción práctica a la programación con Python.', stock=15,
                 image_url='https://images.unsplash.com/photo-1515879218367-8466d910aaa4'),
            
            Item(name='Kit de Arduino Uno R3', code='HER-005', category_id=cat_her.id, location_id=loc.id, 
                 status_id=6, physical_condition='Malo', brand='Arduino', model='Starter Kit',
                 description='Kit básico para aprendizaje de microcontroladores.', stock=10,
                 image_url='https://images.unsplash.com/photo-1553406830-ef2513450d76'),
            
            Item(name='Monitor LG UltraWide 34\"', code='EQU-006', category_id=cat_equ.id, location_id=loc.id, 
                 status_id=1, physical_condition='Excelente', brand='LG', model='34WN750',
                 description='Monitor panorámico para máxima productividad.', stock=4,
                 image_url='https://images.unsplash.com/photo-1527443224154-c4a3942d3acf'),
            
            Item(name='Libro: The Pragmatic Programmer', code='LIB-003', category_id=cat_lib.id, location_id=loc.id, 
                 status_id=8, physical_condition='Bueno', brand='Addison-Wesley', model='20th Anniversary',
                 description='Consejos prácticos para desarrolladores de software.', stock=5,
                 image_url='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'),
            
            Item(name='Estación de Soldadura Hakko', code='HER-006', category_id=cat_her.id, location_id=loc.id, 
                 status_id=1, physical_condition='Bueno', brand='Hakko', model='FX-888D',
                 description='Estación de soldadura digital de alta precisión.', stock=3,
                 image_url='https://images.unsplash.com/photo-1581092335397-9583fe92d23c')
        ]
        
        db.session.add_all(new_items)
        db.session.commit()
        print('INVENTORY_SEED_SUCCESS')
    except Exception as e:
        db.session.rollback()
        print(f'INVENTORY_SEED_ERROR: {str(e)}')
