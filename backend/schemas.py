from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import date

class UserBase(BaseModel):
    name: str
    role: str
    active: bool = True

class UserCreate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    # Do not expose password in response

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None

class LoginRequest(BaseModel):
    user_id: int
    password: str

class NewsBase(BaseModel):
    title: str
    original_url: Optional[str] = None
    status: str = "Identificado"
    category: Optional[str] = None # Nerd, Geek, Trend
    classifications: Optional[Dict] = None

class NewsCreate(NewsBase):
    content_processed: str
    summary: str
    postulator_id: int
    category: Optional[str] = "Nerd" # Default

class News(NewsBase):
    id: int
    detection_date: date
    content_processed: str
    summary: str
    postulator_id: Optional[int]
    postulator: Optional[User] = None  # Populated from relationship
    category: Optional[str] = None
    in_council: bool = False
    is_prioritized: bool = False
    editorial_focus: Optional[str] = None
    assignees: List[User] = []
    votes: List["Vote"] = [] 

    class Config:
        from_attributes = True

class NewsUpdate(BaseModel):
    is_prioritized: Optional[bool] = None
    editorial_focus: Optional[str] = None
    status: Optional[str] = None
    assignee_ids: Optional[List[int]] = None
    category: Optional[str] = None

class UserStats(BaseModel):
    id: int
    name: str
    postulations: int
    prioritized: int
    assigned: int

class VoteBase(BaseModel):
    impact_score: int
    relevance_score: int
    category_suggestion: Optional[str] = None

class VoteCreate(VoteBase):
    news_id: int
    user_id: int

class Vote(VoteBase):
    id: int
    news_id: int
    user_id: int
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    product_type: str
    name: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    url: Optional[str] = None

class ProductCreate(ProductBase):
    news_id: int
    user_id: int

class Product(ProductBase):
    id: int
    news_id: int
    user_id: int
    created_at: date

    class Config:
        from_attributes = True
