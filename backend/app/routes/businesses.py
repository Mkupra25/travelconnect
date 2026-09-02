from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from typing import List
from ..auth import get_current_user, require_role

router = APIRouter()


@router.get("/", response_model=List[schemas.Business])
def list_businesses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_businesses(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Business)
def create_business(biz: schemas.BusinessCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # Only business users (or admin) may create a business linked to their account
    if user.role.value not in ("business", "admin"):
        raise HTTPException(status_code=403, detail="Only business owners can create businesses")
    db_biz = models.Business(**biz.dict())
    db_biz.owner_id = user.id
    db.add(db_biz)
    db.commit()
    db.refresh(db_biz)
    return db_biz


@router.post("/{biz_id}/payment", response_model=schemas.Payment)
def create_payment(biz_id: int, payment: schemas.PaymentBase, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    biz = db.query(models.Business).filter(models.Business.id == biz_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    # only owner or admin may add payments
    if user.role.value != 'admin' and biz.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    pay = models.Payment(business_id=biz_id, amount=payment.amount, currency=payment.currency, note=payment.note)
    db.add(pay)
    db.commit()
    db.refresh(pay)
    return pay
