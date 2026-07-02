import { validateRDFSyntax } from "./validators/rdf";
import { validateSHACLSyntax } from "./validators/shacl";
import { validateRDFWithSHACLServer } from "./validators/syntax";
import { ValidationResponse } from "./validators/types";

/**
 * Main validation function that validates RDF syntax, SHACL shapes, and Schema.org.
 */
export async function validateRDF(): Promise<void> {
  const rdfInput = document.getElementById("rdf-input") as HTMLTextAreaElement;
  const shaclInput = document.getElementById("shacl-input") as HTMLTextAreaElement;
  const rdfResult = document.getElementById("rdf-result");
  const secondaryResult = document.getElementById("rdf-result-secondary") as HTMLTextAreaElement;

  if (!rdfInput || !shaclInput || !rdfResult || !secondaryResult) return;

  const rdfText = rdfInput.value.trim();
  const shaclText = shaclInput.value.trim();

  if (!rdfText || !shaclText) {
    rdfResult.innerHTML = '<span class="status-info">Enter RDF data and SHACL shapes to validate.</span>';
    rdfResult.className = "result-card status-info";
    secondaryResult.value = "";
    return;
  }

  secondaryResult.value = "";

  const sections: Array<{ title: string; content: string; valid: boolean }> = [];
  let overallValid = true;
  let rdfSyntaxValid = true;
  let shaclSyntaxValid = true;

  // RDF Syntax validation
  const rdfResponse: ValidationResponse = validateRDFSyntax(rdfText);
  if (!rdfResponse.valid) {
    rdfSyntaxValid = false;
    overallValid = false;
    const errors = rdfResponse.violations
      ?.map((v) => `  ✗ ${v.message || "Unknown RDF error"}`)
      .join("\n") || `  ✗ ${rdfResponse.message || "Unknown validation error"}`;
    sections.push({
      title: "RDF Syntax",
      content: errors,
      valid: false,
    });
  } else {
    sections.push({
      title: "RDF Syntax",
      content: `  ✓ ${rdfResponse.message || "Syntax is valid."}`,
      valid: true,
    });
  }

  // SHACL syntax validation
  const shaclResponse: ValidationResponse = validateSHACLSyntax(shaclText);
  if (!shaclResponse.valid) {
    shaclSyntaxValid = false;
    overallValid = false;
    const errors = shaclResponse.violations
      ?.map((v) => `  ✗ ${v.message || "Unknown SHACL error"}`)
      .join("\n") || `  ✗ ${shaclResponse.message || "Unknown validation error"}`;
    sections.push({
      title: "SHACL Syntax",
      content: errors,
      valid: false,
    });
  } else {
    sections.push({
      title: "SHACL Syntax",
      content: `  ✓ ${shaclResponse.message || "Syntax is valid."}`,
      valid: true,
    });
  }

  // RDF-over-SHACL syntactical validation
  if (!rdfSyntaxValid || !shaclSyntaxValid) {
    sections.push({
      title: "RDF Conformance",
      content: "ℹ Fix RDF/SHACL syntax errors before conformance check.",
      valid: true,
    });
  } else {
    try {
      const shaclValidationResponse: ValidationResponse = await validateRDFWithSHACLServer(rdfText, shaclText);
      if (!shaclValidationResponse.valid) {
        overallValid = false;
        const errors = shaclValidationResponse.violations
          ?.map((v) => `  ✗ ${v.message || "Unknown validation error"}`)
          .join("\n") || `  ✗ ${shaclValidationResponse.message || "Unknown validation error"}`;
        secondaryResult.value = shaclValidationResponse.report || "";
        sections.push({
          title: "RDF Conformance",
          content: errors,
          valid: false,
        });
      } else {
        secondaryResult.value = shaclValidationResponse.report || "";
        sections.push({
          title: "RDF Conformance",
          content: `  ✓ ${shaclValidationResponse.message || "RDF conforms to SHACL shapes."}`,
          valid: true,
        });
      }
    } catch (error) {
      overallValid = false;
      secondaryResult.value = "";
      sections.push({
        title: "RDF Conformance",
        content: "  ✗ Could not validate conformance via backend service.",
        valid: false,
      });
    }
  }

  // Build HTML with individual color classes
  let html = "";
  sections.forEach((section, index) => {
    const statusClass = section.valid ? "status-valid" : "status-invalid";
    html += `<div class="validation-section ${statusClass}"><strong>${section.title}</strong>\n${section.content}</div>`;
    if (index < sections.length - 1) {
      html += "\n";
    }
  });

  rdfResult.innerHTML = html;
  rdfResult.className = `result-card ${overallValid ? "status-valid" : "status-invalid"}`;
}
