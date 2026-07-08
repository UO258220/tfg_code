const { assert, By, until, createDriver, runTest, loadHome } = require('./test-utils');
const EMPTY_MSG = 'Enter RDF data and SHACL shapes to validate.';

async function runUsabilityTests() {
  let driver;

  try {
    driver = await createDriver();

    console.log('\n=== Writability Tests ===\n');

    await runTest('US-1: Writing in the rdf field "TEST STRING" is possible', async () => {
      await loadHome(driver);
      const rdfInput = await driver.findElement(By.id('rdf-input'));
      await rdfInput.sendKeys('TEST STRING');
      const rdfValue = await rdfInput.getAttribute('value');
      assert.equal(rdfValue, 'TEST STRING');
    });

    await runTest('US-2: Writing in the shacl field "TEST STRING" is possible', async () => {
      await loadHome(driver);
      const shaclInput = await driver.findElement(By.id('shacl-input'));
      await shaclInput.sendKeys('TEST STRING');
      const shaclValue = await shaclInput.getAttribute('value');
      assert.equal(shaclValue, 'TEST STRING');
    });

    await runTest('US-3: Writing in the rdf result field "TEST STRING" is not possible (read-only)', async () => {
      await loadHome(driver);
      const rdfResultSecondary = await driver.findElement(By.id('rdf-result-secondary'));
      const isReadonly = await rdfResultSecondary.getAttribute('readonly');
      assert.notEqual(isReadonly, null);
    });

    await runTest('US-4: Writing in the validation report display field "TEST STRING" is not possible (read-only)', async () => {
      await loadHome(driver);
      const rdfResult = await driver.findElement(By.id('rdf-result'));
      const tagName = await rdfResult.getTagName();
      assert.equal(tagName.toLowerCase(), 'div');
    });

    console.log('=== Field Combination Tests ===\n');

    await runTest('US-5: No response when both RDF and SHACL fields are empty', async () => {
      await loadHome(driver);
      await driver.executeScript("document.getElementById('rdf-input').value = ''; document.getElementById('shacl-input').value = '';");
      await driver.findElement(By.id('validate-btn')).click();
      const resultText = await driver.findElement(By.id('rdf-result')).getText();
      assert.equal(resultText.trim(), EMPTY_MSG);
    });

    await runTest('US-6: No response when RDF has content but SHACL is empty', async () => {
      await loadHome(driver);
      await driver.findElement(By.id('rdf-input')).sendKeys('TEST STRING');
      await driver.executeScript("document.getElementById('shacl-input').value = '';");
      await driver.findElement(By.id('validate-btn')).click();
      const resultText = await driver.findElement(By.id('rdf-result')).getText();
      assert.equal(resultText.trim(), EMPTY_MSG);
    });

    await runTest('US-7: No response when SHACL has content but RDF is empty', async () => {
      await loadHome(driver);
      await driver.findElement(By.id('shacl-input')).sendKeys('TEST STRING');
      await driver.executeScript("document.getElementById('rdf-input').value = '';");
      await driver.findElement(By.id('validate-btn')).click();
      const resultText = await driver.findElement(By.id('rdf-result')).getText();
      assert.equal(resultText.trim(), EMPTY_MSG);
    });

    await runTest('US-8: Validation result appears when both fields have content', async () => {
      await loadHome(driver);
      await driver.findElement(By.id('rdf-input')).sendKeys('TEST STRING');
      await driver.findElement(By.id('shacl-input')).sendKeys('TEST STRING');
      await driver.findElement(By.id('validate-btn')).click();
      await driver.wait(until.elementLocated(By.css('#rdf-result .validation-section')), 10000);
      const resultText = await driver.findElement(By.id('rdf-result')).getText();
      assert.ok(resultText.includes('RDF Syntax'));
      assert.ok(resultText.includes('SHACL Syntax'));
    });

    console.log('=== All Usability Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runUsabilityTests();
