const { assert, BASE_URL, By, until, createDriver, runTest } = require('./test-utils');

async function runNavigationTests() {
  let driver;

  try {
    driver = await createDriver();

    console.log('\n=== Navigation Tests ===\n');

    await runTest('NAV-1: The page loads on the main screen', async () => {
      await driver.get(BASE_URL);
      await driver.wait(until.elementLocated(By.css('h1')), 10000);
      const title = await driver.getTitle();
      assert.ok(title.includes('WASM RDF Validator'));
    });

    await runTest('NAV-2: Clicking on docs goes to github UO258220', async () => {
      await driver.wait(until.elementLocated(By.id('topbar-docs')), 10000);
      const docsLink = await driver.findElement(By.id('topbar-docs'));
      const docsHref = await docsLink.getAttribute('href');
      assert.ok(docsHref.includes('github.com/UO258220/tfg_code'));
    });

    await runTest('NAV-3: Clicking on about goes to the about page', async () => {
      const aboutLink = await driver.findElement(By.id('topbar-about'));
      await aboutLink.click();
      await driver.wait(until.elementLocated(By.css('.about-shell')), 10000);
      const aboutTitle = await driver.getTitle();
      assert.ok(aboutTitle.includes('About'));
    });

    await runTest('NAV-4: Clicking on home returns to the main page', async () => {
      const homeLink = await driver.findElement(By.id('topbar-home'));
      await homeLink.click();
      await driver.wait(until.elementLocated(By.css('.app-shell')), 10000);
      const homeTitle = await driver.getTitle();
      assert.ok(homeTitle.includes('WASM RDF Validator') && !homeTitle.includes('About'));
    });

    console.log('=== All Navigation Tests Completed Successfully ===\n');
  } catch (error) {
    console.error('\n✗ Test error:', error.message);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runNavigationTests();
