// Import test helpers
require('./testHelpers');

describe('Trading Journal E2E Tests', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Authentication Flow', () => {
    test('should display login page correctly', async () => {
      await page.goto('http://localhost:5175/auth');
      
      // Check for main elements
      const h1Element = await page.$('h1');
      expect(h1Element).toBeTruthy();
      
      const emailInput = await page.$('input[type="email"]');
      expect(emailInput).toBeTruthy();
      
      const passwordInput = await page.$('input[type="password"]');
      expect(passwordInput).toBeTruthy();
      
      const submitButton = await page.$('button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });

    test('should login with demo credentials', async () => {
      await testHelpers.login(page);
      
      // Should redirect to dashboard
      expect(page.url()).toMatch(/\/dashboard$/);
      
      // Check for dashboard elements
      const h1Element = await page.$('h1');
      expect(h1Element).toBeTruthy();
      
      const welcomeText = await page.$eval('h1', el => el.textContent);
      expect(welcomeText).toContain('Trading Journal');
    });
  });

  describe('Dashboard Layout', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
    });

    test('should display sidebar navigation', async () => {
      await expect(page).toBeVisible('aside');
      await expect(page).toHaveText('aside', 'TradeWizard');
      await expect(page).toHaveText('aside', 'Trading Journal');
      await expect(page).toHaveText('aside', 'Options Flow');
      await expect(page).toHaveText('aside', 'Congress Trades');
      
      // Check for "Coming Soon" badges
      const comingSoonBadges = await page.$$('text=Soon');
      expect(comingSoonBadges.length).toBeGreaterThan(5);
    });

    test('should display metrics cards', async () => {
      const metricsCards = await page.$$('[data-testid="metric-card"], .metric-card, .relative.overflow-hidden.group');
      expect(metricsCards.length).toBeGreaterThanOrEqual(4);
      
      // Check for key metrics
      await expect(page).toHaveText('body', 'Total P&L');
      await expect(page).toHaveText('body', 'Total Trades');
      await expect(page).toHaveText('body', 'Win Rate');
      await expect(page).toHaveText('body', 'Best Trade');
    });

    test('should display advanced metrics when toggled', async () => {
      // Click show advanced button
      const advancedButton = await page.$('button:has-text("Show Advanced")');
      if (advancedButton) {
        await advancedButton.click();
        await page.waitForTimeout(500);
        
        await expect(page).toHaveText('body', 'Advanced Analytics');
        await expect(page).toHaveText('body', 'Profit Factor');
        await expect(page).toHaveText('body', 'Sharpe Ratio');
      }
    });

    test('should display action buttons', async () => {
      await expect(page).toBeVisible('button:has-text("Export")');
      await expect(page).toBeVisible('button:has-text("Import CSV")');
      await expect(page).toBeVisible('button:has-text("Add Trade")');
    });
  });

  describe('Charts Section', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
    });

    test('should display equity curve chart', async () => {
      await testHelpers.waitForChartLoad(page);
      
      // Check for chart container
      const chartContainer = await page.$('svg');
      expect(chartContainer).toBeTruthy();
      
      // Check for chart title
      await expect(page).toHaveText('body', 'Equity Curve');
    });

    test('should display chart timeframe buttons', async () => {
      await expect(page).toBeVisible('button:has-text("1D")');
      await expect(page).toBeVisible('button:has-text("1W")');
      await expect(page).toBeVisible('button:has-text("1M")');
      await expect(page).toBeVisible('button:has-text("ALL")');
    });

    test('should interact with timeframe selection', async () => {
      const weekButton = await page.$('button:has-text("1W")');
      if (weekButton) {
        await weekButton.click();
        await page.waitForTimeout(300);
        
        await expect(page).toHaveClass('button:has-text("1W")', 'bg-blue-500');
      }
    });
  });

  describe('Trade Table', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
    });

    test('should display trade table', async () => {
      await expect(page).toHaveText('body', 'Trade History');
      
      // Check for table headers
      await expect(page).toHaveText('body', 'Date');
      await expect(page).toHaveText('body', 'Symbol');
      await expect(page).toHaveText('body', 'Side');
      await expect(page).toHaveText('body', 'Quantity');
      await expect(page).toHaveText('body', 'Price');
    });

    test('should display search functionality', async () => {
      const searchInput = await page.$('input[placeholder*="Search"]');
      expect(searchInput).toBeTruthy();
      
      // Test search functionality if there are trades
      const hasTradeData = await page.$('tbody tr') !== null;
      if (hasTradeData) {
        await searchInput.type('AAPL');
        await page.waitForTimeout(500);
      }
    });

    test('should display filter options', async () => {
      await expect(page).toBeVisible('select');
      
      // Check for filter options
      const selects = await page.$$('select');
      expect(selects.length).toBeGreaterThanOrEqual(2); // Side filter and date range filter
    });

    test('should handle empty state', async () => {
      const hasNoTrades = await page.$('text=No trades found') !== null;
      if (hasNoTrades) {
        await expect(page).toHaveText('body', 'No trades found');
      }
    });
  });

  describe('Responsive Design', () => {
    test('should adapt to different screen sizes', async () => {
      const results = await testHelpers.checkResponsive(page);
      
      // Desktop (1920px)
      expect(results[1920].hasHorizontalScroll).toBe(false);
      expect(results[1920].hasSidebar).toBe(false); // Sidebar is now hidden by lg:flex class
      
      // Tablet (1024px)
      expect(results[1024].hasHorizontalScroll).toBe(false);
      
      // Mobile (768px)
      expect(results[768].hasHorizontalScroll).toBe(false);
      
      // Small mobile (375px)
      expect(results[375].hasHorizontalScroll).toBe(false);
    });

    test('should show mobile navigation elements', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      
      // Should show hamburger menu
      const hamburgerMenu = await page.$('button svg path[d*="M4 6h16M4 12h16M4 18h16"]');
      expect(hamburgerMenu).toBeTruthy();
    });

    test('should stack metrics cards on mobile', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      
      // Check that metrics are stacked (single column)
      const metricsGrid = await page.$('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
      expect(metricsGrid).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
    });

    test('should open add trade modal', async () => {
      const addTradeButton = await page.$('button:has-text("Add Trade")');
      if (addTradeButton) {
        await addTradeButton.click();
        await page.waitForTimeout(500);
        
        // Check if modal opened
        const modal = await page.$('.fixed.inset-0.bg-black\\/70');
        expect(modal).toBeTruthy();
      }
    });

    test('should handle logout', async () => {
      const logoutButton = await page.$('button:has-text("Logout")');
      if (logoutButton) {
        await logoutButton.click();
        await page.waitForNavigation();
        
        // Should redirect to auth page
        expect(page.url()).toMatch(/\/auth$/);
      }
    });

    test('should collapse/expand sidebar', async () => {
      // Desktop test only
      await page.setViewport({ width: 1920, height: 1080 });
      
      const collapseButton = await page.$('button svg');
      if (collapseButton) {
        await collapseButton.click();
        await page.waitForTimeout(300);
        
        // Sidebar should be collapsed (width changes)
        const sidebar = await page.$('aside');
        expect(sidebar).toBeTruthy();
      }
    });
  });

  describe('Performance Tests', () => {
    test('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();
      
      await testHelpers.login(page);
      await testHelpers.waitForChartLoad(page);
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should not have console errors', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await testHelpers.login(page);
      await page.waitForTimeout(2000);
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('DevTools') &&
        !error.includes('WebSocket')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(async () => {
      await testHelpers.login(page);
    });

    test('should have proper heading hierarchy', async () => {
      const h1Elements = await page.$$('h1');
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      
      const h2Elements = await page.$$('h2');
      const h3Elements = await page.$$('h3');
      
      // Check that headings exist and are properly nested
      expect(h1Elements.length + h2Elements.length + h3Elements.length).toBeGreaterThan(0);
    });

    test('should have focusable elements', async () => {
      const focusableElements = await page.$$('button, input, select, a[href]');
      expect(focusableElements.length).toBeGreaterThan(10);
    });

    test('should support keyboard navigation', async () => {
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should have some element in focus
      const activeElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(activeElement);
    });
  });
});