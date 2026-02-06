from sqlalchemy.orm import Session
import models, schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, role=user.role, active=user.active, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

from sqlalchemy import or_

def get_news(db: Session, skip: int = 0, limit: int = 100, search_query: str = None):
    query = db.query(models.News)
    
    if search_query:
        search = f"%{search_query}%"
        query = query.filter(
            or_(
                models.News.title.ilike(search),
                models.News.summary.ilike(search),
                models.News.content_processed.ilike(search)
            )
        )
        
    return query.order_by(models.News.detection_date.desc()).offset(skip).limit(limit).all()

def create_news(db: Session, news: schemas.NewsCreate):
    db_news = models.News(
        title=news.title,
        content_processed=news.content_processed,
        summary=news.summary,
        original_url=news.original_url,
        status=news.status,
        classifications=news.classifications,
        postulator_id=news.postulator_id,
        category=news.category
    )
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return db_news

def get_news_by_id(db: Session, news_id: int):
    return db.query(models.News).filter(models.News.id == news_id).first()
