"""
Logger Utility: Configures structured logging across the AI Microservice.
Supports loguru if installed or Python standard library logging.
"""
import sys
import logging

try:
    from loguru import logger

    def setup_logger(debug: bool = False):
        logger.remove()
        log_level = "DEBUG" if debug else "INFO"
        logger.add(
            sys.stdout,
            level=log_level,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:10}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            colorize=True,
        )
        return logger

    log = setup_logger()
except ImportError:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    log = logging.getLogger("ai_service")
    logger = log
