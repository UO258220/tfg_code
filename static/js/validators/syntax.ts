import * as wasm from "../../pkg/tfg_wasm";
import { ValidationResponse } from "./types";

const DEFAULT_SYNTAX_API_URL = "http://localhost:3001";

function getSyntaxApiUrl(): string {
  const configuredUrl = (import.meta.env.VITE_SYNTAX_API_URL || "").trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const hostname = window.location.hostname;
  const isLocalEnvironment = hostname === "localhost" || hostname === "127.0.0.1";

  // Fallback
  return isLocalEnvironment ? DEFAULT_SYNTAX_API_URL : "";
}

export function validateRDFWithSHACL(rdfText: string, shaclText: string): ValidationResponse {
  const result = wasm.validate_rdf_with_shacl(rdfText, shaclText);
  return result;
}

export async function validateRDFWithSHACLServer(
  rdfText: string,
  shaclText: string
): Promise<ValidationResponse> {
  const apiBaseUrl = getSyntaxApiUrl();

  if (!apiBaseUrl) {
    throw new Error("VITE_SYNTAX_API_URL is not configured for this environment");
  }

  const response = await fetch(`${apiBaseUrl}/api/validate-schema`, {
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
