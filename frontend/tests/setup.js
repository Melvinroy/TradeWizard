// Global test setup for Puppeteer
// Note: expect is automatically available in Jest

// Custom matchers for better assertions
expect.extend({
  async toBeVisible(page, selector) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      return {
        message: () => `Expected element "${selector}" to be visible`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Expected element "${selector}" to be visible, but it was not found or not visible`,
        pass: false,
      };
    }
  },

  async toHaveText(page, selector, expectedText) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const actualText = await page.$eval(selector, el => el.textContent.trim());
      const pass = actualText.includes(expectedText);
      
      return {
        message: () => pass 
          ? `Expected element "${selector}" not to contain text "${expectedText}"`
          : `Expected element "${selector}" to contain text "${expectedText}", but got "${actualText}"`,
        pass,
      };
    } catch (error) {
      return {
        message: () => `Element "${selector}" not found`,
        pass: false,
      };
    }
  },

  async toHaveClass(page, selector, className) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const classes = await page.$eval(selector, el => el.className);
      const pass = classes.includes(className);
      
      return {
        message: () => pass
          ? `Expected element "${selector}" not to have class "${className}"`
          : `Expected element "${selector}" to have class "${className}", but got "${classes}"`,
        pass,
      };
    } catch (error) {
      return {
        message: () => `Element "${selector}" not found`,
        pass: false,
      };
    }
  }
});

// Helper functions
global.testHelpers = {
  async login(page) {
    await page.goto('http://localhost:5175/auth');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'demo@tradewizard.com');
    await page.type('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  },

  async waitForChartLoad(page) {
    await page.waitForSelector('svg', { timeout: 10000 });
    await page.waitForTimeout(1000); // Allow chart to fully render
  },

  async takeScreenshotOnFailure(page, testName) {
    if (process.env.TAKE_SCREENSHOTS !== 'false') {
      const screenshotPath = `tests/screenshots/${testName}-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    }
  },

  async checkResponsive(page, breakpoints = [1920, 1024, 768, 375]) {
    const results = {};
    
    for (const width of breakpoints) {
      await page.setViewport({ width, height: 1080 });
      await page.waitForTimeout(500); // Allow responsive changes
      
      const screenshot = await page.screenshot({ fullPage: true });
      results[width] = {
        screenshot,
        hasHorizontalScroll: await page.evaluate(() => document.body.scrollWidth > window.innerWidth),
        hasSidebar: await page.$('.hidden.lg\\:flex') !== null,
      };
    }
    
    return results;
  }
};

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});