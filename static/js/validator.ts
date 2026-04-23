interface ValidationViolation {
  message?: string;
  path?: string;
}

interface ValidationResponse {
  valid: boolean;
  violations?: ValidationViolation[];
  message?: string;
}

function setResultState(element: HTMLElement, message: string, statusClass: string): void {
  element.className = `result-card ${statusClass}`;
  element.textContent = message;
}

/**
 * Validates RDF data using SHACL via the backend RUDOF service
 * Posts RDF text to /api/validate-rdf and handles the response
 */
export async function validateRDF(): Promise<void> {
  const rdfInput = document.getElementById("rdf-input") as HTMLTextAreaElement;
  const rdfResult = document.getElementById("rdf-result");

  if (!rdfInput || !rdfResult) return;

  const rdfText = rdfInput.value.trim();
  if (!rdfText) {
    setResultState(rdfResult, "Enter RDF text to validate.", "status-info");
    return;
  }

  setResultState(rdfResult, "Validating RDF using SHACL...", "status-info");

  try {
    const response = await fetch("http://localhost:3001/api/validate-rdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rdf: rdfText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Validation error: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.violations && errorData.violations.length > 0) {
          errorMessage = `✗ RDF validation failed:\n${errorData.violations
            .map((v: ValidationViolation) => `- ${v.message || "Constraint violation"}`)
            .join("\n")}`;
        }
      } catch {
        if (errorText) {
          errorMessage += `\n${errorText}`;
        }
      }

      setResultState(rdfResult, errorMessage, "status-invalid");
      return;
    }

    const result: ValidationResponse = await response.json();
    if (result.valid) {
      setResultState(rdfResult, `✓ ${result.message || "RDF is valid according to SHACL"}`, "status-valid");
    } else {
      setResultState(
        rdfResult,
        `✗ RDF validation failed:\n${result.violations
          ?.map((v: ValidationViolation) =>
            `- ${v.message || "Constraint violation at " + (v.path || "unknown")}`
          )
          .join("\n") || "Unknown validation error"}`,
        "status-invalid"
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch")) {
      setResultState(
        rdfResult,
        `❌ Backend server not available. Please start the server with:\n\nnpm run server\n\nThen run validation again.`,
        "status-warning"
      );
    } else {
      setResultState(rdfResult, `Validation failed: ${errorMessage}`, "status-invalid");
    }
  }
}
