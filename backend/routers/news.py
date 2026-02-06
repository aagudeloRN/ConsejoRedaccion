from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
import crud, models, schemas
from database import get_db
from services import ai_service, extraction_service

router = APIRouter(
    prefix="/news",
    tags=["news"],
    responses={404: {"description": "Not found"}},
)

@router.post("/analyze", response_model=schemas.NewsBase)
async def analyze_news(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Analyzes content from a URL or PDF file using Gemini AI.
    Returns the analysis (title, summary, classifications) without saving to DB yet.
    """
    if not url and not file:
        raise HTTPException(status_code=400, detail="Must provide either URL or File")

    text_content = ""
    
    if url:
        text_content = extraction_service.extract_from_url(url)
    elif file:
        if file.content_type != "application/pdf":
             raise HTTPException(status_code=400, detail="Only PDF files are supported")
        file_content = await file.read()
        text_content = extraction_service.extract_from_pdf(file_content)

    if not text_content:
        raise HTTPException(status_code=400, detail="Could not extract text content")

    if text_content == "OCR_REQUIRED":
         return schemas.NewsBase(
            title="PDF No Procesable (Requiere OCR)",
            original_url=url if url else "Archivo PDF",
            status="Identificado",
            classifications={
                "summary": "El documento parece ser un PDF escaneado o una imagen sin capa de texto. El sistema actual no soporta OCR (Reconocimiento Óptico de Caracteres).",
                "theme": "Error de Formato",
                "geography": "N/A",
                "impact": "N/A",
                "keywords": []
            }
        )

    # Call Gemini AI
    # Now async and locked
    analysis = await ai_service.analyze_text(text_content)
    
    # Return structured data for frontend preview
    return schemas.NewsBase(
        title=analysis.get("title", "Sin título"),
        original_url=url if url else "Archivo PDF",
        status="Identificado",
        classifications={
            "summary": analysis.get("summary", ""),
            "theme": analysis.get("theme", ""),
            "geography": analysis.get("geography", ""),
            "impact": analysis.get("impact", ""),
            "keywords": analysis.get("keywords", []),
            "content_processed": text_content[:5000] # Return a snippet of processed text
        }
    )

@router.post("/", response_model=schemas.News)
def create_news(news: schemas.NewsCreate, db: Session = Depends(get_db)):
    return crud.create_news(db=db, news=news)

@router.get("/", response_model=List[schemas.News])
def read_news(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None, 
    include_archived: bool = False,
    db: Session = Depends(get_db)
):
    # Base query
    query = db.query(models.News)
    
    # Filter out archived unless requested
    if not include_archived:
        query = query.filter(models.News.status != "Archivado")
        
    # Search logic (basic ILIKE for now, can be improved)
    if q:
        search = f"%{q}%"
        query = query.filter(
            (models.News.title.ilike(search)) | 
            (models.News.status.ilike(search))
        )
        
    return query.offset(skip).limit(limit).all()

@router.patch("/{news_id}/archive")
def archive_news(news_id: int, db: Session = Depends(get_db)):
    db_news = crud.get_news_by_id(db, news_id=news_id)
    if not db_news:
         raise HTTPException(status_code=404, detail="News not found")
    
    db_news.status = "Archivado"
    db_news.in_council = False # Remove from council if it was there
    db.commit()
    return db_news

@router.patch("/{news_id}/reactivate")
def reactivate_news(news_id: int, db: Session = Depends(get_db)):
    db_news = crud.get_news_by_id(db, news_id=news_id)
    if not db_news:
         raise HTTPException(status_code=404, detail="News not found")
    
    db_news.status = "Identificado" # Reset to initial status
    db.commit()
    return db_news

@router.get("/{news_id}", response_model=schemas.News)
def read_news_item(news_id: int, db: Session = Depends(get_db)):
    db_news = crud.get_news_by_id(db, news_id=news_id)
    if db_news is None:
        raise HTTPException(status_code=404, detail="News not found")
    return db_news

@router.patch("/{news_id}", response_model=schemas.News)
def update_news_item(news_id: int, news_update: schemas.NewsUpdate, db: Session = Depends(get_db)):
    db_news = crud.get_news_by_id(db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Update simple fields
    if news_update.is_prioritized is not None:
        db_news.is_prioritized = news_update.is_prioritized
    if news_update.editorial_focus is not None:
        db_news.editorial_focus = news_update.editorial_focus
    if news_update.status is not None:
        db_news.status = news_update.status
    if news_update.category is not None:
        db_news.category = news_update.category
        
    # Update assignments (Many-to-Many)
    if news_update.assignee_ids is not None:
        # Fetch users
        users = db.query(models.User).filter(models.User.id.in_(news_update.assignee_ids)).all()
        db_news.assignees = users
        
    db.commit()
    db.refresh(db_news)
    return db_news

@router.delete("/{news_id}")
def delete_news_item(news_id: int, db: Session = Depends(get_db)):
    db_news = crud.get_news_by_id(db, news_id=news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Optional: Delete associated votes or let database cascade
    db.delete(db_news)
    db.commit()
    return {"message": "News deleted successfully"}
