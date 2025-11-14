#!/usr/bin/env bash
set -euo pipefail

# Build the example C++ -> WASM using Emscripten
# Outputs to frontend/public/wasm/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WASM_SRC="$PROJECT_ROOT/frontend/wasm/hello_kiacha.cpp"
OUT_DIR="$PROJECT_ROOT/frontend/public/wasm"

mkdir -p "$OUT_DIR"

echo "Checking for Emscripten (emcc) in PATH..."
if ! command -v emcc >/dev/null 2>&1; then
  echo "emcc not found on PATH. Attempting to locate common emsdk installations..."
  # Try common places
  POSSIBLE="${HOME}/emsdk ${HOME}/.emsdk /opt/emsdk ${PROJECT_ROOT}/emsdk"
  SOURCED=false
  for d in $POSSIBLE; do
    if [ -f "$d/emsdk_env.sh" ]; then
      echo "Sourcing emsdk environment from: $d/emsdk_env.sh"
      # shellcheck source=/dev/null
      source "$d/emsdk_env.sh"
      SOURCED=true
      break
    fi
  done
  if ! $SOURCED; then
    echo "" >&2
    echo "ERROR: emcc not found and no emsdk env sourced." >&2
    echo "Install Emscripten SDK (emsdk) and activate it. Quick steps for WSL/Ubuntu:" >&2
    echo "  git clone https://github.com/emscripten-core/emsdk.git" >&2
    echo "  cd emsdk" >&2
    echo "  ./emsdk install latest" >&2
    echo "  ./emsdk activate latest" >&2
    echo "  source ./emsdk_env.sh" >&2
    echo "Then run: bash scripts/build-wasm.sh from the project root." >&2
    exit 1
  fi
fi

echo "Building Hello Kiacha WASM..."

emcc "$WASM_SRC" \
  -O3 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=Module \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS='["_add","_greet"]' \
  -o "$OUT_DIR/hello_kiacha.js"

echo "WASM build finished. Files written to $OUT_DIR"
ls -la "$OUT_DIR"

echo "To test: serve frontend via dev server (vite) and open a page that loads /wasm/hello_kiacha.js"
