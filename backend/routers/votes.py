from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud_votes, schemas, models
from datetime import date
from database import get_db

router = APIRouter(
    prefix="/votes",
    tags=["votes"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Vote)
def cast_vote(vote: schemas.VoteCreate, db: Session = Depends(get_db)):
    return crud_votes.create_vote(db=db, vote=vote)

@router.get("/news/{news_id}", response_model=List[schemas.Vote])
def get_news_votes(news_id: int, db: Session = Depends(get_db)):
    return db.query(models.Vote).filter(models.Vote.news_id == news_id, models.Vote.is_active == True).all()

@router.put("/council/{news_id}")
def set_council_status(news_id: int, in_council: bool, db: Session = Depends(get_db)):
    updated_news = crud_votes.toggle_council_status(db, news_id, in_council)
    if not updated_news:
         raise HTTPException(status_code=404, detail="News not found")
    return updated_news

@router.post("/council/close")
def close_council(db: Session = Depends(get_db)):
    # 1. Create a new Council Session snapshot
    today = date.today()
    session = models.CouncilSession(summary=f"Consejo cerrado el {today}")
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # 2. Archive current votes: Set is_active=False and link to session
    # We only archive votes for news currently IN council
    subquery_news_in_council = db.query(models.News.id).filter(models.News.in_council == True)
    
    db.query(models.Vote).filter(
        models.Vote.news_id.in_(subquery_news_in_council),
        models.Vote.is_active == True
    ).update({
        models.Vote.is_active: False,
        models.Vote.session_id: session.id
    }, synchronize_session=False)

    # 3. Reset news status
    # Remove from council. If not prioritized, they go back to backlog (Identificado) implicitly by just removing from council.
    # If they were prioritized, they keep that status but leave the "voting board" (in_council=False).
    count = db.query(models.News).filter(models.News.in_council == True).update({models.News.in_council: False})
    
    # 4. Reset executive priorities for all news (new cycle starts)
    priority_count = db.query(models.News).filter(models.News.is_prioritized == True).update({models.News.is_prioritized: False})
    
    db.commit()
    return {"message": f"Council closed. Session {session.id} created. {count} news items removed from the active board. {priority_count} executive priorities reset."}
