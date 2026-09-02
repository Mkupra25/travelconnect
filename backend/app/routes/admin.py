from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import require_role

router = APIRouter()


@router.get("/payments")
def list_payments(db: Session = Depends(get_db), admin: models.User = Depends(require_role('admin'))):
    payments = db.query(models.Payment).all()
    return payments


@router.get("/businesses")
def list_businesses(db: Session = Depends(get_db), admin: models.User = Depends(require_role('admin'))):
    return db.query(models.Business).all()


@router.post("/business/{biz_id}/suspend")
def suspend_business(biz_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_role('admin'))):
    biz = db.query(models.Business).filter(models.Business.id == biz_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    # Simple soft-delete: remove owner association
    biz.owner_id = None
    db.add(biz)
    db.commit()
    return {"status": "suspended"}
