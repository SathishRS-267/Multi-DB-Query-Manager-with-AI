import os
import secrets
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

# Build default database URL from management DB env variables if not set
db_user = os.getenv("MGMT_DB_USER", "postgres")
db_pass = os.getenv("MGMT_DB_PASSWORD", "")
db_host = os.getenv("MGMT_DB_HOST", "localhost")
db_port = os.getenv("MGMT_DB_PORT", "5432")
db_name = os.getenv("MGMT_DB_NAME", "multi-db-query-manager")

default_db_url = f"postgresql+asyncpg://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}" if db_pass else f"postgresql+asyncpg://{db_user}@{db_host}:{db_port}/{db_name}"

class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db_url)
    
    # Email settings (for password reset)
    EMAIL_HOST: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    EMAIL_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("SMTP_FROM", os.getenv("SMTP_USERNAME", ""))
    
    # Frontend URL for reset link
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" 


settings = Settings()
