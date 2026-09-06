#!/usr/bin/env python3
"""
Setup & Download Script for IndicTrans2 local model.

Downloads `ai4bharat/indictrans2-indic-en-dist-200M` from HuggingFace
into the configured local folder (`./models/indictrans2/indic-en`).

Usage:
  python scripts/setup_indictrans2.py
"""
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger(__name__)

MODEL_REPO = "ai4bharat/indictrans2-indic-en-dist-200M"
DEFAULT_LOCAL_DIR = "./models/indictrans2/indic-en"


def download_model(target_dir: str = DEFAULT_LOCAL_DIR):
    """Downloads model weights and tokenizer from HuggingFace into local_dir."""
    target_path = os.path.abspath(target_dir)
    os.makedirs(target_path, exist_ok=True)
    log.info(f"Target local model directory: {target_path}")

    try:
        from huggingface_hub import snapshot_download
        log.info(f"Starting download of '{MODEL_REPO}'...")
        snapshot_download(
            repo_id=MODEL_REPO,
            local_dir=target_path,
            local_dir_use_symlinks=False
        )
        log.info(f"Successfully downloaded IndicTrans2 model to '{target_path}'.")
    except Exception as e:
        log.error(f"Failed to download model via huggingface_hub: {e}")
        log.info("Please ensure you accepted model terms on HuggingFace and ran 'huggingface-cli login'.")
        sys.exit(1)


if __name__ == "__main__":
    dir_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_LOCAL_DIR
    download_model(dir_arg)
