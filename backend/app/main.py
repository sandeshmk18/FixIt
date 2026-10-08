from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.models import Booking, User, UserRole, WorkerProfile
from app.schemas import AdminStats, BookingCreate, BookingOut, BookingUpdate, ServiceItem, TokenResponse, UserCreate, UserOut, WorkerCreate, WorkerOut
from app.seed import seed_database
from app.security import authenticate_user, create_access_token, get_current_user, require_roles

app = FastAPI(title="FixIt API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_origin_regex=settings.cors_allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    seed_database(db)
    db.close()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "fixit-api"}


@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip(),
        password_hash=__import__("app.security", fromlist=["get_password_hash"]).get_password_hash(payload.password),
        city=payload.city.strip() or "Bengaluru",
        role=(payload.role or UserRole.CUSTOMER.value).lower(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.email))


@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(db, form_data.username.lower(), form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(access_token=create_access_token(user.email))


@app.get("/api/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@app.get("/api/workers", response_model=dict)
def list_workers(
    category: str | None = Query(default=None, alias="category"),
    area: str | None = Query(default=None, alias="area"),
    rating: float | None = Query(default=None, alias="rating"),
    sort: str = Query(default="rating"),
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(WorkerProfile).join(User, WorkerProfile.user_id == User.id).filter(User.is_active.is_(True))

    if category:
        query = query.filter(WorkerProfile.skill == category)
    if area:
        query = query.filter(or_(WorkerProfile.area == area, WorkerProfile.areas.contains([area])))
    if rating is not None:
        query = query.filter(WorkerProfile.rating >= rating)

    if sort == "newest":
        query = query.order_by(WorkerProfile.joined.desc())
    elif sort == "experience":
        query = query.order_by(WorkerProfile.experience_years.desc())
    else:
        query = query.order_by(WorkerProfile.rating.desc(), WorkerProfile.reviews.desc())

    total = query.count()
    items = query.all()
    payload = []
    for item in items:
        payload.append(
            {
                "id": item.id,
                "user_id": item.user_id,
                "name": item.user.full_name,
                "skill": item.skill,
                "experience_years": item.experience_years,
                "area": item.area,
                "areas": item.areas or [],
                "bio": item.bio,
                "phone": item.phone,
                "whatsapp": item.whatsapp,
                "rating": item.rating,
                "reviews": item.reviews,
                "verified": item.verified,
                "services": item.services or [],
                "photo": item.photo,
            }
        )
    return {"items": payload, "total": total}


@app.get("/api/workers/{worker_id}", response_model=dict)
def get_worker(worker_id: int, db: Session = Depends(get_db)) -> dict:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return {
        "id": worker.id,
        "user_id": worker.user_id,
        "name": worker.user.full_name,
        "skill": worker.skill,
        "experience_years": worker.experience_years,
        "area": worker.area,
        "areas": worker.areas or [],
        "bio": worker.bio,
        "phone": worker.phone,
        "whatsapp": worker.whatsapp,
        "rating": worker.rating,
        "reviews": worker.reviews,
        "verified": worker.verified,
        "services": worker.services or [],
        "photo": worker.photo,
        "email": worker.user.email,
    }


@app.post("/api/workers", response_model=WorkerOut)
def create_worker_profile(
    payload: WorkerCreate,
    current_user: User = Depends(require_roles(UserRole.WORKER.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db),
) -> WorkerProfile:
    if current_user.role == UserRole.CUSTOMER.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers cannot create worker profiles")

    existing_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Worker profile already exists")

    profile = WorkerProfile(
        user_id=current_user.id,
        skill=payload.skill.strip(),
        experience_years=max(0, int(payload.experience_years)),
        area=payload.area.strip(),
        areas=list(payload.areas or []),
        bio=payload.bio.strip(),
        phone=payload.phone.strip(),
        whatsapp=(payload.whatsapp or payload.phone).strip(),
        rating=float(payload.rating or 0.0),
        reviews=int(payload.reviews or 0),
        verified=bool(payload.verified),
        services=list(payload.services or []),
        photo=payload.photo or "",
    )

    current_user.role = UserRole.WORKER.value
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/api/services", response_model=list[ServiceItem])
def list_services() -> list[dict[str, str]]:
    return [
        {"name": "Electrician", "icon": "⚡"},
        {"name": "Plumber", "icon": "🔧"},
        {"name": "Civil Contractor", "icon": "🏗️"},
        {"name": "Painter", "icon": "🎨"},
        {"name": "Carpenter", "icon": "🪟"},
        {"name": "AC Repair", "icon": "❄️"},
        {"name": "Home Cleaning", "icon": "🧹"},
        {"name": "Locksmith", "icon": "🔒"},
        {"name": "Packers & Movers", "icon": "📦"},
        {"name": "Gardener", "icon": "🌿"},
        {"name": "Fabricator", "icon": "🔨"},
        {"name": "Interior Designer", "icon": "🏠"},
    ]


@app.post("/api/bookings", response_model=BookingOut)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(require_roles(UserRole.CUSTOMER.value, UserRole.ADMIN.value)),
    db: Session = Depends(get_db),
) -> Booking:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == payload.worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    booking = Booking(
        customer_id=current_user.id,
        worker_id=worker.id,
        service_name=payload.service_name.strip(),
        requested_date=(payload.requested_date or "").strip(),
        message=(payload.message or "").strip(),
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@app.get("/api/bookings", response_model=list[BookingOut])
def list_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Booking]:
    if current_user.role == UserRole.ADMIN.value:
        return db.query(Booking).order_by(Booking.created_at.desc()).all()
    if current_user.role == UserRole.WORKER.value:
        worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
        if not worker_profile:
            return []
        return db.query(Booking).filter(Booking.worker_id == worker_profile.id).order_by(Booking.created_at.desc()).all()
    return db.query(Booking).filter(Booking.customer_id == current_user.id).order_by(Booking.created_at.desc()).all()


@app.patch("/api/bookings/{booking_id}", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if current_user.role == UserRole.ADMIN.value:
        booking.status = payload.status.strip() or booking.status
    elif current_user.role == UserRole.WORKER.value:
        worker_profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
        if not worker_profile or booking.worker_id != worker_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own bookings")
        booking.status = payload.status.strip() or booking.status
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workers and admins may update booking status")

    db.commit(); db.refresh(booking)
    return booking


@app.get("/api/admin/stats", response_model=AdminStats)
def admin_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN.value)),
    db: Session = Depends(get_db),
) -> AdminStats:
    total_users = db.query(User).count()
    total_workers = db.query(WorkerProfile).count()
    total_bookings = db.query(Booking).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER.value).count()
    return AdminStats(
        total_users=total_users,
        total_workers=total_workers,
        total_bookings=total_bookings,
        total_customers=total_customers,
    )


@app.get("/api/admin/workers", response_model=list[WorkerOut])
def admin_workers(
    current_user: User = Depends(require_roles(UserRole.ADMIN.value)),
    db: Session = Depends(get_db),
) -> list[WorkerProfile]:
    return db.query(WorkerProfile).all()


@app.patch("/api/admin/workers/{worker_id}/verify", response_model=WorkerOut)
def toggle_worker_verification(
    worker_id: int,
    payload: dict[str, bool] | None = None,
    current_user: User = Depends(require_roles(UserRole.ADMIN.value)),
    db: Session = Depends(get_db),
) -> WorkerProfile:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    verified = worker.verified
    if isinstance(payload, dict):
        candidate = payload.get("verified")
        if candidate is not None:
            verified = bool(candidate)
    worker.verified = verified
    db.commit()
    db.refresh(worker)
    return worker
