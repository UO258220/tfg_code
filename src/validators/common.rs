use serde::Serialize;
#[cfg(not(target_family = "wasm"))]
use shacl::validator::processor::{GraphValidation, ShaclProcessor};
#[cfg(not(target_family = "wasm"))]
use shacl::validator::store::{Graph as ShaclGraph, ShaclDataManager};
#[cfg(not(target_family = "wasm"))]
use shacl::validator::ShaclValidationMode;
#[cfg(not(target_family = "wasm"))]
use rudof_rdf::rdf_core::{BuildRDF, RDFFormat as RudofRdfFormat};
#[cfg(not(target_family = "wasm"))]
use rudof_rdf::rdf_impl::{OxigraphInMemory, OxigraphInMemoryError, ReaderMode as RudofReaderMode};
use srdf::{RDFFormat, ReaderMode, SRDFGraph};
#[cfg(not(target_family = "wasm"))]
use std::io::Cursor;

// Response types shared by WASM and CLI
#[derive(Serialize, Clone)]
pub struct ValidationViolation {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct ValidationResponse {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub violations: Option<Vec<ValidationViolation>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub report: Option<String>,
}

impl ValidationViolation {
    pub fn new(message: &str, path: Option<&str>) -> Self {
        ValidationViolation {
            message: message.to_string(),
            path: path.map(str::to_string),
        }
    }
}

impl ValidationResponse {
    pub fn success(message: Option<&str>) -> Self {
        ValidationResponse {
            valid: true,
            message: message.map(str::to_string),
            violations: None,
            report: None,
        }
    }

    pub fn failure(message: Option<&str>, violations: Option<Vec<ValidationViolation>>) -> Self {
        ValidationResponse {
            valid: false,
            message: message.map(str::to_string),
            violations,
            report: None,
        }
    }

    pub fn with_report(mut self, report: Option<String>) -> Self {
        self.report = report;
        self
    }
}

#[cfg(not(target_family = "wasm"))]
fn serialize_validation_report(report: &shacl::validator::report::ValidationReport) -> Result<String, String> {
    let mut report_graph = OxigraphInMemory::new();
    report
        .to_rdf(&mut report_graph)
        .map_err(|error| error.to_string())?;

    let mut buffer = Vec::new();
    BuildRDF::serialize(&report_graph, &RudofRdfFormat::Turtle, &mut buffer)
        .map_err(|error: OxigraphInMemoryError| error.to_string())?;

    String::from_utf8(buffer).map_err(|error| error.to_string())
}

#[cfg(not(target_family = "wasm"))]
fn report_to_violations(report: &shacl::validator::report::ValidationReport) -> Vec<ValidationViolation> {
    report
        .results()
        .iter()
        .map(|result| {
            let message = result
                .message()
                .messages()
                .values()
                .next()
                .cloned()
                .unwrap_or_else(|| result.to_string());

            let path = result.path().map(|path| format!("{path:?}"));

            ValidationViolation {
                message,
                path,
            }
        })
        .collect()
}

// Native RDF+SHACL validation using full SHACL processor and report generation
#[cfg(not(target_family = "wasm"))]
pub fn validate_rdf_with_shacl(rdf: &str, shacl: &str) -> ValidationResponse {
    let rdf_trimmed = rdf.trim();
    let shacl_trimmed = shacl.trim();

    if rdf_trimmed.is_empty() {
        return ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new("RDF input cannot be empty", Some("rdf"))]),
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

    match SRDFGraph::from_str(
        rdf_trimmed,
        &RDFFormat::Turtle,
        None,
        &ReaderMode::Strict,
    ) {
        Err(e) => ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new(
                &format!("RDF parse error: {e}"),
                Some("rdf"),
            )]),
        ),
        Ok(_data_graph) => match SRDFGraph::from_str(
            shacl_trimmed,
            &RDFFormat::Turtle,
            None,
            &ReaderMode::Strict,
        ) {
            Err(e) => ValidationResponse::failure(
                None,
                Some(vec![ValidationViolation::new(
                    &format!("SHACL shapes parse error: {e}"),
                    Some("shacl"),
                )]),
            ),
            Ok(_shapes_graph) => {
                let schema = match ShaclDataManager::load(
                    &mut Cursor::new(shacl_trimmed),
                    "shapes",
                    &RudofRdfFormat::Turtle,
                    None,
                ) {
                    Ok(schema) => schema,
                    Err(error) => {
                        return ValidationResponse::failure(
                            Some("Could not parse SHACL schema"),
                            Some(vec![ValidationViolation::new(
                                &format!("SHACL schema error: {error}"),
                                Some("shacl"),
                            )]),
                        )
                    }
                };

                let data_graph = match OxigraphInMemory::from_str(
                    rdf_trimmed,
                    &RudofRdfFormat::Turtle,
                    None,
                    &RudofReaderMode::Strict,
                ) {
                    Ok(graph) => graph,
                    Err(error) => {
                        return ValidationResponse::failure(
                            Some("Could not load RDF data graph"),
                            Some(vec![ValidationViolation::new(
                                &format!("RDF graph load error: {error}"),
                                Some("rdf"),
                            )]),
                        )
                    }
                };

                let shacl_graph = match ShaclGraph::try_from(data_graph) {
                    Ok(graph) => graph,
                    Err(error) => {
                        return ValidationResponse::failure(
                            Some("Could not prepare RDF graph for SHACL validation"),
                            Some(vec![ValidationViolation::new(
                                &format!("RDF graph conversion error: {error}"),
                                Some("rdf"),
                            )]),
                        )
                    }
                };

                let mut validator = GraphValidation::new(shacl_graph);
                let report = match validator.validate(&schema, &ShaclValidationMode::Native) {
                    Ok(report) => report,
                    Err(error) => {
                        return ValidationResponse::failure(
                            Some("SHACL validation failed"),
                            Some(vec![ValidationViolation::new(
                                &format!("SHACL validator error: {error}"),
                                Some("validation"),
                            )]),
                        )
                    }
                };

                let serialized_report = serialize_validation_report(&report).ok();

                if report.conforms() {
                    ValidationResponse::success(Some("RDF data conforms to SHACL shapes"))
                        .with_report(serialized_report)
                } else {
                    ValidationResponse::failure(
                        Some("RDF data does not conform to SHACL shapes"),
                        Some(report_to_violations(&report)),
                    )
                    .with_report(serialized_report)
                }
            }
        },
    }
}

#[cfg(target_family = "wasm")]
pub fn validate_rdf_with_shacl(rdf: &str, shacl: &str) -> ValidationResponse {
    let rdf_trimmed = rdf.trim();
    let shacl_trimmed = shacl.trim();

    if rdf_trimmed.is_empty() {
        return ValidationResponse::failure(
            None,
            Some(vec![ValidationViolation::new("RDF input cannot be empty", Some("rdf"))]),
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
        Ok(_) => match SRDFGraph::from_str(
            shacl_trimmed,
            &RDFFormat::Turtle,
            None,
            &ReaderMode::Strict,
        ) {
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
        },
    }
}

// WASM helpers (for compatibility with wasm_bindgen exports)
#[cfg(target_arch = "wasm32")]
mod wasm_helpers {
    use super::*;
    use serde_wasm_bindgen::to_value;
    use wasm_bindgen::prelude::*;

    pub fn make_violation(message: &str, path: Option<&str>) -> ValidationViolation {
        ValidationViolation::new(message, path)
    }

    pub fn make_response(
        valid: bool,
        message: Option<String>,
        violations: Option<Vec<ValidationViolation>>,
    ) -> JsValue {
        to_value(&ValidationResponse {
            valid,
            message,
            violations,
            report: None,
        })
        .unwrap()
    }
}

#[cfg(target_arch = "wasm32")]
pub use wasm_helpers::*;
