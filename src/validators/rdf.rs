use super::common::{count_close_tags, count_open_tags, make_response, make_violation};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_rdf_syntax(input: &str) -> JsValue {
    let input_text = input.trim();

    if input_text.is_empty() {
        return make_response(
            false,
            None,
            Some(vec![make_violation("RDF input cannot be empty", Some("root"))]),
        );
    }

    let mut violations = Vec::new();
    let has_rdf_structure = (input_text.contains('<') && input_text.contains('>'))
        || input_text.contains("@prefix")
        || input_text.contains("rdf:")
        || input_text.contains("owl:")
        || input_text.contains("rdfs:");

    if !has_rdf_structure {
        violations.push(make_violation(
            "Input does not appear to be valid RDF data. Please check the format.",
            Some("root"),
        ));
    }

    let open_tags = count_open_tags(input_text);
    let close_tags = count_close_tags(input_text);

    if open_tags != close_tags && input_text.contains('<') {
        violations.push(make_violation("Possible unclosed XML tags detected", Some("structure")));
    }

    if input_text.contains("rdf:") && !input_text.contains("@prefix rdf:") {
        violations.push(make_violation("RDF prefix not declared", Some("prefixes")));
    }

    if violations.is_empty() {
        make_response(true, Some("RDF data appears to be syntactically valid".to_string()), None)
    } else {
        make_response(false, None, Some(violations))
    }
}
