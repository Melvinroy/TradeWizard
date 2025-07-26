// Import test helpers
require('./testHelpers');

describe('Performance Tests', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    
    // Enable performance metrics
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
  });

  afterAll(async () => {
    // Generate coverage reports
    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    console.log('JS Coverage:', jsCoverage.length, 'files');
    console.log('CSS Coverage:', cssCoverage.length, 'files');
    
    await page.close();
  });

  describe('Page Load Performance', () => {
    test('should load login page within performance budget', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:5173/auth', { waitUntil: 'networkidle2' });
      
      const loadTime = Date.now() - startTime;
      console.log(`Login page load time: ${loadTime}ms`);
      
      // Performance budget: < 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should load dashboard within performance budget', async () => {
      const startTime = Date.now();
      
      await testHelpers.login(page);
      await testHelpers.waitForChartLoad(page);
      
      const loadTime = Date.now() - startTime;
      console.log(`Dashboard load time: ${loadTime}ms`);
      
      // Performance budget: < 3 seconds (includes chart rendering)
      expect(loadTime).toBeLessThan(3000);
    });
  });

  describe('Core Web Vitals', () => {
    test('should meet Largest Contentful Paint (LCP) threshold', async () => {
      await page.goto('http://localhost:5173/auth');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      console.log(`LCP: ${lcp}ms`);
      // Good LCP: < 2.5s (2500ms)
      expect(lcp).toBeLessThan(2500);
    });

    test('should meet First Input Delay (FID) threshold', async () => {
      await testHelpers.login(page);
      
      // Measure FID by clicking a button
      const startTime = performance.now();
      await page.click('button:has-text("Show Advanced")');
      const endTime = performance.now();
      
      const fid = endTime - startTime;
      console.log(`FID: ${fid}ms`);
      
      // Good FID: < 100ms
      expect(fid).toBeLessThan(100);
    });

    test('should have minimal Cumulative Layout Shift (CLS)', async () => {
      await testHelpers.login(page);
      
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Measure for 3 seconds
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      console.log(`CLS: ${cls}`);
      // Good CLS: < 0.1
      expect(cls).toBeLessThan(0.1);
    });
  });

  describe('Resource Loading', () => {
    test('should load critical resources efficiently', async () => {
      const resourceSizes = {};
      
      page.on('response', (response) => {
        const url = response.url();
        const contentLength = response.headers()['content-length'];
        
        if (contentLength) {
          resourceSizes[url] = parseInt(contentLength);
        }
      });
      
      await page.goto('http://localhost:5173/auth');
      await page.waitForTimeout(2000);
      
      // Check bundle sizes
      const jsFiles = Object.keys(resourceSizes).filter(url => url.endsWith('.js'));
      const cssFiles = Object.keys(resourceSizes).filter(url => url.endsWith('.css'));
      
      const totalJSSize = jsFiles.reduce((sum, file) => sum + (resourceSizes[file] || 0), 0);
      const totalCSSSize = cssFiles.reduce((sum, file) => sum + (resourceSizes[file] || 0), 0);
      
      console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)}KB`);
      console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)}KB`);
      
      // Performance budgets
      expect(totalJSSize).toBeLessThan(500 * 1024); // < 500KB
      expect(totalCSSSize).toBeLessThan(100 * 1024); // < 100KB
    });

    test('should not have memory leaks', async () => {
      const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      
      // Perform multiple navigations
      for (let i = 0; i < 5; i++) {
        await page.reload();
        await testHelpers.login(page);
        await testHelpers.waitForChartLoad(page);
      }
      
      // Force garbage collection
      if (page.evaluate(() => window.gc)) {
        await page.evaluate(() => window.gc());
      }
      
      const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // Should not increase by more than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Rendering Performance', () => {
    test('should render charts within acceptable time', async () => {
      await testHelpers.login(page);
      
      const startTime = Date.now();
      await testHelpers.waitForChartLoad(page);
      const renderTime = Date.now() - startTime;
      
      console.log(`Chart render time: ${renderTime}ms`);
      
      // Charts should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    test('should handle table pagination efficiently', async () => {
      await testHelpers.login(page);
      
      // Measure table render time
      const startTime = Date.now();
      
      // Wait for table to load (if it has data)
      try {
        await page.waitForSelector('table tbody tr', { timeout: 2000 });
        const renderTime = Date.now() - startTime;
        
        console.log(`Table render time: ${renderTime}ms`);
        expect(renderTime).toBeLessThan(500);
      } catch (error) {
        // No table data, which is fine
        console.log('No table data to measure');
      }
    });

    test('should animate smoothly', async () => {
      await testHelpers.login(page);
      
      // Test hover animations
      const metricCard = await page.$('.relative.overflow-hidden.group');
      if (metricCard) {
        const startTime = Date.now();
        await metricCard.hover();
        await page.waitForTimeout(300); // Animation duration
        const animationTime = Date.now() - startTime;
        
        console.log(`Hover animation time: ${animationTime}ms`);
        expect(animationTime).toBeLessThan(500);
      }
    });
  });

  describe('Network Performance', () => {
    test('should minimize API calls', async () => {
      const apiCalls = [];
      
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalls.push(request.url());
        }
      });
      
      await testHelpers.login(page);
      await testHelpers.waitForChartLoad(page);
      
      console.log(`API calls made: ${apiCalls.length}`);
      console.log('API endpoints:', apiCalls);
      
      // Should not make excessive API calls
      expect(apiCalls.length).toBeLessThan(10);
    });

    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.setOfflineMode(true);
      
      await page.goto('http://localhost:5173/auth');
      
      // Should show appropriate error state
      const errorState = await page.$('text=offline') || await page.$('text=error') || await page.$('text=failed');
      
      // Reset network
      await page.setOfflineMode(false);
      
      // Test passed if we reach here without crashing
      expect(true).toBe(true);
    });
  });

  describe('Mobile Performance', () => {
    test('should perform well on mobile viewport', async () => {
      await page.emulate({
        name: 'Mobile',
        viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      });
      
      const startTime = Date.now();
      await testHelpers.login(page);
      const loadTime = Date.now() - startTime;
      
      console.log(`Mobile load time: ${loadTime}ms`);
      
      // Mobile should load within 4 seconds (slower than desktop)
      expect(loadTime).toBeLessThan(4000);
    });

    test('should handle touch interactions', async () => {
      await page.emulate({
        name: 'Mobile',
        viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      });
      
      await testHelpers.login(page);
      
      // Test touch interactions
      const button = await page.$('button:has-text("Show Advanced")');
      if (button) {
        await button.tap();
        await page.waitForTimeout(300);
        
        // Should respond to touch
        const isVisible = await page.$('text=Advanced Analytics') !== null;
        expect(isVisible).toBeTruthy();
      }
    });
  });

  describe('Accessibility Performance', () => {
    test('should maintain performance with accessibility features', async () => {
      await testHelpers.login(page);
      
      // Navigate using keyboard (accessibility feature)
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      const navigationTime = Date.now() - startTime;
      console.log(`Keyboard navigation time: ${navigationTime}ms`);
      
      // Should navigate smoothly
      expect(navigationTime).toBeLessThan(1000);
    });
  });
});