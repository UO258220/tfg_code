use super::common::{ValidationResponse, ValidationViolation};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use srdf::{RDFFormat, ReaderMode, SRDFGraph};

#[wasm_bindgen]
pub fn validate_shacl(input: &str) -> JsValue {
    let input_text = input.trim();

    if input_text.is_empty() {
        let response = ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new("SHACL shapes input cannot be empty", Some("root"))]),
        );
        return to_value(&response).unwrap();
    }

    // Parse the SHACL shapes with rudof RDF parser
    match SRDFGraph::from_str(input_text, &RDFFormat::Turtle, None, &ReaderMode::Strict) {
        Ok(_) => {
            let response = ValidationResponse::success(Some("SHACL shapes are syntactically valid"));
            to_value(&response).unwrap()
        }
        Err(error) => {
            let response = ValidationResponse::failure(
                None,
                Some(vec![ValidationViolation::new(
                    &format!("SHACL parsing error: {}", error),
                    Some("shacl"),
                )]),
            );
            to_value(&response).unwrap()
        }
    }
}