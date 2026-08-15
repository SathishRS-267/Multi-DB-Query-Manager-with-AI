

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router
from database import create_tables
from database_router import router as db_router
from dotenv import load_dotenv
import os
import logging
from chat_router import router as chat_router
from query_handler import router as query_router
from mongodb_handler import mongo_router
from contextlib import asynccontextmanager
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    logger.warning("OPENAI_API_KEY environment variable not set. The application may not function correctly.")

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await create_tables()
    except Exception as e:
        logger.warning(f"Database initialization skipped: {e}")
    logger.info("Server started and WebSocket endpoint registered at /ws/chat")
    yield
    # Shutdown
    logger.info("Server shutting down")

app = FastAPI(title="SQL Wizard API", lifespan=lifespan)

# IMPORTANT: Configure CORS - allow your frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - make sure chat_router is included properly
app.include_router(chat_router, tags=["chat"])
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(db_router, tags=["database"])
app.include_router(query_router)
app.include_router(mongo_router)  # Add MongoDB router
# Add debug endpoint for WebSocket testing
@app.get("/ws_status")
async def ws_status():
    return {"status": "WebSocket endpoint should be available at /ws/chat"}

@app.get("/")
async def root():
    return {"message": "API is running with WebSocket support"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server on port 8080 with WebSocket support")
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)