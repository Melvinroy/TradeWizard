// Simple test to verify the testing setup works

describe('Simple Test', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    await page.close();
  });

  test('should navigate to login page', async () => {
    try {
      await page.goto('http://localhost:5175/auth', { waitUntil: 'networkidle2' });
      
      // Check if page loaded
      const title = await page.title();
      console.log('Page title:', title);
      
      // Check for basic elements
      const emailInput = await page.$('input[type="email"]');
      expect(emailInput).toBeTruthy();
      
      console.log('✅ Login page loaded successfully');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  });

  test('should have TradeWizard branding', async () => {
    try {
      await page.goto('http://localhost:5175/auth', { waitUntil: 'networkidle2' });
      
      // Look for TradeWizard text
      const content = await page.content();
      expect(content).toContain('TradeWizard');
      
      console.log('✅ TradeWizard branding found');
    } catch (error) {
      console.error('❌ Branding test failed:', error.message);
      throw error;
    }
  });
});