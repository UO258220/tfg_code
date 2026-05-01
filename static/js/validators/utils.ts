import { ValidationResponse } from "./types";

export function setResultState(element: HTMLElement, message: string, statusClass: string): void {
  element.className = `result-card ${statusClass}`;
  element.textContent = message;
}

export async function parseResponse(response: Response): Promise<ValidationResponse> {
  return (await response.json()) as ValidationResponse;
}
