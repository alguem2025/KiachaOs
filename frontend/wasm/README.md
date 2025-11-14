# Hello Kiacha - WASM (C++) Example

This example demonstrates compiling a tiny C++ module to WebAssembly with Emscripten and loading it from JavaScript. It mirrors the pattern used by projects like `whisper.cpp` and `llama.cpp` when targeting WASM.

Files:
- `hello_kiacha.cpp` - simple C++ exported functions `add` and `greet`.

Requirements:
- Emscripten SDK installed and activated (https://emscripten.org/docs/getting_started/downloads.html)
- `emcc` on PATH after activating emsdk

Quick build (from repository root):

```bash
# Recommended: run in WSL/Ubuntu (bash). From Windows PowerShell you can run WSL and then the commands below.
cd "/mnt/c/Users/Vitorio/Kiacha OS"
bash scripts/build-wasm.sh
```

If `emcc` is not on PATH the script will try to source a local `emsdk_env.sh` from common locations (for example `~/emsdk/emsdk_env.sh`). If that fails, install emsdk in WSL/Ubuntu with these commands:

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
# then from project root:
bash scripts/build-wasm.sh
```

This will generate `frontend/public/wasm/hello_kiacha.js` and `hello_kiacha.wasm`.

Example usage (in browser console or small HTML loader):

```html
<script src="/wasm/hello_kiacha.js"></script>
<script>
Module.onRuntimeInitialized = () => {
  const res = Module._add(3, 4); // call exported C function
  console.log('3 + 4 =', res);

  const greetPtr = Module._greet();
  const greet = Module.UTF8ToString(greetPtr);
  console.log(greet);
};
</script>
```

Notes:
- The build script uses `emcc` flags to produce a modular JavaScript glue file and a separate wasm binary.
- You can adapt build flags in `scripts/build-wasm.sh` for optimization levels (`-O3 -s ALLOW_MEMORY_GROWTH=1`, etc.)
