# RDF / SHACL Validation Web Service

A web application for validating RDF data against SHACL constraints using the RUDOF backend.

```bash
npm install
npm run dev
```

Visit `https://uo258220.github.io/tfg_code/` to access the application. The backend API runs on port 3001.

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

- `npm start` - Start frontend (Vite)
- `npm run server` - Start backend (Express on port 3001 - Render)
- `npm run dev` - Start both together
- `npm run test` - Run E2E tests
- `npm run build:rust` - Build WebAssembly modules
