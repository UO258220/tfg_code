# TFG Code - RDF & SHACL Validator

A web application for validating RDF data against SHACL constraints using the RUDOF backend.

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to access the application. The backend API runs on port 3001.

## Usage

Enter RDF data and SHACL shapes in the provided text areas. The application validates both inputs and displays the validation result. Both fields must be filled to perform validation.

## API

**POST** `/api/validate-schema`

Request:
```json
{"rdf": "RDF data (Turtle)", "shacl": "SHACL shapes (Turtle)"}
```

Response: Validation result with any errors or conformance status.

## Commands

- `npm start` - Start frontend (Vite on port 5173)
- `npm run server` - Start backend (Express on port 3001)
- `npm run dev` - Start both together
- `npm run test` - Run E2E tests (navigation + usability)
- `npm run build:rust` - Build WebAssembly modules
- `npm run lint` - Run ESLint
- `npm run format` - Format code

## Testing

Run `npm test` to execute the E2E test suite: 4 navigation tests and 8 usability tests. See [tests/e2e/](tests/e2e/) for details.
