from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str
    full_name: str
    phone: str
    password: str = Field(..., min_length=6)
    city: str = "Bengaluru"
    role: str = "customer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: str
    city: str
    role: str
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WorkerCreate(BaseModel):
    skill: str
    experience_years: int = 0
    area: str
    areas: list[str] = []
    bio: str = ""
    phone: str
    whatsapp: str | None = None
    rating: float = 0.0
    reviews: int = 0
    verified: bool = False
    services: list[str] = []
    photo: str = ""


class WorkerOut(BaseModel):
    id: int
    user_id: int
    skill: str
    experience_years: int
    area: str
    areas: list[str]
    bio: str
    phone: str
    whatsapp: str | None
    rating: float
    reviews: int
    verified: bool
    services: list[str]
    photo: str

    model_config = ConfigDict(from_attributes=True)


class BookingCreate(BaseModel):
    worker_id: int
    service_name: str
    requested_date: str = ""
    message: str = ""


class BookingOut(BaseModel):
    id: int
    customer_id: int
    worker_id: int
    service_name: str
    requested_date: str = ""
    status: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class BookingUpdate(BaseModel):
    status: str


class ServiceItem(BaseModel):
    name: str
    icon: str = "🔧"


class AdminStats(BaseModel):
    total_users: int
    total_workers: int
    total_bookings: int
    total_customers: int
