import * as wasm from "../../pkg/tfg_wasm";
import { ValidationResponse } from "./types";

export function validateRDFWithSHACL(rdfText: string, shaclText: string): ValidationResponse {
  const result = wasm.validate_rdf_with_shacl(rdfText, shaclText);
  return result;
}

export async function validateRDFWithSHACLServer(
  rdfText: string,
  shaclText: string
): Promise<ValidationResponse> {
  const response = await fetch("http://localhost:3001/api/validate-schema", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rdf: rdfText, shacl: shaclText }),
  });

  return (await response.json()) as ValidationResponse;
}
