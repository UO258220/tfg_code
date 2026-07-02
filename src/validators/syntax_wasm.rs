use super::common::{ValidationResponse, ValidationViolation};
use serde_wasm_bindgen::to_value;
use srdf::{RDFFormat, ReaderMode, SRDFGraph};
use wasm_bindgen::prelude::*;

pub fn validate_rdf_with_shacl(rdf: &str, shacl: &str) -> ValidationResponse {
    let rdf_trimmed = rdf.trim();
    let shacl_trimmed = shacl.trim();

    if rdf_trimmed.is_empty() {
        return ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new(
                "RDF input cannot be empty",
                Some("rdf"),
            )]),
        );
    }

    if shacl_trimmed.is_empty() {
        return ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new(
                "SHACL shapes input cannot be empty",
                Some("shacl"),
            )]),
        );
    }

    match SRDFGraph::from_str(rdf_trimmed, &RDFFormat::Turtle, None, &ReaderMode::Strict) {
        Err(error) => ValidationResponse::failure(
            Some("RDF Turtle parse error"),
            Some(vec![ValidationViolation::new(
                &format!("RDF parse error: {error}"),
                Some("rdf"),
            )]),
        ),
        Ok(_) => {
            match SRDFGraph::from_str(shacl_trimmed, &RDFFormat::Turtle, None, &ReaderMode::Strict)
            {
                Err(error) => ValidationResponse::failure(
                    Some("SHACL Turtle parse error"),
                    Some(vec![ValidationViolation::new(
                        &format!("SHACL shapes parse error: {error}"),
                        Some("shacl"),
                    )]),
                ),
                Ok(_) => ValidationResponse::success(Some(
                    "RDF and SHACL inputs are syntactically valid",
                )),
            }
        }
    }
}

#[wasm_bindgen(js_name = validate_rdf_with_shacl)]
pub fn validate_rdf_with_shacl_js(rdf_input: &str, shacl_shapes: &str) -> JsValue {
    let response = validate_rdf_with_shacl(rdf_input, shacl_shapes);
    to_value(&response).unwrap()
}
