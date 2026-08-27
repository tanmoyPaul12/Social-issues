import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Societal Innovation AI Service",
    description="Microservice engine for Voice Transcription, Semantic Deduplication, Thematic Classification, and HEI Matchmaking.",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "database_host": os.getenv("DB_HOST", "not-configured")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
