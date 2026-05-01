use super::common::make_response;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_schema(input: &str) -> JsValue {
    let input_text = input.trim();

    if input_text.is_empty() {
        return make_response(
            false,
            Some("Schema.org validation requires RDF input to be present".to_string()),
            None,
        );
    }

    make_response(
        false,
        Some("Schema.org validation is handled by the Rust WASM module, but parser support is not implemented yet".to_string()),
        None,
    )
}
