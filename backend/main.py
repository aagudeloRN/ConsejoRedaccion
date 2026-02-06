from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import users, news, votes, analytics, products

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Consejo de Redacción CTi API", version="0.1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(news.router)
app.include_router(votes.router)
app.include_router(analytics.router)
app.include_router(products.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Consejo de Redacción CTi API"}
