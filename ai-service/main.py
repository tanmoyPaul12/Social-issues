"""
Societal Innovation AI Service Root Entrypoint.
Re-exports the production FastAPI application instance from app.main.
"""
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from app.main import app

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
