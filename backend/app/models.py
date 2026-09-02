from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime
from sqlalchemy import Enum
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(200), unique=True, index=True)
    password_hash = Column(String(200))
    registration_date = Column(DateTime, default=datetime.datetime.utcnow)
    # role: 'tourist', 'business', 'admin'
    class RoleEnum(enum.Enum):
        tourist = "tourist"
        business = "business"
        admin = "admin"

    role = Column(Enum(RoleEnum), default=RoleEnum.tourist)

    businesses = relationship("Business", back_populates="owner")

class Destination(Base):
    __tablename__ = "destinations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    country = Column(String(100))
    city = Column(String(100))
    description = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    average_cost = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)

    reviews = relationship("Review", back_populates="destination")

class Business(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    type = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float, default=0.0)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="businesses")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    rating = Column(Integer)
    comment = Column(Text)
    review_date = Column(DateTime, default=datetime.datetime.utcnow)

    destination = relationship("Destination", back_populates="reviews")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    amount = Column(Float)
    currency = Column(String(10), default="USD")
    paid_at = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(Text)

    business = relationship("Business")
