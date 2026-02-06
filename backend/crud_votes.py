from sqlalchemy.orm import Session
import models, schemas

def create_vote(db: Session, vote: schemas.VoteCreate):
    # Check if vote exists for this user/news pair
    existing_vote = db.query(models.Vote).filter(
        models.Vote.user_id == vote.user_id,
        models.Vote.news_id == vote.news_id
    ).first()

    if existing_vote:
        # Update
        existing_vote.impact_score = vote.impact_score
        existing_vote.relevance_score = vote.relevance_score
        existing_vote.category_suggestion = vote.category_suggestion
        db.commit()
        db.refresh(existing_vote)
        return existing_vote
    else:
        # Create
        db_vote = models.Vote(
            user_id=vote.user_id,
            news_id=vote.news_id,
            impact_score=vote.impact_score,
            relevance_score=vote.relevance_score,
            category_suggestion=vote.category_suggestion
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote

def get_votes_by_news(db: Session, news_id: int):
    return db.query(models.Vote).filter(models.Vote.news_id == news_id).all()

def toggle_council_status(db: Session, news_id: int, in_council: bool):
    news = db.query(models.News).filter(models.News.id == news_id).first()
    if news:
        news.in_council = in_council
        db.commit()
        db.refresh(news)
    return news
