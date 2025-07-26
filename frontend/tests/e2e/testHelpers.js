// Test helpers for Puppeteer E2E tests

const testHelpers = {
  // Login with demo credentials
  async login(page) {
    await page.goto('http://localhost:5175/auth');
    
    // Wait for form to load
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    
    // Fill in demo credentials
    await page.type('input[type="email"]', 'demo@tradewizard.com');
    await page.type('input[type="password"]', 'demo123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation();
    await page.waitForSelector('h1:has-text("Trading Journal")', { timeout: 10000 });
  },

  // Wait for chart to load
  async waitForChartLoad(page) {
    try {
      // Wait for SVG chart element
      await page.waitForSelector('svg', { timeout: 5000 });
      
      // Wait a bit more for chart to render
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Chart may not be present or took too long to load');
    }
  },

  // Check responsive behavior across different viewports
  async checkResponsive(page) {
    const viewports = [375, 768, 1024, 1366, 1920];
    const results = {};
    
    for (const width of viewports) {
      await page.setViewport({ width, height: 1080 });
      await page.reload();
      
      // Wait for page to stabilize
      await page.waitForTimeout(500);
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      // Check if sidebar is visible (for larger screens)
      const sidebarVisible = await page.$('aside:not(.hidden)') !== null;
      
      // Check if elements are properly stacked on mobile
      const metricsGrid = await page.$('.grid');
      const hasProperGrid = metricsGrid !== null;
      
      results[width] = {
        hasHorizontalScroll,
        hasSidebar: sidebarVisible,
        hasProperGrid,
        width
      };
    }
    
    return results;
  },

  // Custom matchers for better assertions
  async expectToHaveText(page, selector, expectedText) {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element ${selector} not found`);
    }
    
    const text = await page.evaluate(el => el.textContent, element);
    if (!text.includes(expectedText)) {
      throw new Error(`Expected "${expectedText}" but got "${text}"`);
    }
  },

  async expectToBeVisible(page, selector) {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element ${selector} not found`);
    }
    
    const isVisible = await page.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0';
    }, element);
    
    if (!isVisible) {
      throw new Error(`Element ${selector} is not visible`);
    }
  },

  async expectToHaveClass(page, selector, className) {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element ${selector} not found`);
    }
    
    const hasClass = await page.evaluate((el, cls) => {
      return el.classList.contains(cls);
    }, element, className);
    
    if (!hasClass) {
      throw new Error(`Element ${selector} does not have class ${className}`);
    }
  }
};

// Make available for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testHelpers;
}

// Make available for browser
if (typeof window !== 'undefined') {
  window.testHelpers = testHelpers;
}

// Make available as global for tests
global.testHelpers = testHelpers;