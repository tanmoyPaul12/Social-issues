#!/usr/bin/env python3
"""
Test Script for IndicTrans2 local model.

Verifies local model loading, GPU/CPU device selection, and inference.

Usage:
  python scripts/test_indictrans2.py
"""
import os
import sys
import torch

MODEL_PATH = os.getenv("INDICTRANS_MODEL_PATH", "./models/indictrans2/indic-en")

print(f"Checking model path: {os.path.abspath(MODEL_PATH)}")

if not os.path.exists(MODEL_PATH) or not os.listdir(MODEL_PATH):
    print(f"[WARNING] Local model folder '{MODEL_PATH}' is empty or does not exist.")
    print("Run 'python scripts/setup_indictrans2.py' first to download model weights.")
    sys.exit(0)

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Selected inference device: {device}")

try:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    from IndicTransToolkit.processor import IndicProcessor

    print("Loading tokenizer from local disk...")
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_PATH,
        trust_remote_code=True,
        local_files_only=True
    )

    print("Loading model weights from local disk...")
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_PATH,
        trust_remote_code=True,
        local_files_only=True,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32
    )

    model.to(device)
    model.eval()
    print("✅ IndicTrans2 local model loaded successfully!")

    processor = IndicProcessor(inference=True)
    source_lang, target_lang = "hin_Deva", "eng_Latn"
    batch = processor.preprocess_batch(
        ["पानी की समस्या"], src_lang=source_lang, tgt_lang=target_lang
    )
    inputs = tokenizer(
        batch, truncation=True, padding="longest", return_tensors="pt",
        return_attention_mask=True,
    ).to(device)
    with torch.inference_mode():
        output = model.generate(**inputs, max_length=256, num_beams=5)
    decoded = tokenizer.batch_decode(output, skip_special_tokens=True)
    print("Translation:", processor.postprocess_batch(decoded, lang=target_lang)[0])
    print("✅ Local translation inference succeeded!")

except Exception as e:
    print(f"❌ Failed to load model: {e}")
    sys.exit(1)
