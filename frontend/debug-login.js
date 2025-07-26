// Debug login process to see what's happening
import puppeteer from 'puppeteer';

async function debugLogin() {
  console.log('🔍 Debugging login process...');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 1000, // Slow down for debugging
    devtools: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen to all network requests
  page.on('request', request => {
    console.log('📤 Request:', request.method(), request.url());
  });

  page.on('response', response => {
    console.log('📥 Response:', response.status(), response.url());
  });

  // Listen to console logs
  page.on('console', msg => {
    console.log('🖥️ Console:', msg.type(), msg.text());
  });

  try {
    // Navigate to login
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:5175/auth', { waitUntil: 'networkidle2' });
    console.log('✅ Login page loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/debug-1-login-page.png' });

    // Check current URL
    console.log('Current URL:', page.url());

    // Check if credentials are already filled
    console.log('2. Checking credentials...');
    await page.waitForSelector('input[type="email"]');
    
    const emailValue = await page.$eval('input[type="email"]', el => el.value);
    const passwordValue = await page.$eval('input[type="password"]', el => el.value);
    
    console.log('Email field value:', emailValue);
    console.log('Password field value:', passwordValue ? '[FILLED]' : '[EMPTY]');
    
    // Only fill if empty
    if (!emailValue) {
      console.log('Filling email...');
      await page.type('input[type="email"]', 'demo@tradewizard.com');
    }
    
    if (!passwordValue) {
      console.log('Filling password...');
      await page.type('input[type="password"]', 'demo123');
    } else {
      console.log('Credentials already filled, proceeding...');
    }

    // Take screenshot before submit
    await page.screenshot({ path: 'tests/screenshots/debug-2-credentials-filled.png' });

    // Click submit button
    console.log('3. Clicking submit...');
    await page.click('button[type="submit"]');

    // Wait a bit and see what happens
    await page.waitForTimeout(3000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'tests/screenshots/debug-3-after-submit.png' });

    // Check URL again
    console.log('URL after submit:', page.url());

    // Check for any error messages
    const errorElement = await page.$('[class*="error"], .text-red-500, .text-red-600');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log('❌ Error message found:', errorText);
    }

    // Check if there are any loading indicators
    const loadingElement = await page.$('[class*="loading"], [class*="spinner"]');
    if (loadingElement) {
      console.log('⏳ Loading indicator found');
    }

    // Wait longer to see if anything happens
    console.log('4. Waiting for potential navigation...');
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('✅ Navigation occurred to:', page.url());
    } catch (navError) {
      console.log('⚠️ No navigation detected within timeout');
    }

    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/debug-4-final-state.png' });

    // Check localStorage for auth token
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    console.log('Access token in localStorage:', token ? 'Present' : 'Not found');

    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'tests/screenshots/debug-error.png' });
  } finally {
    await browser.close();
  }
}

debugLogin().catch(console.error);