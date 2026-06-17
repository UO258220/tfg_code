use serde::Deserialize;
use serde_json::{json, Value};
use std::fs::{self, OpenOptions};
use std::io::{self, Read};
use std::io::Write;
use std::time::{SystemTime, UNIX_EPOCH};
use tfg_wasm::validators::common::{validate_rdf_with_shacl, ValidationResponse};

#[derive(Deserialize)]
struct Input {
    rdf: String,
    shacl: String,
}

fn unix_timestamp_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

fn build_request_id() -> String {
    format!("req-{}", unix_timestamp_ms())
}

fn log_event(request_id: &str, event: &str, payload: Value) {
    if fs::create_dir_all("logs").is_err() {
        return;
    }

    let line = json!({
        "timestamp_ms": unix_timestamp_ms(),
        "request_id": request_id,
        "event": event,
        "payload": payload,
    });

    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("logs/validation.log")
    {
        let _ = writeln!(file, "{}", line);
    }
}

fn main() {
    let request_id = build_request_id();

    let mut raw = String::new();
    io::stdin()
        .read_to_string(&mut raw)
        .expect("failed to read stdin");

    log_event(
        &request_id,
        "request_received",
        json!({ "raw_body": raw }),
    );

    let response = match serde_json::from_str::<Input>(&raw) {
        Ok(input) => {
            log_event(
                &request_id,
                "validation_requested",
                json!({
                    "rdf": input.rdf,
                    "shacl": input.shacl,
                }),
            );

            let response = validate_rdf_with_shacl(&input.rdf, &input.shacl);

            log_event(
                &request_id,
                "rudof_response",
                serde_json::to_value(&response).unwrap_or_else(|_| json!({ "valid": false })),
            );

            response
        }
        Err(error) => {
            let message = format!("JSON input error: {error}");
            let response = ValidationResponse::failure(Some(message.as_str()), None);

            log_event(
                &request_id,
                "request_error",
                json!({
                    "error": message,
                    "response": serde_json::to_value(&response)
                        .unwrap_or_else(|_| json!({ "valid": false })),
                }),
            );

            response
        }
    };

    println!("{}", serde_json::to_string(&response).unwrap());
}
