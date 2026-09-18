#!/usr/bin/env python3
"""
LLM Factory Module for Groq API (openai/gpt-oss-120b) and Fallback LLM Providers.

Provides standard helper functions for LLM chat completion and structured JSON extraction.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)


def get_groq_client() -> OpenAI:
    """Returns an OpenAI client configured for Groq API endpoint."""
    api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY or GROK_API_KEY is not set in environment variables.")
    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )


def query_llm(system_prompt: str, user_prompt: str, json_mode: bool = True, model_name: Optional[str] = None) -> str:
    """
    Executes a chat completion call to openai/gpt-oss-120b via Groq API.
    
    Args:
        system_prompt: System prompt defining role and constraints.
        user_prompt: User input prompt.
        json_mode: If True, forces JSON response format.
        model_name: Optional model override (defaults to openai/gpt-oss-120b).
    """
    client = get_groq_client()
    selected_model = model_name or os.getenv("LLM_MODEL", "openai/gpt-oss-120b")

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    kwargs: Dict[str, Any] = {
        "model": selected_model,
        "messages": messages,
        "temperature": 0.1
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content or ""
        return content.strip()
    except Exception as e:
        logger.error(f"Error executing Groq API LLM query ({selected_model}): {e}")
        raise e


def query_llm_json(system_prompt: str, user_prompt: str, model_name: Optional[str] = None) -> Dict[str, Any]:
    """Helper that queries LLM in JSON mode and parses the response into a Python dictionary."""
    raw_json = query_llm(system_prompt, user_prompt, json_mode=True, model_name=model_name)
    try:
        return json.loads(raw_json)
    except json.JSONDecodeError as err:
        logger.error(f"Failed to parse LLM JSON response: {raw_json}")
        raise ValueError(f"Invalid JSON returned by LLM: {err}")
