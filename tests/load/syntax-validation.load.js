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

async function measureValidationScenario(driver, name, rdfText, shaclText, expectedState) {
  await runTimedScenario(name, async () => {
    await validateInputs(driver, rdfText, shaclText, TARGET_BASE_URL);
    const state = await getResultState(driver);

    assert.ok(state.className.includes(expectedState.className));
    assert.equal(state.validSectionCount, expectedState.validSectionCount);
    assert.equal(state.invalidSectionCount, expectedState.invalidSectionCount);

    for (const expectedText of expectedState.textIncludes) {
      assert.ok(state.text.includes(expectedText));
    }

    for (const excludedText of expectedState.textExcludes || []) {
      assert.ok(!state.text.includes(excludedText));
    }
  });
}

async function runValidationLoadTests() {
  let driver;

  const rdf1 = readInputFile('RDF1.txt');
  const rdf1SynErrors = readInputFile('RDF1_syn_errors.txt');
  const shacl1 = readInputFile('SHACL1.txt');

  const rdf2 = readInputFile('RDF2.txt');
  const rdf2SynErrors = readInputFile('RDF2_syn_errors.txt');
  const shacl2 = readInputFile('SHACL2.txt');

  const rdf3 = readInputFile('RDF3.txt');
  const rdf3SynErrors = readInputFile('RDF3_syn_errors.txt');
  const shacl3 = readInputFile('SHACL3.txt');

  try {
    driver = await createDriver();

    console.log('\n=== Syntax Validation Load Tests ===\n');
    console.log(`Iterations per scenario: ${ITERATIONS}\n`);

    await measureValidationScenario(
      driver,
      'LOADS1-1: RDF1 + SHACL1 syntax/conformance timing',
      rdf1,
      shacl1,
      {
        className: 'status-valid',
        validSectionCount: 3,
        invalidSectionCount: 0,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'RDF data conforms to SHACL shapes',
        ],
      }
    );

    await measureValidationScenario(
      driver,
      'LOADS1-2: RDF1_syn_errors + SHACL1 syntax timing',
      rdf1SynErrors,
      shacl1,
      {
        className: 'status-invalid',
        validSectionCount: 2,
        invalidSectionCount: 1,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'RDF syntax error',
          'Fix RDF/SHACL syntax errors before conformance check.',
        ],
      }
    );

    await measureValidationScenario(
      driver,
      'LOADS2-1: RDF2 + SHACL2 syntax/conformance timing',
      rdf2,
      shacl2,
      {
        className: 'status-valid',
        validSectionCount: 3,
        invalidSectionCount: 0,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'RDF data conforms to SHACL shapes',
        ],
      }
    );

    await measureValidationScenario(
      driver,
      'LOADS2-2: RDF2_syn_errors + SHACL2 syntax timing',
      rdf2SynErrors,
      shacl2,
      {
        className: 'status-invalid',
        validSectionCount: 2,
        invalidSectionCount: 1,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'Could not validate conformance via backend service.',
        ],
      }
    );

    await measureValidationScenario(
      driver,
      'LOADS3-1: RDF3 + SHACL3 syntax/conformance timing',
      rdf3,
      shacl3,
      {
        className: 'status-valid',
        validSectionCount: 3,
        invalidSectionCount: 0,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'RDF data conforms to SHACL shapes',
        ],
      }
    );

    await measureValidationScenario(
      driver,
      'LOADS3-2: RDF3_syn_errors + SHACL3 syntax timing',
      rdf3SynErrors,
      shacl3,
      {
        className: 'status-invalid',
        validSectionCount: 2,
        invalidSectionCount: 1,
        textIncludes: [
          'RDF Syntax',
          'SHACL Syntax',
          'RDF Conformance',
          'MinCount(1) not satisfied',
          'OR not satisfied',
        ],
      }
    );

    console.log('=== Syntax Validation Load Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Load test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runValidationLoadTests();
