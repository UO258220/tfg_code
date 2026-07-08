const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:1234/';  // Editable como sea preciso
const INPUTS_DIR = path.join(__dirname, '..', 'inputs');

function readInputFile(fileName) {
  return fs.readFileSync(path.join(INPUTS_DIR, fileName), 'utf8');
}

async function createDriver() {
  return new Builder().forBrowser('chrome').build();
}

async function runTest(name, fn) {
  process.stdout.write(`✓ ${name}\n`);
  await fn();
  process.stdout.write('  PASSED\n\n');
}

async function loadHome(driver, baseUrl = BASE_URL) {
  await driver.get(baseUrl);
  await driver.wait(until.elementLocated(By.id('rdf-input')), 60000);
  await driver.wait(until.elementLocated(By.id('shacl-input')), 60000);
  await driver.wait(until.elementLocated(By.id('validate-btn')), 60000);
}

async function setInputs(driver, rdfText, shaclText) {
  await driver.executeScript(
    `
      document.getElementById('rdf-input').value = arguments[0];
      document.getElementById('shacl-input').value = arguments[1];
    `,
    rdfText,
    shaclText,
  );
}

async function validateInputs(driver, rdfText, shaclText, baseUrl = BASE_URL) {
  await loadHome(driver, baseUrl);
  await setInputs(driver, rdfText, shaclText);
  await driver.findElement(By.id('validate-btn')).click();
  await driver.wait(async () => {
    const text = await driver.findElement(By.id('rdf-result')).getText();
    return text.includes('RDF Conformance');
  }, 60000);
}

async function getResultState(driver) {
  const result = await driver.findElement(By.id('rdf-result'));
  const className = await result.getAttribute('class');
  const text = await result.getText();
  const validSections = await driver.findElements(By.css('#rdf-result .validation-section.status-valid'));
  const invalidSections = await driver.findElements(By.css('#rdf-result .validation-section.status-invalid'));

  return {
    className,
    text,
    validSectionCount: validSections.length,
    invalidSectionCount: invalidSections.length,
  };
}

module.exports = {
  assert,
  BASE_URL,
  By,
  until,
  createDriver,
  readInputFile,
  runTest,
  loadHome,
  setInputs,
  validateInputs,
  getResultState,
};