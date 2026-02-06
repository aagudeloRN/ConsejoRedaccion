from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(db, name=user.name)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Check if creating Executive role, limit to 1 active
    if user.role == "Dirección Ejecutiva":
        existing_exec = db.query(models.User).filter(models.User.role == "Dirección Ejecutiva", models.User.active == True).first()
        if existing_exec:
             raise HTTPException(status_code=400, detail="Ya existe una Dirección Ejecutiva activa. Desactive la anterior primero.")

    return crud.create_user(db=db, user=user)

@router.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not user.active:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    # If user is Admin or Executive, check password
    if user.role in ["Administrador", "Dirección Ejecutiva", "Admin"]:
        print(f"DEBUG LOGIN: User={user.name}, Role={user.role}, InputPass={request.password}, StorePass={user.password}")
        if not user.password:
             raise HTTPException(status_code=401, detail="Contraseña requerida no configurada en base de datos")
        
        if user.password != request.password:
             print(f"DEBUG LOGIN: Password mismatch for {user.name}")
             raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    
    print(f"DEBUG LOGIN: Success for {user.name}")
    return {"message": "Login successful", "user": user}

@router.patch("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.role is not None:
        # Check limit if changing role TO Exec
        if user_update.role == "Dirección Ejecutiva" and db_user.role != "Dirección Ejecutiva":
             existing_exec = db.query(models.User).filter(models.User.role == "Dirección Ejecutiva", models.User.active == True).first()
             if existing_exec:
                 raise HTTPException(status_code=400, detail="Ya existe una Dirección Ejecutiva activa.")
        db_user.role = user_update.role
        
    if user_update.active is not None:
        # Safeguard: Don't allow deactivating the last Admin
        if user_update.active is False and db_user.role in ["Administrador", "Admin"]:
            admin_count = db.query(models.User).filter(
                models.User.role.in_(["Administrador", "Admin"]), 
                models.User.active == True
            ).count()
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="No se puede desactivar al único administrador activo.")
        db_user.active = user_update.active

    if user_update.password is not None:
        db_user.password = user_update.password
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Safeguard: Don't allow deleting the last Admin
    if db_user.role in ["Administrador", "Admin"]:
        admin_count = db.query(models.User).filter(
            models.User.role.in_(["Administrador", "Admin"]), 
            models.User.active == True
        ).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="No se puede eliminar al único administrador.")

    try:
        db.delete(db_user)
        db.commit()
    except Exception as e:
        db.rollback()
        # Common case: IntegrityError (FK constraint)
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar el usuario porque tiene actividad asociada (votos, noticias, etc). Se recomienda desactivarlo en su lugar."
        )
            
    return {"message": "User deleted successfully"}
