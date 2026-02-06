from sqlalchemy import Column, Integer, String, Boolean, Text, Date, ForeignKey, JSON, Enum, Table
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import date

# Association table for multiple assignees to a news item
news_assignments = Table(
    "news_assignments",
    Base.metadata,
    Column("news_id", Integer, ForeignKey("news.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class UserRole(str, enum.Enum):
    ADMIN = "Administrador"
    EXECUTIVE = "Dirección Ejecutiva"
    EDITOR = "Editor / Analista CTI"
    LEADER = "Líder CP"
    READER = "Lector"
    POSTULATOR = "Postulador"

class NewsStatus(str, enum.Enum):
    IDENTIFIED = "Identificado"
    ANALYSIS = "En análisis"
    PRIORITIZED = "Priorizado"
    IN_PROGRESS = "En desarrollo"
    PRODUCT_GENERATED = "Producto generado"
    ARCHIVED = "Archivado"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String) 
    password = Column(String, nullable=True) # Simple plaintext for this MVP as requested ("all admins same pass")
    active = Column(Boolean, default=True)

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content_processed = Column(Text)
    summary = Column(Text)
    original_url = Column(String, nullable=True)
    detection_date = Column(Date, default=date.today)
    status = Column(String, default=NewsStatus.IDENTIFIED.value)
    category = Column(String, nullable=True) # Nerd, Geek, Trend
    
    # Council Logic
    in_council = Column(Boolean, default=False)
    is_prioritized = Column(Boolean, default=False)
    editorial_focus = Column(Text, nullable=True)
    
    # AI Classifications stored as JSON for flexibility
    classifications = Column(JSON, nullable=True)
    
    # Foreign Keys
    postulator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    postulator = relationship("User", backref="posted_news", foreign_keys=[postulator_id])
    
    # Relationships
    votes = relationship("Vote", back_populates="news")
    assignees = relationship("User", secondary=news_assignments, backref="assigned_news")



# Council Session History
class CouncilSession(Base):
    __tablename__ = "council_sessions"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(Date, default=date.today)
    summary = Column(Text, nullable=True)

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    news_id = Column(Integer, ForeignKey("news.id"))
    
    # Voting Data
    impact_score = Column(Integer) # 1-5
    relevance_score = Column(Integer) # 1-5
    category_suggestion = Column(String, nullable=True) # "Coyuntural", "Semana", etc.
    
    # History Tracking
    is_active = Column(Boolean, default=True)
    session_id = Column(Integer, ForeignKey("council_sessions.id"), nullable=True)

    user = relationship("User")
    news = relationship("News", back_populates="votes")

class ProductType(str, enum.Enum):
    BOLETIN = "Boletín"
    CAPSULA = "Cápsula"
    ANALISIS = "Análisis"
    LINK = "Link"
    NOTA = "Nota"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("news.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    product_type = Column(String) # Uses ProductType values
    name = Column(String)
    description = Column(Text, nullable=True)
    
    # One of these should be populated based on type
    file_path = Column(String, nullable=True)
    url = Column(String, nullable=True)
    
    created_at = Column(Date, default=date.today)

    news = relationship("News", backref="products")
    user = relationship("User")

