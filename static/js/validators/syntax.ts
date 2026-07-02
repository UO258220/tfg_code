import * as wasm from "../../pkg/tfg_wasm";
import { ValidationResponse } from "./types";

const DEFAULT_SYNTAX_API_URL = "http://localhost:3001";

function getSyntaxApiUrl(): string {
  const configuredUrl = import.meta.env.VITE_SYNTAX_API_URL;
  return (configuredUrl || DEFAULT_SYNTAX_API_URL).replace(/\/$/, "");
}

export function validateRDFWithSHACL(rdfText: string, shaclText: string): ValidationResponse {
  const result = wasm.validate_rdf_with_shacl(rdfText, shaclText);
  return result;
}

export async function validateRDFWithSHACLServer(
  rdfText: string,
  shaclText: string
): Promise<ValidationResponse> {
  const response = await fetch(`${getSyntaxApiUrl()}/api/validate-schema`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rdf: rdfText, shacl: shaclText }),
  });

  if (!response.ok) {
    throw new Error(`Validation service returned HTTP ${response.status}`);
  }

  return (await response.json()) as ValidationResponse;
}
