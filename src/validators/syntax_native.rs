// Native (non-WASM) SHACL conformance validation.
// This is a stub for future work — full conformance checking using the RUDOF backend.

use super::common::{ValidationResponse, ValidationViolation};
use rudof_rdf::rdf_core::{BuildRDF, RDFFormat as RudofRdfFormat};
use rudof_rdf::rdf_impl::{OxigraphInMemory, OxigraphInMemoryError, ReaderMode as RudofReaderMode};
use shacl::ir::IRSchema;
use shacl::validator::processor::{GraphValidation, ShaclProcessor};
use shacl::validator::store::Graph as ShaclGraph;
use shacl::validator::ShaclValidationMode;

fn serialize_validation_report(
    report: &shacl::validator::report::ValidationReport,
) -> Result<String, String> {
    let mut report_graph = OxigraphInMemory::new();
    report
        .to_rdf(&mut report_graph)
        .map_err(|error| error.to_string())?;

    let mut buffer = Vec::new();
    BuildRDF::serialize(&report_graph, &RudofRdfFormat::Turtle, &mut buffer)
        .map_err(|error: OxigraphInMemoryError| error.to_string())?;

    String::from_utf8(buffer).map_err(|error| error.to_string())
}

fn report_to_violations(
    report: &shacl::validator::report::ValidationReport,
) -> Vec<ValidationViolation> {
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

            ValidationViolation { message, path }
        })
        .collect()
}

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

    let schema = match IRSchema::from_str(
        shacl_trimmed,
        &RudofRdfFormat::Turtle,
        None,
        &RudofReaderMode::Strict,
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

    let mut validator = GraphValidation::from(shacl_graph);
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
