"""
Model Manager: Manages lazy loading, weight caching, and GPU/CPU memory allocation for ML models.
Prevents duplicate memory consumption when running in cloud server environments (AWS ECS / EC2).
"""
import os
from app.utils.logger import log
from app.utils.device import get_optimal_device

class ModelManager:
    """Singleton model lifecycle manager."""
    def __init__(self):
        self.device = get_optimal_device()
        self.cache_dir = os.getenv("MODEL_CACHE_DIR", "./models")
        log.info(f"ModelManager initialized on device '{self.device}' with cache dir '{self.cache_dir}'")

model_manager = ModelManager()
