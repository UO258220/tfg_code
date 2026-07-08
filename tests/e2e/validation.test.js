const {
  assert,
  createDriver,
  readInputFile,
  runTest,
  validateInputs,
  getResultState,
} = require('./test-utils');

async function runValidationTests() {
  let driver;

  const rdfValid = readInputFile('RDF1.txt');
  const rdfLexErrors = readInputFile('RDF1_lex_errors.txt');
  const rdfSynErrors = readInputFile('RDF1_syn_errors.txt');
  const shaclValid = readInputFile('SHACL1.txt');
  const shaclLexErrors = readInputFile('SHACL1_lex_errors.txt');
  const rdf2Valid = readInputFile('RDF2.txt');
  const rdf2LexErrors = readInputFile('RDF2_lex_errors.txt');
  const rdf2SynErrors = readInputFile('RDF2_syn_errors.txt');
  const shacl2Valid = readInputFile('SHACL2.txt');
  const shacl2LexErrors = readInputFile('SHACL2_lex_errors.txt');
  const rdf3Valid = readInputFile('RDF3.txt');
  const rdf3LexErrors = readInputFile('RDF3_lex_errors.txt');
  const rdf3SynErrors = readInputFile('RDF3_syn_errors.txt');
  const shacl3Valid = readInputFile('SHACL3.txt');
  const shacl3LexErrors = readInputFile('SHACL3_lex_errors.txt');

  try {
    driver = await createDriver();

    console.log('\n=== Validation Flow Tests ===\n');
    console.log('=== VAL1 Input Set ===\n');

    await runTest('VAL1-1: RDF1 + SHACL1 returns a fully valid validation result', async () => {
      await validateInputs(driver, rdfValid, shaclValid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-valid'));
      assert.equal(state.validSectionCount, 3);
      assert.equal(state.invalidSectionCount, 0);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(state.text.includes('RDF data conforms to SHACL shapes'));
    });

    await runTest('VAL1-2: RDF1_lex_errors + SHACL1 returns an invalid result', async () => {
      await validateInputs(driver, rdfLexErrors, shaclValid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('RDF syntax error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL1-3: RDF1 + SHACL1_lex_errors returns an invalid result', async () => {
      await validateInputs(driver, rdfValid, shaclLexErrors);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('SHACL parsing error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL1-4: RDF1_syn_errors + SHACL1 returns an invalid syntax result', async () => {
      await validateInputs(driver, rdfSynErrors, shaclValid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(state.text.includes('RDF syntax error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    console.log('=== VAL2 Input Set ===\n');

    await runTest('VAL2-1: RDF2 + SHACL2 returns a fully valid validation result', async () => {
      await validateInputs(driver, rdf2Valid, shacl2Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-valid'));
      assert.equal(state.validSectionCount, 3);
      assert.equal(state.invalidSectionCount, 0);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(state.text.includes('RDF data conforms to SHACL shapes'));
    });

    await runTest('VAL2-2: RDF2_lex_errors + SHACL2 returns an invalid result', async () => {
      await validateInputs(driver, rdf2LexErrors, shacl2Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('RDF syntax error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL2-3: RDF2 + SHACL2_lex_errors returns an invalid result', async () => {
      await validateInputs(driver, rdf2Valid, shacl2LexErrors);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('SHACL parsing error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL2-4: RDF2_syn_errors + SHACL2 returns an invalid conformance result', async () => {
      await validateInputs(driver, rdf2SynErrors, shacl2Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(!state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    console.log('=== VAL3 Input Set ===\n');

    await runTest('VAL3-1: RDF3 + SHACL3 returns a fully valid validation result', async () => {
      await validateInputs(driver, rdf3Valid, shacl3Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-valid'));
      assert.equal(state.validSectionCount, 3);
      assert.equal(state.invalidSectionCount, 0);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(state.text.includes('RDF data conforms to SHACL shapes'));
    });

    await runTest('VAL3-2: RDF3_lex_errors + SHACL3 returns an invalid result', async () => {
      await validateInputs(driver, rdf3LexErrors, shacl3Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('RDF syntax error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL3-3: RDF3 + SHACL3_lex_errors returns an invalid result', async () => {
      await validateInputs(driver, rdf3Valid, shacl3LexErrors);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('SHACL parsing error'));
      assert.ok(state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    await runTest('VAL3-4: RDF3_syn_errors + SHACL3 returns an invalid conformance result', async () => {
      await validateInputs(driver, rdf3SynErrors, shacl3Valid);
      const state = await getResultState(driver);

      assert.ok(state.className.includes('status-invalid'));
      assert.equal(state.validSectionCount, 2);
      assert.equal(state.invalidSectionCount, 1);
      assert.ok(state.text.includes('RDF Syntax'));
      assert.ok(state.text.includes('SHACL Syntax'));
      assert.ok(state.text.includes('RDF Conformance'));
      assert.ok(!state.text.includes('Fix RDF/SHACL syntax errors before conformance check.'));
    });

    console.log('=== All Validation Flow Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runValidationTests();
