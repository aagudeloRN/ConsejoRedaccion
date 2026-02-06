from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db
import shutil
import os
from datetime import datetime

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

UPLOAD_DIR = "uploads/products"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Product)
async def create_product(
    news_id: int = Form(...),
    user_id: int = Form(...),
    product_type: str = Form(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Verify news exists
    news = db.query(models.News).filter(models.News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Verify user is assigned to this news
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    is_assigned = user in news.assignees
    if not is_assigned:
        raise HTTPException(
            status_code=403, 
            detail="Only users assigned to this news can add products"
        )
    
    file_path = None
    
    if file:
        # Save file
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
    db_product = models.Product(
        news_id=news_id,
        user_id=user_id,
        product_type=product_type,
        name=name,
        description=description,
        file_path=file_path,
        url=url
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=List[schemas.Product])
def read_all_products(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all products across all news items"""
    return db.query(models.Product).order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/news/{news_id}", response_model=List[schemas.Product])
def read_products_by_news(news_id: int, db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.news_id == news_id).all()

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Optional: Delete file if exists
    if product.file_path and os.path.exists(product.file_path):
        os.remove(product.file_path)
        
    db.delete(product)
    db.commit()
    return {"ok": True}
