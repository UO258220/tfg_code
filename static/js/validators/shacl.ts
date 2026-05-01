import { ValidationResponse } from "./types";
import { setResultState } from "./utils";

export async function validateSHACL(inputText: string, resultElement: HTMLElement): Promise<void> {
  try {
    const response = await fetch("http://localhost:3001/api/validate-shacl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rdf: inputText }),
    });

    const result: ValidationResponse = await response.json();
    setResultState(resultElement, result.message || "SHACL validation not implemented yet", "status-info");
  } catch (error) {
    setResultState(resultElement, "SHACL validation not implemented yet", "status-info");
  }
}
