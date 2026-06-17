use super::common::validate_rdf_with_shacl as validate_rdf_with_shacl_native;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_rdf_with_shacl(rdf_input: &str, shacl_shapes: &str) -> JsValue {
    let response = validate_rdf_with_shacl_native(rdf_input, shacl_shapes);
    to_value(&response).unwrap()
}
