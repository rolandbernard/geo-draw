
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn run() -> Result<(), JsValue> {
    console::log_1(&JsValue::from_str("Hello world!"));
    Ok(())
}

