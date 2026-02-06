from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/users", response_model=List[schemas.UserStats])
def get_user_stats(db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.active == True).all()
    stats = []
    
    for user in users:
        # Count postulations
        postulations = db.query(models.News).filter(models.News.postulator_id == user.id).count()
        
        # Count how many of their postulations were prioritized
        prioritized = db.query(models.News).filter(
            models.News.postulator_id == user.id,
            models.News.is_prioritized == True
        ).count()
        
        # Count how many news they are assigned to
        # We check the association table news_assignments
        assigned = db.query(models.news_assignments).filter(
            models.news_assignments.c.user_id == user.id
        ).count()
        
        stats.append(schemas.UserStats(
            id=user.id,
            name=user.name,
            postulations=postulations,
            prioritized=prioritized,
            assigned=assigned
        ))
        
    return stats
