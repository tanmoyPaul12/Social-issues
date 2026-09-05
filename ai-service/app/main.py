"""
FastAPI Application Entrypoint: Configures FastAPI application instance, CORS policy,
route routers, and global exception handlers for the AI Microservice.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, analyze, categorization, prioritization, deduplication, routing, validation, preprocess, intelligence
from app.utils.logger import log

app = FastAPI(
    title="Societal Innovation AI Microservice",
    description="Production AI Microservice for Grassroots Challenge Validation, Preprocessing, Categorization, Prioritization, Vector Deduplication, and HEI University Routing in Jharkhand.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(preprocess.router, prefix="/api/v1")
app.include_router(intelligence.router, prefix="/api/v1")
app.include_router(validation.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(categorization.router, prefix="/api/v1")
app.include_router(prioritization.router, prefix="/api/v1")
app.include_router(deduplication.router, prefix="/api/v1")
app.include_router(routing.router, prefix="/api/v1")

@app.on_event("startup")
def on_startup():
    log.info("Societal Innovation AI Microservice initialized and ready for requests.")

@app.on_event("shutdown")
def on_shutdown():
    log.info("Societal Innovation AI Microservice shutting down.")
