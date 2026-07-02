use super::common::{ValidationResponse, ValidationViolation};
use serde_wasm_bindgen::to_value;
use srdf::{RDFFormat, ReaderMode, SRDFGraph};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_rdf_syntax(input: &str) -> JsValue {
    let input_text = input.trim();

    if input_text.is_empty() {
        let response = ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new(
                "RDF input cannot be empty",
                Some("root"),
            )]),
        );
        return to_value(&response).unwrap();
    }

    match SRDFGraph::from_str(input_text, &RDFFormat::Turtle, None, &ReaderMode::Strict) {
        Ok(_) => {
            let response = ValidationResponse::success(Some("RDF data is syntactically valid"));
            to_value(&response).unwrap()
        }
        Err(error) => {
            let response = ValidationResponse::failure(
                None,
                Some(vec![ValidationViolation::new(
                    &format!("RDF syntax error: {}", error),
                    Some("syntax"),
                )]),
            );
            to_value(&response).unwrap()
        }
    }
}
