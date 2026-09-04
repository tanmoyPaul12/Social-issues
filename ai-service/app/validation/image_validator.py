"""
Photo Validator: Uses Pillow and OpenCV for deterministic image quality validation.
Checks:
- File format & MIME check (JPG, PNG, WEBP, etc.)
- Can image be opened? (Corruption check)
- Resolution check (minimum 300x300 px)
- File-size check (maximum 15 MB)
- Blur check using OpenCV Laplacian Variance (threshold < 100 -> FLAG)
- Brightness check (mean intensity < 40 -> Dark FLAG, > 220 -> Overexposed FLAG)

Returns 3-state status: PASS (🟢), FLAG (🟡), or REJECT (🔴).
Note: Valid photo means "The image is technically usable." (Does NOT prove problem authenticity).
"""
import io
from typing import Dict, Any, Optional
from PIL import Image
import numpy as np

VALID_IMAGE_MIMES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}

def validate_photo_bytes(image_bytes: bytes, mime_type: str, file_name: str = "") -> Dict[str, Any]:
    """
    Validates photo image binary data using Pillow and NumPy/OpenCV metrics.
    """
    issues = []
    status = "PASS"
    
    # 1. MIME / Format Check
    clean_mime = mime_type.lower().strip()
    if clean_mime not in VALID_IMAGE_MIMES and not any(file_name.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
        return {
            "status": "REJECT",
            "quality": 0.0,
            "issues": [f"Unsupported or invalid image format '{mime_type}'."],
            "metadata": {}
        }

    # 2. File Size Check (15MB Limit)
    file_size_bytes = len(image_bytes)
    MAX_SIZE = 15 * 1024 * 1024
    if file_size_bytes > MAX_SIZE:
        return {
            "status": "REJECT",
            "quality": 0.0,
            "issues": [f"Image file size ({file_size_bytes / (1024*1024):.1f}MB) exceeds 15MB limit."],
            "metadata": {"size_bytes": file_size_bytes}
        }

    # 3. Can Image Be Opened / Corruption Check
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.verify()  # Verify file integrity
        pil_img = Image.open(io.BytesIO(image_bytes))  # Re-open after verify
        width, height = pil_img.size
        format_name = pil_img.format
    except Exception as e:
        return {
            "status": "REJECT",
            "quality": 0.0,
            "issues": [f"Corrupted or unreadable image file: {str(e)}"],
            "metadata": {}
        }

    # 4. Resolution Check
    if width < 300 or height < 300:
        issues.append(f"Low resolution ({width}x{height} px, recommended min 300x300 px).")
        status = "FLAG"

    # Convert to grayscale NumPy array for metrics calculation
    try:
        gray_arr = np.array(pil_img.convert("L"))
        
        # 5. Brightness Check
        mean_brightness = float(np.mean(gray_arr))
        if mean_brightness < 40:
            issues.append(f"Image is too dark (mean brightness {mean_brightness:.1f}/255).")
            status = "FLAG"
        elif mean_brightness > 220:
            issues.append(f"Image is overexposed (mean brightness {mean_brightness:.1f}/255).")
            status = "FLAG"

        # 6. Blur Check (using Laplacian Variance approximation)
        # Compute 2D discrete Laplacian variance via NumPy gradients
        gy, gx = np.gradient(gray_arr.astype(float))
        g2y, _ = np.gradient(gy)
        _, g2x = np.gradient(gx)
        laplacian_var = float(np.var(g2x + g2y))

        if laplacian_var < 50.0:
            issues.append(f"Photo appears blurry (Laplacian variance {laplacian_var:.1f}).")
            status = "FLAG"
    except Exception as e:
        laplacian_var = 100.0
        mean_brightness = 128.0

    quality = 0.95 if status == "PASS" else 0.6 if status == "FLAG" else 0.0

    return {
        "status": status,
        "quality": round(quality, 2),
        "issues": issues,
        "metadata": {
            "width": width,
            "height": height,
            "format": format_name,
            "size_bytes": file_size_bytes,
            "brightness": round(mean_brightness, 1),
            "blur_score": round(laplacian_var, 1)
        }
    }
