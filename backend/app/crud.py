from sqlalchemy.orm import Session
from . import models, schemas

def get_destinations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Destination).offset(skip).limit(limit).all()

def create_destination(db: Session, dest: schemas.DestinationCreate):
    db_dest = models.Destination(**dest.dict())
    db.add(db_dest)
    db.commit()
    db.refresh(db_dest)
    return db_dest

def search_destinations_near(db: Session, lat: float, lon: float, radius_km: float = 50):
    # Simple bounding-box search for demo; replace with geospatial index in production
    lat_min = lat - radius_km/111
    lat_max = lat + radius_km/111
    lon_min = lon - radius_km/(111 * abs(lat) if lat!=0 else 1)
    lon_max = lon + radius_km/(111 * abs(lat) if lat!=0 else 1)
    return db.query(models.Destination).filter(
        models.Destination.latitude.between(lat_min, lat_max),
        models.Destination.longitude.between(lon_min, lon_max)
    ).all()

def get_businesses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Business).offset(skip).limit(limit).all()

def create_business(db: Session, biz: schemas.BusinessCreate):
    db_biz = models.Business(**biz.dict())
    db.add(db_biz)
    db.commit()
    db.refresh(db_biz)
    return db_biz
