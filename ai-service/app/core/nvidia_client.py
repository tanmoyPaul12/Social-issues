#!/usr/bin/env python3
"""
NVIDIA NIM & Multimodal Vision Client (`app/core/nvidia_client.py`).

Provides helper functions for NVIDIA NIM API endpoint (`https://integrate.api.nvidia.com/v1`),
multimodal image base64 payload preparation, and 1-minute video keyframe extraction.
"""

import os
import io
import json
import base64
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)


def get_nvidia_client() -> Optional[OpenAI]:
    """Returns OpenAI client configured for NVIDIA NIM API endpoint if available."""
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key or api_key.startswith("nvapi-placeholder") or len(api_key) < 15:
        return None
    
    return OpenAI(
        api_key=api_key,
        base_url="https://integrate.api.nvidia.com/v1",
        timeout=4.0,
        max_retries=1
    )


def extract_video_keyframes(video_bytes_or_path: str, max_frames: int = 5) -> List[str]:
    """
    Extracts representative keyframes from a 1-minute video file or URL.
    Returns a list of base64-encoded JPEG strings.
    """
    try:
        import cv2
        keyframes = []

        cap = cv2.VideoCapture(video_bytes_or_path)
        if not cap.isOpened():
            logger.warning(f"Could not open video source {video_bytes_or_path} for keyframe extraction.")
            return []

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            total_frames = 300  # Default estimate for 10s video at 30fps

        step = max(1, total_frames // max_frames)

        for i in range(0, total_frames, step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                # Resize frame to standard 512x512 for optimal vision LLM token efficiency
                resized = cv2.resize(frame, (512, 512))
                _, buffer = cv2.imencode('.jpg', resized)
                b64 = base64.b64encode(buffer).decode('utf-8')
                keyframes.append(b64)
                if len(keyframes) >= max_frames:
                    break

        cap.release()
        logger.info(f"Successfully extracted {len(keyframes)} keyframes from video.")
        return keyframes

    except ImportError:
        logger.warning("OpenCV (cv2) not installed. Skipping local video frame extraction.")
        return []
    except Exception as e:
        logger.error(f"Error extracting video keyframes: {e}")
        return []


def query_multimodal_llm(
    system_prompt: str,
    user_prompt: str,
    image_b64_list: Optional[List[str]] = None,
    json_mode: bool = True
) -> str:
    """
    Executes a multimodal vision completion call using NVIDIA NIM or Groq API (`openai/gpt-oss-120b`).
    """
    nvidia_client = get_nvidia_client()
    
    if nvidia_client and image_b64_list:
        model_name = os.getenv("NVIDIA_VISION_MODEL", "meta/llama-3.2-90b-vision-instruct")
        content_payload = [{"type": "text", "text": user_prompt}]
        for b64_img in image_b64_list[:4]:
            content_payload.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}
            })

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content_payload}
        ]
        try:
            response = nvidia_client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"} if json_mode else None
            )
            return (response.choices[0].message.content or "").strip()
        except Exception as e:
            logger.warning(f"NVIDIA NIM Vision call failed ({e}), falling back to Groq API...")

    # Fast fallback to Groq API (openai/gpt-oss-120b)
    from app.core.llm_factory import query_llm
    return query_llm(system_prompt, user_prompt, json_mode=json_mode)
