use serde::Serialize;

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
