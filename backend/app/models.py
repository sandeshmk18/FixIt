import enum

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    WORKER = "worker"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.CUSTOMER.value, nullable=False)
    city = Column(String(100), default="Bengaluru", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    bookings = relationship("Booking", foreign_keys="Booking.customer_id", back_populates="customer")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    skill = Column(String(120), nullable=False)
    experience_years = Column(Integer, default=0, nullable=False)
    area = Column(String(120), nullable=False)
    areas = Column(JSON, default=list, nullable=False)
    bio = Column(Text, default="", nullable=False)
    phone = Column(String(30), nullable=False)
    whatsapp = Column(String(30), nullable=True)
    rating = Column(Float, default=0.0, nullable=False)
    reviews = Column(Integer, default=0, nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    services = Column(JSON, default=list, nullable=False)
    photo = Column(String(500), default="", nullable=False)
    joined = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="worker_profile")
    bookings = relationship("Booking", foreign_keys="Booking.worker_id", back_populates="worker")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("worker_profiles.id"), nullable=False)
    service_name = Column(String(120), nullable=False)
    requested_date = Column(String(30), default="", nullable=False)
    status = Column(String(30), default="pending", nullable=False)
    message = Column(Text, default="", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="bookings")
    worker = relationship("WorkerProfile", foreign_keys=[worker_id], back_populates="bookings")
