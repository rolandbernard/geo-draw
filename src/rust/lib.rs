
use wasm_bindgen::prelude::*;
// use web_sys::console;

mod earcut;

#[wasm_bindgen]
pub fn sum(a: i32, b: i32) -> i32 {
    return a + b;
}

