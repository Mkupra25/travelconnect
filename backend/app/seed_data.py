"""Seed script to populate sample destinations, businesses, users, and payments."""
from .database import SessionLocal, engine
from . import models

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # create admin
        admin = db.query(models.User).filter(models.User.email == 'admin@example.com').first()
        if not admin:
            admin = models.User(first_name='Admin', last_name='User', email='admin@example.com', password_hash='admin', role=models.User.RoleEnum.admin)
            db.add(admin)
            db.commit()

        # sample destinations
        if not db.query(models.Destination).first():
            d1 = models.Destination(name='Old Town', country='Georgia', city='Tbilisi', description='Historic district', latitude=41.693640, longitude=44.801488, average_cost=100, rating=4.5)
            d2 = models.Destination(name='Sea Beach', country='Georgia', city='Batumi', description='Black Sea beach', latitude=41.6168, longitude=41.6360, average_cost=80, rating=4.2)
            db.add_all([d1, d2])
            db.commit()

        # sample businesses
        if not db.query(models.Business).first():
            b1 = models.Business(name='Cafe Central', type='cafe', latitude=41.694, longitude=44.798, rating=4.3, description='Cozy cafe')
            b2 = models.Business(name='Souvenir Shop', type='shop', latitude=41.695, longitude=44.799, rating=4.0, description='Local crafts')
            db.add_all([b1, b2])
            db.commit()

    finally:
        db.close()

if __name__ == '__main__':
    seed()
