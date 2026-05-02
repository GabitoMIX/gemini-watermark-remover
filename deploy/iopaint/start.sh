#!/usr/bin/env sh
set -eu

enabled() {
  case "${1:-1}" in
    1|true|TRUE|yes|YES|on|ON) return 0 ;;
    *) return 1 ;;
  esac
}

set -- iopaint start \
  --model="${IOPAINT_MODEL:-lama}" \
  --device="${IOPAINT_DEVICE:-cpu}" \
  --host=0.0.0.0 \
  --port=8080 \
  --model-dir=/data/models \
  --low-mem \
  --no-half

if enabled "${IOPAINT_ENABLE_INTERACTIVE_SEG:-1}"; then
  set -- "$@" \
    --enable-interactive-seg \
    --interactive-seg-model="${IOPAINT_INTERACTIVE_SEG_MODEL:-mobile_sam}" \
    --interactive-seg-device="${IOPAINT_INTERACTIVE_SEG_DEVICE:-cpu}"
fi

if enabled "${IOPAINT_ENABLE_REMOVE_BG:-1}"; then
  set -- "$@" \
    --enable-remove-bg \
    --remove-bg-model="${IOPAINT_REMOVE_BG_MODEL:-briaai/RMBG-1.4}" \
    --remove-bg-device="${IOPAINT_REMOVE_BG_DEVICE:-cpu}"
fi

if enabled "${IOPAINT_ENABLE_ANIME_SEG:-1}"; then
  set -- "$@" --enable-anime-seg
fi

if enabled "${IOPAINT_ENABLE_REALESRGAN:-1}"; then
  set -- "$@" \
    --enable-realesrgan \
    --realesrgan-device="${IOPAINT_REALESRGAN_DEVICE:-cpu}" \
    --realesrgan-model="${IOPAINT_REALESRGAN_MODEL:-realesr-general-x4v3}"
fi

if enabled "${IOPAINT_ENABLE_GFPGAN:-1}"; then
  set -- "$@" \
    --enable-gfpgan \
    --gfpgan-device="${IOPAINT_GFPGAN_DEVICE:-cpu}"
fi

if enabled "${IOPAINT_ENABLE_RESTOREFORMER:-1}"; then
  set -- "$@" \
    --enable-restoreformer \
    --restoreformer-device="${IOPAINT_RESTOREFORMER_DEVICE:-cpu}"
fi

exec "$@"
