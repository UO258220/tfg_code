const { performance } = require('node:perf_hooks');
const {
  assert,
  BASE_URL,
  By,
  until,
  createDriver,
} = require('../e2e/test-utils');

const ITERATIONS = Number(process.env.LOAD_ITERATIONS || 50);
const EMPTY_MSG = 'Enter RDF data and SHACL shapes to validate.';
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

async function measureMainPageLoad(driver) {
  await runTimedScenario('LOAD-1: Main page opens successfully', async () => {
    await driver.get(TARGET_BASE_URL);
    await driver.wait(until.elementLocated(By.css('h1')), 10000);
    await driver.wait(until.elementLocated(By.id('validate-btn')), 10000);
    const title = await driver.getTitle();
    assert.ok(title.includes('WASM RDF Validator'));
  });
}

async function measureAboutPageLoad(driver) {
  await runTimedScenario('LOAD-2: About page opens successfully', async () => {
    await driver.get(new URL('about.html', TARGET_BASE_URL).toString());
    await driver.wait(until.elementLocated(By.css('.about-shell')), 10000);
    const title = await driver.getTitle();
    assert.ok(title.includes('About'));
  });
}

async function measureEmptyValidation(driver) {
  await runTimedScenario('LOAD-3: Empty validation returns no-response message', async () => {
    await driver.get(TARGET_BASE_URL);
    await driver.wait(until.elementLocated(By.id('rdf-input')), 10000);
    await driver.wait(until.elementLocated(By.id('shacl-input')), 10000);
    await driver.wait(until.elementLocated(By.id('validate-btn')), 10000);
    await driver.executeScript(
      "document.getElementById('rdf-input').value = ''; document.getElementById('shacl-input').value = '';"
    );

    const initialText = await driver.findElement(By.id('rdf-result')).getText();
    assert.ok(initialText.includes('Enter RDF data'));

    await driver.findElement(By.id('validate-btn')).click();
    await driver.wait(async () => {
      const resultText = await driver.findElement(By.id('rdf-result')).getText();
      return resultText.trim() === EMPTY_MSG;
    }, 10000);
  });
}

async function runPageTimingLoadTests() {
  let driver;

  try {
    driver = await createDriver();

    console.log('\n=== Page Timing Load Tests ===\n');
    console.log(`Iterations per scenario: ${ITERATIONS}\n`);
    console.log(`Target base URL: ${TARGET_BASE_URL}\n`);

    await measureMainPageLoad(driver);
    await measureAboutPageLoad(driver);
    await measureEmptyValidation(driver);

    console.log('=== Page Timing Load Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Load test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runPageTimingLoadTests();
