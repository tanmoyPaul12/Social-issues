"""
Device Utility: Auto-detects optimal hardware accelerator (NVIDIA CUDA GPU, Apple MPS, or CPU).
Ensures high-performance inference with safe CPU fallback.
"""
from app.utils.logger import log

def get_optimal_device() -> str:
    """
    Returns 'cuda' if GPU is present, 'mps' if Apple Silicon GPU is present, or fallback 'cpu'.
    """
    try:
        import torch
        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            log.info(f"NVIDIA CUDA GPU detected: {device_name}")
            return "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            log.info("Apple Silicon MPS GPU detected")
            return "mps"
    except ImportError:
        pass

    log.info("No GPU hardware acceleration detected. Running on CPU.")
    return "cpu"
