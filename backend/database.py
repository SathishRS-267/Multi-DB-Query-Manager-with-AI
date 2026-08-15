# from sqlalchemy import create_engine, Column, Integer, String
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker

# DATABASE_URL = "postgresql://postgres:user123@localhost/school"

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker, relationship
# from datetime import datetime
# import os

# # Database URL from environment variables
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:user123@localhost/sqleditor")

# # Create SQLAlchemy engine
# engine = create_engine(DATABASE_URL)

# # Create sessionmaker
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Create Base class
# Base = declarative_base()

# # Database dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # User model
# class User(Base):
#     __tablename__ = "users"
    
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String(50), unique=True, index=True, nullable=False)
#     email = Column(String(100), unique=True, index=True, nullable=False)
#     hashed_password = Column(String(100), nullable=False)
#     is_active = Column(Boolean, default=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     last_login = Column(DateTime, nullable=True)
#     reset_token = Column(String(255), nullable=True)
#     reset_token_expires = Column(DateTime, nullable=True)

# # Create all tables
# Base.metadata.create_all(bind=engine)

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Database configuration
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:user123@localhost/sqleditor")

# # SQLAlchemy setup
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# # Helper to get DB session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Create async engine
engine = create_async_engine(settings.DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Create declarative base
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    db = async_session()
    try:
        yield db
    finally:
        await db.close()

# Create all tables
async def create_tables():
    try:
        async with engine.begin() as conn:
            # Import models here to avoid circular imports
            from auth.models import User
            
            await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables created successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not create database tables: {e}")
        print("  The application will start but authentication features may not work until PostgreSQL is configured.")