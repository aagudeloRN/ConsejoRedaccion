from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import crud
import schemas

db = SessionLocal()

def seed_users():
    # Define the list of real users
    # Admin users will have a default password
    DEFAULT_ADMIN_PASSWORD = "rutan123"
    
    users_data = [
        {"name": "Alvaro Agudelo", "role": "Admin", "password": DEFAULT_ADMIN_PASSWORD},
        {"name": "Edwin Peláez", "role": "Postulador", "password": None},
        {"name": "Sebastián Rodrigez", "role": "Postulador", "password": None},
        {"name": "Zorayda Gutiérrez", "role": "Postulador", "password": None},
        {"name": "Juan Escobar", "role": "Postulador", "password": None},
        {"name": "Andres Calle", "role": "Postulador", "password": None},
        {"name": "Yessica Gutiérrez", "role": "Postulador", "password": None},
    ]

    print("Seeding users...")
    for user_data in users_data:
        existing_user = crud.get_user_by_name(db, name=user_data["name"])
        if not existing_user:
            user = schemas.UserCreate(
                name=user_data["name"], 
                role=user_data["role"],
                password=user_data.get("password")
            )
            crud.create_user(db=db, user=user)
            print(f"Created user: {user_data['name']} ({user_data['role']})")
        else:
            print(f"User already exists: {user_data['name']}")

    # Clean up any old test users if necessary? 
    # For now, we just add the new ones. Ideally we might want to clear old ones but 
    # to avoid FK consistency issues with existing news, we'll leave them or manually delete if needed.
    
    print("Seed complete.")

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    seed_users()
    db.close()
