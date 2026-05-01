import { validateRDFSyntax } from "./validators/rdf";
import { validateSHACL } from "./validators/shacl";
import { validateSPARQL } from "./validators/sparql";
import { validateSchema } from "./validators/schema";
import { setResultState } from "./validators/utils";

/**
 * Main validation function that routes to specific validators based on type
 */
export async function validateRDF(): Promise<void> {
  const rdfInput = document.getElementById("rdf-input") as HTMLTextAreaElement;
  const validationTypeSelect = document.getElementById("validation-type") as HTMLSelectElement;
  const rdfResult = document.getElementById("rdf-result");

  if (!rdfInput || !validationTypeSelect || !rdfResult) return;

  const inputText = rdfInput.value.trim();
  const validationType = validationTypeSelect.value;

  if (!inputText) {
    setResultState(rdfResult, "Enter data to validate.", "status-info");
    return;
  }

  setResultState(rdfResult, `Validating using ${validationType.toUpperCase()}...`, "status-info");

  try {
    switch (validationType) {
      case 'rdf':
        await validateRDFSyntax(inputText, rdfResult);
        break;
      case 'shacl':
        await validateSHACL(inputText, rdfResult);
        break;
      case 'sparql':
        await validateSPARQL(inputText, rdfResult);
        break;
      case 'schema':
        await validateSchema(inputText, rdfResult);
        break;
      default:
        setResultState(rdfResult, "Unknown validation type selected.", "status-invalid");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setResultState(rdfResult, `Validation failed: ${errorMessage}`, "status-invalid");
  }
}
