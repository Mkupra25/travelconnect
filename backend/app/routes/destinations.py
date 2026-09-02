from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.Destination])
def list_destinations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_destinations(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Destination)
def create_destination(dest: schemas.DestinationCreate, db: Session = Depends(get_db)):
    return crud.create_destination(db, dest)

@router.get("/nearby", response_model=List[schemas.Destination])
def nearby(lat: float = Query(...), lon: float = Query(...), km: Optional[float] = 50, db: Session = Depends(get_db)):
    return crud.search_destinations_near(db, lat, lon, radius_km=km)
