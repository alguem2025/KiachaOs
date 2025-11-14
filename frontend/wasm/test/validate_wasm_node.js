// Node.js headless validation for hello_kiacha WASM
// Loads the emscripten-generated JS glue and verifies exported functions
const path = require('path');

async function run() {
  const jsPath = path.resolve('frontend/public/wasm/hello_kiacha.js');
  try {
    const ModuleFactory = require(jsPath);
    const Module = await Promise.resolve(ModuleFactory());

    // Call exported add function
    const sum = Module._add(7, 8);
    if (sum !== 15) {
      console.error('add() returned', sum);
      process.exit(2);
    }

    // Call greet and convert pointer to string using Emscripten helper
    const ptr = Module._greet();
    const greet = Module.UTF8ToString(ptr);
    if (!greet || !greet.includes('Hello')) {
      console.error('greet() returned unexpected value:', greet);
      process.exit(3);
    }

    console.log('WASM validation passed:', { sum, greet });
    process.exit(0);
  } catch (err) {
    console.error('WASM validation failed:', err);
    process.exit(1);
  }
}

run();
