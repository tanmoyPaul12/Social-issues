#!/usr/bin/env sh
set -eu

base_url="${AI_SERVICE_URL:-http://localhost:8000}"

echo "Checking service health..."
curl --fail --silent "$base_url/health"
echo

echo "Checking Hindi -> English translation..."
curl --fail --silent --show-error \
  -X POST "$base_url/api/v1/preprocessing/text" \
  -H 'Content-Type: application/json' \
  -d '{"title":"पानी की समस्या","description":"हमारे गांव में पानी की समस्या है।"}'
echo

