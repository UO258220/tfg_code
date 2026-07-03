const express = require('express');
const cors = require('cors');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RDF/SHACL Validation Service' });
});

// RDF + SHACL syntactical validation endpoint — calls the rudof native binary (no wasm_bindgen)
app.post('/api/validate-schema', (req, res) => {
  const rdfText = typeof req.body?.rdf === 'string' ? req.body.rdf.trim() : '';
  const shaclText = typeof req.body?.shacl === 'string' ? req.body.shacl.trim() : '';

  const releaseBin = path.join(__dirname, 'target', 'release', 'validate_rdf_shacl');
  const debugBin = path.join(__dirname, 'target', 'debug', 'validate_rdf_shacl');
  const binPath = fs.existsSync(releaseBin) ? releaseBin
    : fs.existsSync(debugBin) ? debugBin
    : null;

  if (!binPath) {
    return res.status(500).json({
      valid: false,
      violations: [{ message: 'Validation binary not found. Run: cargo build --bin validate_rdf_shacl', path: 'server' }]
    });
  }

  const proc = spawnSync(binPath, [], {
    input: JSON.stringify({ rdf: rdfText, shacl: shaclText }),
    encoding: 'utf8',
    timeout: 15000,
  });

  if (proc.error) {
    return res.status(500).json({
      valid: false,
      violations: [{ message: `Binary error: ${proc.error.message}`, path: 'server' }]
    });
  }

  if (proc.status !== 0) {
    return res.status(500).json({
      valid: false,
      violations: [{ message: `Validation failed: ${(proc.stderr || '').trim() || 'Unknown error'}`, path: 'server' }]
    });
  }

  try {
    return res.json(JSON.parse(proc.stdout));
  } catch {
    return res.status(500).json({
      valid: false,
      violations: [{ message: 'Invalid response from validation binary', path: 'server' }]
    });
  }
});

app.listen(PORT, () => {
  console.log(`RDF/SHACL Validation Server running on port ${PORT}`);
  console.log(`Validation endpoint: http://localhost:${PORT}/api/validate-schema`);
});