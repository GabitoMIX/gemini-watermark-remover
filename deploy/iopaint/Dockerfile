FROM python:3.10-slim-bookworm

ARG IOPAINT_VERSION=1.5.3

ENV PYTHONUNBUFFERED=1 \
  PIP_NO_CACHE_DIR=1 \
  HF_HOME=/data/huggingface \
  TRANSFORMERS_CACHE=/data/huggingface \
  XDG_CACHE_HOME=/data/cache

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    ffmpeg \
    git \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    libxrender1 \
  && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip setuptools wheel \
  && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu \
  && pip install "IOPaint==${IOPAINT_VERSION}"

EXPOSE 8080

