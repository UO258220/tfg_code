use serde::Serialize;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
pub struct ValidationViolation {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
}

#[derive(Serialize)]
pub struct ValidationResponse {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub violations: Option<Vec<ValidationViolation>>,
}

pub fn make_violation(message: &str, path: Option<&str>) -> ValidationViolation {
    ValidationViolation {
        message: message.to_string(),
        path: path.map(str::to_string),
    }
}

pub fn make_response(valid: bool, message: Option<String>, violations: Option<Vec<ValidationViolation>>) -> JsValue {
    to_value(&ValidationResponse { valid, message, violations }).unwrap()
}

pub fn count_open_tags(input: &str) -> usize {
    let bytes = input.as_bytes();
    let mut count = 0;
    let len = bytes.len();

    let mut i = 0;
    while i < len {
        if bytes[i] == b'<' {
            if i + 1 < len && bytes[i + 1] != b'/' {
                count += 1;
            }
        }
        i += 1;
    }

    count
}

pub fn count_close_tags(input: &str) -> usize {
    let bytes = input.as_bytes();
    let len = bytes.len();
    let mut count = 0;

    for i in 0..len.saturating_sub(1) {
        if bytes[i] == b'<' && bytes[i + 1] == b'/' {
            count += 1;
        }
    }

    count
}
