"""End-to-end smoke test del flujo FIFO + notificaciones.
Crea 2 usuarios y 1 ítem (stock=1), simula:
  - U1 toma préstamo
  - U2 reserva  -> QUEUED
  - U3 reserva  -> QUEUED
  - Devuelven préstamo -> U2 pasa a READY, U3 sigue QUEUED
  - Forzar expiración de U2 -> U3 pasa a READY
"""
import os, sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app, db
from app.models.user import User, Role
from app.models.item import Item, Category, Location, Status
from app.models.loan import Loan, LoanDetail
from app.models.reservation import Reservation
from app.models.movement import Notification
from app.services.reservation_queue import (
    enqueue_reservation, on_item_available, process_reservation_queue,
)

app = create_app()

with app.app_context():
    # cleanup
    Reservation.query.delete()
    LoanDetail.query.delete()
    Loan.query.delete()
    Notification.query.delete()
    db.session.query(Item).filter(Item.code.like('SMOKE-%')).delete()
    db.session.query(User).filter(User.id.like('SMOKE-%')).delete()
    db.session.commit()

    role = Role.query.filter_by(name='APRENDIZ').first() or Role.query.first()
    cat  = Category.query.first() or Category(name='SmokeCat')
    loc  = Location.query.first() or Location(name='SmokeLoc', type='internal')
    avail = Status.query.filter_by(name='AVAILABLE').first() or Status(name='AVAILABLE')
    loaned = Status.query.filter_by(name='LOANED').first() or Status(name='LOANED')
    db.session.add_all([cat, loc, avail, loaned])
    db.session.flush()

    u1 = User(id='SMOKE-U1', document_type='CC', name='Smoke One',  email='s1@test.x', password='x', role_id=role.id)
    u2 = User(id='SMOKE-U2', document_type='CC', name='Smoke Two',  email='s2@test.x', password='x', role_id=role.id)
    u3 = User(id='SMOKE-U3', document_type='CC', name='Smoke Three',email='s3@test.x', password='x', role_id=role.id)
    item = Item(name='Smoke Book', code='SMOKE-1', category_id=cat.id, location_id=loc.id, status_id=loaned.id, stock=1)
    db.session.add_all([u1, u2, u3, item])
    db.session.flush()

    # U1 préstamo activo (creado a mano)
    loan = Loan(user_id=u1.id, due_date=datetime.utcnow()+timedelta(days=7), status='ACTIVE')
    db.session.add(loan); db.session.flush()
    db.session.add(LoanDetail(loan_id=loan.id, item_id=item.id, delivery_status='GOOD'))
    db.session.commit()

    # U2 reserva
    r2, err = enqueue_reservation(u2.id, item.id)
    assert err is None and r2.status == 'QUEUED', f"U2 should QUEUE, got {r2 and r2.status} err={err}"

    # U3 reserva
    r3, err = enqueue_reservation(u3.id, item.id)
    assert err is None and r3.status == 'QUEUED'

    print(f"  U2={r2.status} U3={r3.status}")

    # Devolver préstamo -> U2 READY
    item.status_id = avail.id
    loan.status = 'RETURNED'; loan.return_date = datetime.utcnow()
    db.session.commit()
    on_item_available(item.id)
    db.session.commit()

    db.session.refresh(r2); db.session.refresh(r3)
    print(f"  Tras devolución: U2={r2.status} U3={r3.status}")
    assert r2.status == 'READY' and r3.status == 'QUEUED'
    assert r2.expiration_date is not None

    # Notificación creada para U2
    n2 = Notification.query.filter_by(user_id=u2.id, type='RESERVATION_READY').first()
    assert n2, "Falta RESERVATION_READY para U2"

    # Forzar expiración: rebobinar 6h
    r2.expiration_date = datetime.utcnow() - timedelta(hours=1)
    db.session.commit()

    result = process_reservation_queue()
    print(f"  process_reservation_queue: {result}")

    db.session.refresh(r2); db.session.refresh(r3)
    print(f"  Tras expirar U2: U2={r2.status} U3={r3.status}")
    assert r2.status == 'EXPIRED'
    assert r3.status == 'READY'

    # Recordatorio horario: rebobinar last_reminder_sent
    r3.last_reminder_sent = datetime.utcnow() - timedelta(hours=2)
    db.session.commit()
    result2 = process_reservation_queue()
    print(f"  recordatorios: {result2}")

    rem = Notification.query.filter_by(user_id=u3.id, type='RESERVATION_REMINDER').first()
    assert rem, "Falta recordatorio para U3"

    print("OK ✓ Flujo FIFO + notificaciones + expiración + recordatorios funcionan.")

    # cleanup
    Reservation.query.delete()
    LoanDetail.query.delete()
    Loan.query.delete()
    Notification.query.delete()
    db.session.query(Item).filter(Item.code.like('SMOKE-%')).delete()
    db.session.query(User).filter(User.id.like('SMOKE-%')).delete()
    db.session.commit()
