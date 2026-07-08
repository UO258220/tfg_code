const { performance } = require('node:perf_hooks');
const {
  assert,
  BASE_URL,
  createDriver,
  readInputFile,
  validateInputs,
  getResultState,
} = require('../e2e/test-utils');

const ITERATIONS = Number(process.env.LOAD_ITERATIONS || 50);
const TARGET_BASE_URL = (process.env.LOAD_BASE_URL || BASE_URL).trim().replace(/\/?$/, '/');

function printTimingSummary(durations) {
  const total = durations.reduce((sum, value) => sum + value, 0);
  const average = total / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);

  console.log(`  Runs: ${durations.length}`);
  console.log(`  Avg(ms): ${average.toFixed(2)}`);
  console.log(`  Min(ms): ${min.toFixed(2)}`);
  console.log(`  Max(ms): ${max.toFixed(2)}\n`);
}

async function runTimedScenario(name, fn) {
  process.stdout.write(`✓ ${name}\n`);

  const durations = [];

  for (let index = 0; index < ITERATIONS; index += 1) {
    const startedAt = performance.now();
    await fn();
    const finishedAt = performance.now();
    durations.push(finishedAt - startedAt);
  }

  printTimingSummary(durations);
  process.stdout.write('  COMPLETED\n\n');
}

async function measureLexicalScenario(driver, name, rdfText, shaclText, expectedText) {
  await runTimedScenario(name, async () => {
    await validateInputs(driver, rdfText, shaclText, TARGET_BASE_URL);
    const state = await getResultState(driver);

    assert.ok(state.className.includes('status-invalid'));
    assert.equal(state.validSectionCount, 2);
    assert.equal(state.invalidSectionCount, 1);

    assert.ok(state.text.includes('RDF Syntax'));
    assert.ok(state.text.includes('SHACL Syntax'));
    assert.ok(state.text.includes('RDF Conformance'));
    assert.ok(state.text.includes(expectedText));
    assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
  });
}

async function runLexicalValidationLoadTests() {
  let driver;

  const rdf1 = readInputFile('RDF1.txt');
  const rdf1LexErrors = readInputFile('RDF1_lex_errors.txt');
  const shacl1 = readInputFile('SHACL1.txt');
  const shacl1LexErrors = readInputFile('SHACL1_lex_errors.txt');

  const rdf2 = readInputFile('RDF2.txt');
  const rdf2LexErrors = readInputFile('RDF2_lex_errors.txt');
  const shacl2 = readInputFile('SHACL2.txt');
  const shacl2LexErrors = readInputFile('SHACL2_lex_errors.txt');

  const rdf3 = readInputFile('RDF3.txt');
  const rdf3LexErrors = readInputFile('RDF3_lex_errors.txt');
  const shacl3 = readInputFile('SHACL3.txt');
  const shacl3LexErrors = readInputFile('SHACL3_lex_errors.txt');

  try {
    driver = await createDriver();

    console.log('\n=== Lexical Validation Load Tests ===\n');
    console.log(`Iterations per scenario: ${ITERATIONS}\n`);

    await measureLexicalScenario(
      driver,
      'LOADL1-1: RDF1_lex_errors + SHACL1 lexical timing',
      rdf1LexErrors,
      shacl1,
      'RDF syntax error'
    );

    await measureLexicalScenario(
      driver,
      'LOADL1-2: RDF1 + SHACL1_lex_errors lexical timing',
      rdf1,
      shacl1LexErrors,
      'SHACL parsing error'
    );

    await measureLexicalScenario(
      driver,
      'LOADL2-1: RDF2_lex_errors + SHACL2 lexical timing',
      rdf2LexErrors,
      shacl2,
      'RDF syntax error'
    );

    await measureLexicalScenario(
      driver,
      'LOADL2-2: RDF2 + SHACL2_lex_errors lexical timing',
      rdf2,
      shacl2LexErrors,
      'SHACL parsing error'
    );

    await measureLexicalScenario(
      driver,
      'LOADL3-1: RDF3_lex_errors + SHACL3 lexical timing',
      rdf3LexErrors,
      shacl3,
      'RDF syntax error'
    );

    await measureLexicalScenario(
      driver,
      'LOADL3-2: RDF3 + SHACL3_lex_errors lexical timing',
      rdf3,
      shacl3LexErrors,
      'SHACL parsing error'
    );

    console.log('=== Lexical Validation Load Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Load test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runLexicalValidationLoadTests();
