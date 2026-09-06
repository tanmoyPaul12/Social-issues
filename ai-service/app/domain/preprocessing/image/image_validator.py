"""
Lenient Citizen-Friendly Image Validation Sub-Module.
Validates uploaded evidence images leniently to ensure grassroots citizens in rural
areas are never blocked due to low-end camera phones or slight blurriness.
"""
import io
import logging
from typing import Tuple, Dict, Any
from PIL import Image

log = logging.getLogger(__name__)

MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB max limit
MIN_DIMENSION_PX = 30  # Lenient lower limit (30x30 px) to support basic feature phones


def validate_image_bytes(image_bytes: bytes, filename: str = "evidence.jpg") -> Tuple[bool, str, str, int, int]:
    """
    Validates raw image bytes leniently.
    Returns (is_valid, mime_type, warning_or_error_message, width, height).
    """
    if not image_bytes:
        return False, "", "Image file is empty. Please attach a valid photo.", 0, 0

    size = len(image_bytes)
    if size > MAX_IMAGE_SIZE_BYTES:
        return False, "", f"Image file ({size / 1024 / 1024:.1f}MB) exceeds maximum allowed 25MB size limit.", 0, 0

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            width, height = img.size
            img_format = (img.format or "JPEG").upper()

            if img_format in ("JPEG", "JPG"):
                mime_type = "image/jpeg"
            elif img_format == "PNG":
                mime_type = "image/png"
            elif img_format == "WEBP":
                mime_type = "image/webp"
            elif img_format in ("HEIC", "HEIF"):
                mime_type = "image/heic"
            else:
                mime_type = f"image/{img_format.lower()}"

            if width < MIN_DIMENSION_PX or height < MIN_DIMENSION_PX:
                return False, "", f"Image resolution ({width}x{height}px) is too small to inspect.", width, height

            warning_msg = ""
            if width < 150 or height < 150:
                warning_msg = "low_resolution_warning"

            return True, mime_type, warning_msg, width, height

    except Exception as e:
        log.warning(f"Lenient image inspection warning for '{filename}': {e}")
        return False, "", f"Corrupted or unsupported image file format: {str(e)}", 0, 0
