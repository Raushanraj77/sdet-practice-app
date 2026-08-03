import os
import sys

from dotenv import load_dotenv
from sqlalchemy import select

# Allow imports from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password

load_dotenv()


def create_admin() -> None:
    email = input("Admin email: ").strip()
    name = input("Admin name: ").strip()
    password = input("Admin password: ")

    if not email or not name or not password:
        raise ValueError("Name, email and password are required.")

    db = SessionLocal()

    try:
        existing_user = db.scalar(select(User).where(User.email == email))

        if existing_user:
            if existing_user.role == "ADMIN":
                print("ADMIN user already exists.")
                return

            existing_user.role = "ADMIN"
            existing_user.password_hash = hash_password(password)
            existing_user.status = "ACTIVE"

            db.commit()

            print("Existing user promoted to ADMIN successfully.")
            return

        admin = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role="ADMIN",
            status="ACTIVE",
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"ADMIN user created successfully. ID={admin.id}, email={admin.email}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
