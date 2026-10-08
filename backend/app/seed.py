from sqlalchemy.orm import Session

from app.models import Booking, User, UserRole, WorkerProfile
from app.security import get_password_hash


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    admin = User(
        email="admin@fixit.local",
        full_name="FixIt Admin",
        phone="9999999999",
        password_hash=get_password_hash("admin123"),
        role=UserRole.ADMIN.value,
        city="Bengaluru",
        is_active=True,
    )
    db.add(admin)
    db.flush()

    customer = User(
        email="customer@fixit.local",
        full_name="Demo Customer",
        phone="9000000000",
        password_hash=get_password_hash("customer123"),
        role=UserRole.CUSTOMER.value,
        city="Bengaluru",
        is_active=True,
    )
    db.add(customer)
    db.flush()

    worker_rows = [
        {
            "email": "ravi@fixit.local",
            "name": "Ravi Kumar",
            "phone": "9876543210",
            "skill": "Electrician",
            "experience": 8,
            "area": "Koramangala",
            "areas": ["Koramangala", "HSR Layout", "BTM Layout"],
            "bio": "Licensed electrician with 8 years experience. Specialise in home wiring, switchboard repairs, and inverter installations.",
            "services": ["Home wiring", "Switchboard repair", "Inverter installation", "Fan & light fitting"],
            "rating": 4.8,
            "reviews": 42,
            "verified": True,
        },
        {
            "email": "suresh@fixit.local",
            "name": "Suresh Gowda",
            "phone": "9845678901",
            "skill": "Plumber",
            "experience": 12,
            "area": "Whitefield",
            "areas": ["Whitefield", "Marathahalli", "Indiranagar"],
            "bio": "Expert plumber handling pipe repairs, bathroom fittings, and water tank cleaning.",
            "services": ["Pipe repair", "Bathroom fitting", "Tank cleaning", "Drainage unblocking"],
            "rating": 4.9,
            "reviews": 78,
            "verified": True,
        },
        {
            "email": "deepa@fixit.local",
            "name": "Deepa M.",
            "phone": "9611223344",
            "skill": "Home Cleaning",
            "experience": 5,
            "area": "BTM Layout",
            "areas": ["BTM Layout", "Jayanagar", "Banashankari"],
            "bio": "Home cleaning specialist offering deep cleaning and sanitisation services.",
            "services": ["Deep cleaning", "Sofa shampooing", "Kitchen cleaning", "Bathroom sanitising"],
            "rating": 4.9,
            "reviews": 107,
            "verified": True,
        },
    ]

    for row in worker_rows:
        user = User(
            email=row["email"],
            full_name=row["name"],
            phone=row["phone"],
            password_hash=get_password_hash("worker123"),
            role=UserRole.WORKER.value,
            city="Bengaluru",
            is_active=True,
        )
        db.add(user)
        db.flush()
        db.add(
            WorkerProfile(
                user_id=user.id,
                skill=row["skill"],
                experience_years=row["experience"],
                area=row["area"],
                areas=row["areas"],
                bio=row["bio"],
                phone=row["phone"],
                whatsapp=row["phone"],
                rating=row["rating"],
                reviews=row["reviews"],
                verified=row["verified"],
                services=row["services"],
                photo="",
            )
        )

    sample_booking = Booking(
        customer_id=customer.id,
        worker_id=1,
        service_name="Home wiring",
        message="Need a switchboard fix in Koramangala.",
        status="pending",
    )
    db.add(sample_booking)
    db.commit()
