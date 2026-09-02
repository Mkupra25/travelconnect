from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, models
from ..auth import get_current_user

router = APIRouter()


class TripRequest(BaseModel):
    preferred_country: Optional[str]
    preferred_city: Optional[str]
    budget: Optional[float]
    duration_days: Optional[int]
    interests: Optional[List[str]] = []


@router.post("/recommend")
def recommend_trip(req: TripRequest, db: Session = Depends(get_db)):
    # Simple rule-based recommendation: find destinations in country/city and under budget
    q = db.query(models.Destination)
    if req.preferred_country:
        q = q.filter(models.Destination.country.ilike(f"%{req.preferred_country}%"))
    if req.preferred_city:
        q = q.filter(models.Destination.city.ilike(f"%{req.preferred_city}%"))
    candidates = q.all()

    if not candidates:
        # fallback: top-rated destinations
        candidates = db.query(models.Destination).order_by(models.Destination.rating.desc()).limit(10).all()

    # Filter by simple budget heuristic using average_cost
    within_budget = []
    over_budget = []
    for d in candidates:
        if req.budget and d.average_cost and d.average_cost > 0:
            if d.average_cost <= req.budget:
                within_budget.append(d)
            else:
                over_budget.append(d)
        else:
            within_budget.append(d)

    if within_budget:
        picked = within_budget[:5]
        return {"status": "ok", "results": picked, "alternatives": over_budget[:5]}
    else:
        # no matches under budget, suggest alternatives with lower average_cost
        cheaper = db.query(models.Destination).order_by(models.Destination.average_cost.asc()).limit(5).all()
        return {"status": "no_budget_match", "results": cheaper, "alternatives": candidates[:5]}
