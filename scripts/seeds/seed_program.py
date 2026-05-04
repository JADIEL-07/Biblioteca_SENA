from app import create_app, db
from app.models.user import FormationProgram

app = create_app()
with app.app_context():
    db.create_all()
    if not FormationProgram.query.filter_by(id='2672153').first():
        db.session.add(FormationProgram(id='2672153', name='ADSO'))
        db.session.commit()
        print("Program 2672153 (ADSO) created.")
    else:
        print("Program already exists.")
