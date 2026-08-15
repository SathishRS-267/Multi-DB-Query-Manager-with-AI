from pydantic_settings import BaseSettings
from datetime import timedelta
from typing import Optional
import secrets


class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:pwd@localhost/sqleditor"
    
    # Email settings (for password reset)
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = "sqlwizard123@gmail.com"
    EMAIL_PASSWORD: str = "eavt frhm iqxg pvnw"
    EMAIL_FROM: str = "sqlwizard123@gmail.com"
    
    # Frontend URL for reset link
    FRONTEND_URL: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" 


settings = Settings()