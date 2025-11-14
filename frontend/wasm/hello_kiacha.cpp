#include <emscripten/emscripten.h>
#include <string>

extern "C" {

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
    return a + b;
}

EMSCRIPTEN_KEEPALIVE
const char* greet() {
    static std::string s = "Hello Kiacha from WASM (C++)";
    return s.c_str();
}

}
