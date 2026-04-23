# TFG Code - RDF Validator

A web application that demonstrates RDF validation using SHACL via the RUDOF project backend.

## Features

- **Greeting Module**: Simple greeting functionality using Rust WebAssembly
- **Calculator**: Basic arithmetic operations using Rust WebAssembly
- **RDF Validator**: SHACL validation using the RUDOF backend service

## Tech Stack

- **Frontend**: TypeScript, HTML, CSS
- **Backend**: Node.js, Express
- **WebAssembly**: Rust compiled to WASM
- **Validation**: SHACL via RUDOF project

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Rust (for WebAssembly compilation)
- wasm-pack

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. **Start the backend server** (for RDF validation):
   ```bash
   npm run server
   ```
   This starts the Express server on port 3001 with the validation endpoint.

2. **Start the frontend** (in a separate terminal):
   ```bash
   npm start
   ```
   This starts the Vite development server on port 5173.

3. **Or run both together**:
   ```bash
   npm run dev
   ```
   This runs both the server and frontend concurrently.

### Building for Production

```bash
npm run build
```

## Usage

### RDF Validation

1. Open the application in your browser
2. Scroll to the "RDF Validator" section
3. Paste your RDF data into the large text area
4. Click "Validate RDF"
5. View the validation results:
   - ✅ Green: RDF is valid
   - ❌ Red: Validation errors with details
   - 🟠 Orange: Backend server not running

### Testing RDF Validation

The backend includes basic RDF syntax validation. Try pasting:

**Valid RDF (Turtle format):**
```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org/person/1> rdf:type <http://example.org/Person> ;
    rdfs:label "John Doe" .
```

**Invalid RDF (missing prefix):**
```turtle
<http://example.org/person/1> rdf:type <http://example.org/Person> .
```

## API Endpoints

- `POST /api/validate-rdf` - Validate RDF data
  - Body: `{ "rdf": "your rdf data here" }`
  - Response: `{ "valid": boolean, "violations": [...], "message": "..." }`

- `GET /api/health` - Health check

## Project Structure

```
├── src/                    # Rust WebAssembly source
├── static/                 # Frontend source
│   ├── js/                 # TypeScript modules
│   │   ├── index.ts        # Main application logic
│   │   └── validator.ts    # RDF validation logic
│   ├── index.html          # Main HTML
│   └── css/                # Styles
├── dist/                   # Built application
├── server.js               # Backend validation server
└── pkg/                    # WebAssembly package
```

## Development

- `npm run build:rust` - Build WebAssembly modules
- `npm run server` - Start backend server only
- `npm start` - Start frontend only
- `npm run dev` - Start both frontend and backend
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
