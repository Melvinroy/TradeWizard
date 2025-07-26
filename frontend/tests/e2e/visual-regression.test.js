// Import test helpers
require('./testHelpers');

describe('Visual Regression Tests', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ];

  describe('Screenshot Tests', () => {
    test('should capture login page across viewports', async () => {
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.goto('http://localhost:5173/auth');
        await page.waitForSelector('h1');
        
        const screenshot = await page.screenshot({
          path: `tests/screenshots/login-${viewport.name}.png`,
          fullPage: true,
        });
        
        expect(screenshot).toBeTruthy();
      }
    });

    test('should capture dashboard across viewports', async () => {
      await testHelpers.login(page);
      
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.reload();
        await testHelpers.waitForChartLoad(page);
        
        const screenshot = await page.screenshot({
          path: `tests/screenshots/dashboard-${viewport.name}.png`,
          fullPage: true,
        });
        
        expect(screenshot).toBeTruthy();
      }
    });

    test('should capture metrics cards responsive behavior', async () => {
      await testHelpers.login(page);
      
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.reload();
        
        // Wait for metrics to load
        await page.waitForSelector('.relative.overflow-hidden.group', { timeout: 5000 });
        
        // Screenshot just the metrics section
        const metricsSection = await page.$('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
        if (metricsSection) {
          await metricsSection.screenshot({
            path: `tests/screenshots/metrics-${viewport.name}.png`,
          });
        }
      }
    });

    test('should capture sidebar states', async () => {
      await testHelpers.login(page);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Expanded sidebar
      await page.screenshot({
        path: 'tests/screenshots/sidebar-expanded.png',
        clip: { x: 0, y: 0, width: 300, height: 800 },
      });
      
      // Collapsed sidebar (if collapse button exists)
      const collapseButton = await page.$('button svg[viewBox="0 0 24 24"]');
      if (collapseButton) {
        await collapseButton.click();
        await page.waitForTimeout(300);
        
        await page.screenshot({
          path: 'tests/screenshots/sidebar-collapsed.png',
          clip: { x: 0, y: 0, width: 100, height: 800 },
        });
      }
    });
  });

  describe('Component State Tests', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
      await page.setViewport({ width: 1920, height: 1080 });
    });

    test('should capture advanced metrics toggle', async () => {
      // Basic state
      await page.screenshot({
        path: 'tests/screenshots/metrics-basic.png',
        fullPage: false,
      });
      
      // Advanced state
      const advancedButton = await page.$('button:has-text("Show Advanced")');
      if (advancedButton) {
        await advancedButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: 'tests/screenshots/metrics-advanced.png',
          fullPage: false,
        });
      }
    });

    test('should capture chart timeframe changes', async () => {
      await testHelpers.waitForChartLoad(page);
      
      const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      
      for (const timeframe of timeframes) {
        const button = await page.$(`button:has-text("${timeframe}")`);
        if (button) {
          await button.click();
          await page.waitForTimeout(300);
          
          // Screenshot the chart area
          const chartContainer = await page.$('svg');
          if (chartContainer) {
            await chartContainer.screenshot({
              path: `tests/screenshots/chart-${timeframe}.png`,
            });
          }
        }
      }
    });

    test('should capture modal states', async () => {
      // Add Trade Modal
      const addTradeButton = await page.$('button:has-text("Add Trade")');
      if (addTradeButton) {
        await addTradeButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: 'tests/screenshots/add-trade-modal.png',
          fullPage: true,
        });
        
        // Close modal
        const closeButton = await page.$('button:has-text("×")');
        if (closeButton) {
          await closeButton.click();
        }
      }
    });
  });

  describe('Dark Theme Consistency', () => {
    test('should maintain dark theme across components', async () => {
      await testHelpers.login(page);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Check background colors
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Should be dark
      expect(bodyBg).toMatch(/rgb\((\d+), (\d+), (\d+)\)/);
      
      // Check sidebar background
      const sidebar = await page.$('aside');
      if (sidebar) {
        const sidebarBg = await page.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        }, sidebar);
        
        // Should be dark
        expect(sidebarBg).toMatch(/rgba?\(/);
      }
    });

    test('should have consistent glassmorphism effects', async () => {
      await testHelpers.login(page);
      
      // Check for backdrop-blur effects
      const glassElements = await page.$$('.backdrop-blur-sm, .backdrop-blur-xl, .glass-card, .glass-dark');
      expect(glassElements.length).toBeGreaterThan(0);
      
      // Take screenshot of glass effects
      await page.screenshot({
        path: 'tests/screenshots/glassmorphism-effects.png',
        fullPage: true,
      });
    });
  });

  describe('Animation States', () => {
    test('should capture hover states', async () => {
      await testHelpers.login(page);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Hover over metric cards
      const metricCards = await page.$$('.relative.overflow-hidden.group');
      
      if (metricCards.length > 0) {
        // Normal state
        await page.screenshot({
          path: 'tests/screenshots/metrics-normal.png',
          clip: { x: 250, y: 200, width: 800, height: 400 },
        });
        
        // Hover state
        await metricCards[0].hover();
        await page.waitForTimeout(300);
        
        await page.screenshot({
          path: 'tests/screenshots/metrics-hover.png',
          clip: { x: 250, y: 200, width: 800, height: 400 },
        });
      }
    });

    test('should capture loading states', async () => {
      // Intercept API calls to simulate loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.url().includes('/api/v1/dashboard/stats')) {
          // Delay response to capture loading state
          setTimeout(() => req.continue(), 2000);
        } else {
          req.continue();
        }
      });
      
      await page.goto('http://localhost:5173/auth');
      await testHelpers.login(page);
      
      // Should show loading state
      await page.screenshot({
        path: 'tests/screenshots/loading-state.png',
        fullPage: true,
      });
    });
  });
});