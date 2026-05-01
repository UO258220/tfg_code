import * as wasm from "../../pkg/tfg_wasm.js";
import { ValidationResponse, ValidationViolation } from "./types";
import { setResultState } from "./utils";

export async function validateRDFSyntax(inputText: string, resultElement: HTMLElement): Promise<void> {
  try {
    const result: ValidationResponse = wasm.validate_rdf_syntax(inputText);

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
    setResultState(resultElement, `Validation failed: ${errorMessage}`, "status-invalid");
  }
}
