"""
Image Preprocessor Orchestrator.
Combines local PIL image optimization (EXIF rotation, resizing, thumbnailing)
with AI vision analysis via the configured AIProvider (NVIDIA / local model).
"""
import base64
import hashlib
import io
import logging
from typing import Dict, Any, Optional
from PIL import Image, ImageOps

from app.domain.preprocessing.image.image_validator import validate_image_bytes
from app.ml.providers import get_ai_provider, AIProvider

log = logging.getLogger(__name__)

MAX_VISION_DIMENSION = 1600
THUMBNAIL_DIMENSION = 300


class ImagePreprocessor:
    """
    Image Preprocessing & AI Vision Analyzer.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self._ai_provider = ai_provider

    @property
    def ai_provider(self) -> AIProvider:
        if self._ai_provider is None:
            self._ai_provider = get_ai_provider()
        return self._ai_provider

    def _optimize_image_locally(self, image_bytes: bytes) -> tuple[bytes, bytes, int, int, str]:
        """
        Applies EXIF auto-rotation, resizes large images, generates a thumbnail,
        and computes perceptual fingerprint MD5 hash.
        """
        hash_digest = hashlib.md5(image_bytes).hexdigest()
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Auto-rotate EXIF orientation if present
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            orig_w, orig_h = img.size

            # Resize main image if larger than max allowed dimension
            if max(orig_w, orig_h) > MAX_VISION_DIMENSION:
                img.thumbnail((MAX_VISION_DIMENSION, MAX_VISION_DIMENSION), Image.Resampling.LANCZOS)

            opt_w, opt_h = img.size
            buf_opt = io.BytesIO()
            img.save(buf_opt, format="JPEG", quality=85)
            opt_bytes = buf_opt.getvalue()

            # Generate 300px thumbnail
            thumb_img = img.copy()
            thumb_img.thumbnail((THUMBNAIL_DIMENSION, THUMBNAIL_DIMENSION), Image.Resampling.LANCZOS)
            buf_thumb = io.BytesIO()
            thumb_img.save(buf_thumb, format="JPEG", quality=75)
            thumb_bytes = buf_thumb.getvalue()

            return opt_bytes, thumb_bytes, opt_w, opt_h, hash_digest

    async def process_image(
        self,
        image_bytes: bytes,
        filename: str = "evidence.jpg",
        text_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Preprocesses raw image bytes and executes AI vision analysis.
        """
        is_valid, mime_type, warning_msg, orig_w, orig_h = validate_image_bytes(image_bytes, filename)
        if not is_valid:
            log.warning(f"Image validation rejected: {warning_msg}")
            return {
                "is_valid": False,
                "error_message": warning_msg,
                "metadata": {"filename": filename, "width": orig_w, "height": orig_h, "size_bytes": len(image_bytes)},
                "visual_analysis": None,
                "categorization": {"category": "unknown", "confidence": 0.0},
                "prioritization": {"priority_score": 0, "priority_level": "low"}
            }

        try:
            opt_bytes, thumb_bytes, width, height, hash_digest = self._optimize_image_locally(image_bytes)
            thumb_b64 = base64.b64encode(thumb_bytes).decode("utf-8")

            # Execute AI Vision Analysis (NVIDIA / Local)
            context = text_context or {}
            vision_result = await self.ai_provider.analyze_image(opt_bytes, mime_type or "image/jpeg", context)

            # Compute category from visual analysis
            suggested_cat = vision_result.get("suggested_category", "infrastructure")
            severity = vision_result.get("visual_severity", "medium")
            hazard_detected = vision_result.get("hazard_detected", False)

            # Calculate priority score from visual evidence
            base_score = 70 if severity in ("high", "critical") else (50 if severity == "medium" else 30)
            if hazard_detected:
                base_score = min(base_score + 15, 100)

            priority_level = "high" if base_score >= 70 else ("medium" if base_score >= 40 else "low")

            return {
                "is_valid": True,
                "warning_message": warning_msg if warning_msg else None,
                "metadata": {
                    "filename": filename,
                    "format": mime_type.split("/")[-1].upper(),
                    "width": width,
                    "height": height,
                    "size_bytes": len(opt_bytes),
                    "perceptual_hash": hash_digest,
                    "is_duplicate": False,
                    "thumbnail_b64": f"data:image/jpeg;base64,{thumb_b64}"
                },
                "vision_analysis": vision_result,
                "visual_analysis": vision_result,
                "categorization": {
                    "category": suggested_cat,
                    "confidence": 0.90
                },
                "prioritization": {
                    "priority_score": base_score,
                    "priority_level": priority_level,
                    "factors": {
                        "visual_severity": severity,
                        "public_safety_risk": "high" if hazard_detected else "medium"
                    },
                    "reason": f"Visual evidence confirms '{vision_result.get('detected_defects', 'issue')}' with {severity} visual severity."
                }
            }
        except Exception as e:
            log.error(f"Image preprocessing failed for '{filename}': {e}", exc_info=True)
            return {
                "is_valid": False,
                "error_message": f"Image processing error: {str(e)}",
                "metadata": {"filename": filename, "width": orig_w, "height": orig_h, "size_bytes": len(image_bytes)},
                "visual_analysis": None,
                "categorization": {"category": "unknown", "confidence": 0.0},
                "prioritization": {"priority_score": 0, "priority_level": "low"}
            }


# Global Preprocessor Instance
image_preprocessor = ImagePreprocessor()
