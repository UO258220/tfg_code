import * as wasm from "../../pkg/tfg_wasm";
import { ValidationResponse } from "./types";

export function validateSHACLSyntax(inputText: string): ValidationResponse {
  const result = wasm.validate_shacl(inputText);
  return result;
}
