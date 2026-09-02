from pydantic import BaseModel
from typing import Optional, List
import datetime

class DestinationBase(BaseModel):
    name: str
    country: Optional[str]
    city: Optional[str]
    description: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    average_cost: Optional[float]

class DestinationCreate(DestinationBase):
    pass

class Destination(DestinationBase):
    id: int
    rating: Optional[float]

    class Config:
        orm_mode = True

class BusinessBase(BaseModel):
    name: str
    type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    description: Optional[str]

class BusinessCreate(BusinessBase):
    pass

class Business(BusinessBase):
    id: int
    rating: Optional[float]
    owner_id: Optional[int]

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: Optional[str] = "tourist"


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: Optional[str]

    class Config:
        orm_mode = True


class PaymentBase(BaseModel):
    business_id: int
    amount: float
    currency: Optional[str] = "USD"
    note: Optional[str]

class Payment(PaymentBase):
    id: int
    paid_at: datetime.datetime

    class Config:
        orm_mode = True
