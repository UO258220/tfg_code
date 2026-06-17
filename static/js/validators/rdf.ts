import * as wasm from "../../pkg/tfg_wasm.js";
import { ValidationResponse } from "./types";

export function validateRDFSyntax(inputText: string): ValidationResponse {
  return wasm.validate_rdf_syntax(inputText) as ValidationResponse;
}
