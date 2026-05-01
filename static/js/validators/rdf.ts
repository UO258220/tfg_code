import { ValidationResponse, ValidationViolation } from "./types";
import { setResultState } from "./utils";

export async function validateRDFSyntax(inputText: string, resultElement: HTMLElement): Promise<void> {
  try {
    const response = await fetch("http://localhost:3001/api/validate-rdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rdf: inputText }),
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

      setResultState(resultElement, errorMessage, "status-invalid");
      return;
    }

    const result: ValidationResponse = await response.json();
    if (result.valid) {
      setResultState(resultElement, `✓ ${result.message || "RDF is valid syntactically"}`, "status-valid");
    } else {
      setResultState(
        resultElement,
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
        resultElement,
        `❌ Backend server not available. Please start the server with:\n\nnpm run server\n\nThen run validation again.`,
        "status-warning"
      );
    } else {
      setResultState(resultElement, `Validation failed: ${errorMessage}`, "status-invalid");
    }
  }
}
