from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

engine = create_async_engine(settings.DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

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