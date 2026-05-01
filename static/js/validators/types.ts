export interface ValidationViolation {
  message?: string;
  path?: string;
}

export interface ValidationResponse {
  valid: boolean;
  violations?: ValidationViolation[];
  message?: string;
}
