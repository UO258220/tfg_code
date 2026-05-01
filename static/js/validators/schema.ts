import { ValidationResponse } from "./types";
import { setResultState } from "./utils";

export async function validateSchema(inputText: string, resultElement: HTMLElement): Promise<void> {
  try {
    const response = await fetch("http://localhost:3001/api/validate-schema", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rdf: inputText }),
    });

    const result: ValidationResponse = await response.json();
    setResultState(resultElement, result.message || "Schema.org validation not implemented yet", "status-info");
  } catch (error) {
    setResultState(resultElement, "Schema.org validation not implemented yet", "status-info");
  }
}
