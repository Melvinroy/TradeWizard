// Detailed UI inspection to identify all the problems
import puppeteer from 'puppeteer';
import fs from 'fs';

class DetailedUIInspector {
  constructor() {
    this.browser = null;
    this.page = null;
    this.issues = [];
  }

  async setup() {
    console.log('🔍 Starting Detailed UI Inspection...');
    
    if (!fs.existsSync('tests/screenshots/inspection')) {
      fs.mkdirSync('tests/screenshots/inspection', { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
      devtools: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--disable-web-security'
      ],
    });

    this.page = await browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Console Error:', msg.text());
        this.issues.push(`Console Error: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', error => {
      console.log('🔴 Page Error:', error.message);
      this.issues.push(`Page Error: ${error.message}`);
    });
  }

  async loginAndNavigate() {
    console.log('\n🔐 Logging in and navigating to dashboard...');
    
    await this.page.goto('http://localhost:5178/auth', { waitUntil: 'networkidle2' });
    
    // Login
    const emailValue = await this.page.$eval('input[type="email"]', el => el.value).catch(() => '');
    const passwordValue = await this.page.$eval('input[type="password"]', el => el.value).catch(() => '');
    
    if (!emailValue) await this.page.type('input[type="email"]', 'demo@tradewizard.com');
    if (!passwordValue) await this.page.type('input[type="password"]', 'demo123');
    
    await this.page.click('button[type="submit"]');
    
    // Wait for dashboard
    await this.page.waitForResponse(response => 
      response.url().includes('/api/v1/dashboard/stats') && response.status() === 200,
      { timeout: 15000 }
    );
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Successfully navigated to dashboard');
  }

  async inspectLayout() {
    console.log('\n📐 === LAYOUT INSPECTION ===');
    
    // Take initial full-page screenshot
    await this.page.screenshot({ 
      path: 'tests/screenshots/inspection/01-full-page-initial.png', 
      fullPage: true 
    });
    
    // Check viewport dimensions vs content
    const dimensions = await this.page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight
    }));
    
    console.log('📏 Page Dimensions:');
    console.log(`  Viewport: ${dimensions.viewportWidth}x${dimensions.viewportHeight}`);
    console.log(`  Document: ${dimensions.documentWidth}x${dimensions.documentHeight}`);
    console.log(`  Body: ${dimensions.bodyWidth}x${dimensions.bodyHeight}`);
    
    // Check for horizontal scroll
    if (dimensions.documentWidth > dimensions.viewportWidth) {
      this.issues.push(`Horizontal scroll detected: document width ${dimensions.documentWidth} > viewport ${dimensions.viewportWidth}`);
      console.log('❌ Horizontal scroll detected');
    } else {
      console.log('✅ No horizontal scroll');
    }
  }

  async inspectNavigation() {
    console.log('\n🧭 === NAVIGATION INSPECTION ===');
    
    // Check for sidebar/navbar
    const sidebar = await this.page.$('aside, nav, .sidebar, .navbar, [role="navigation"]');
    if (sidebar) {
      console.log('✅ Navigation element found');
      
      // Get sidebar position and visibility
      const sidebarInfo = await this.page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex
        };
      }, sidebar);
      
      console.log('📍 Navigation Info:', sidebarInfo);
      
      if (!sidebarInfo.visible) {
        this.issues.push('Navigation is not visible (display/visibility/opacity issue)');
        console.log('❌ Navigation is not visible');
      }
      
      if (sidebarInfo.position.left < -100 || sidebarInfo.position.top < -100) {
        this.issues.push('Navigation is positioned off-screen');
        console.log('❌ Navigation is positioned off-screen');
      }
      
      // Take screenshot of navigation area
      await sidebar.screenshot({ path: 'tests/screenshots/inspection/02-navigation-area.png' });
      
    } else {
      this.issues.push('No navigation element found');
      console.log('❌ No navigation element found');
    }
  }

  async inspectButtons() {
    console.log('\n🔘 === BUTTON INSPECTION ===');
    
    const buttons = await this.page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    let visibleButtons = 0;
    let hiddenButtons = 0;
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      
      const buttonInfo = await this.page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          text: el.textContent?.trim() || el.getAttribute('aria-label') || 'No text',
          visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex,
          backgroundColor: style.backgroundColor,
          color: style.color
        };
      }, button);
      
      if (buttonInfo.visible && buttonInfo.position.width > 0 && buttonInfo.position.height > 0) {
        visibleButtons++;
        console.log(`✅ Button ${i + 1}: "${buttonInfo.text}" - Visible`);
      } else {
        hiddenButtons++;
        console.log(`❌ Button ${i + 1}: "${buttonInfo.text}" - Hidden/Invisible`);
        this.issues.push(`Button "${buttonInfo.text}" is not visible - ${JSON.stringify(buttonInfo)}`);
      }
    }
    
    console.log(`📊 Button Summary: ${visibleButtons} visible, ${hiddenButtons} hidden`);
  }

  async inspectCharts() {
    console.log('\n📊 === CHARTS INSPECTION ===');
    
    // Look for chart elements
    const chartElements = await this.page.$$('svg, canvas, .chart, [class*="chart"]');
    console.log(`Found ${chartElements.length} potential chart elements`);
    
    for (let i = 0; i < chartElements.length; i++) {
      const chart = chartElements[i];
      
      const chartInfo = await this.page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex
        };
      }, chart);
      
      console.log(`📈 Chart ${i + 1} (${chartInfo.tagName}):`, chartInfo);
      
      // Check for overlapping
      if (i > 0) {
        const prevChart = chartElements[i - 1];
        const prevInfo = await this.page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        }, prevChart);
        
        // Simple overlap detection
        const overlap = !(chartInfo.position.left > prevInfo.left + prevInfo.width ||
                         prevInfo.left > chartInfo.position.left + chartInfo.position.width ||
                         chartInfo.position.top > prevInfo.top + prevInfo.height ||
                         prevInfo.top > chartInfo.position.top + chartInfo.position.height);
        
        if (overlap) {
          this.issues.push(`Chart ${i + 1} overlaps with Chart ${i}`);
          console.log(`❌ Chart ${i + 1} overlaps with Chart ${i}`);
        }
      }
      
      // Take individual chart screenshot
      if (chartInfo.visible && chartInfo.position.width > 0 && chartInfo.position.height > 0) {
        try {
          await chart.screenshot({ path: `tests/screenshots/inspection/03-chart-${i + 1}.png` });
        } catch (error) {
          console.log(`⚠️ Could not screenshot chart ${i + 1}:`, error.message);
        }
      }
    }
  }

  async scrollAndCapture() {
    console.log('\n📜 === SCROLL AND CAPTURE ===');
    
    // Get total page height
    const pageHeight = await this.page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await this.page.evaluate(() => window.innerHeight);
    
    console.log(`Page height: ${pageHeight}px, Viewport: ${viewportHeight}px`);
    
    let currentScroll = 0;
    let sectionNumber = 1;
    
    // Capture sections while scrolling
    while (currentScroll < pageHeight) {
      await this.page.evaluate((scrollTop) => {
        window.scrollTo(0, scrollTop);
      }, currentScroll);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for scroll
      
      await this.page.screenshot({ 
        path: `tests/screenshots/inspection/04-section-${sectionNumber}.png`,
        clip: { x: 0, y: 0, width: 1920, height: Math.min(viewportHeight, pageHeight - currentScroll) }
      });
      
      console.log(`📸 Captured section ${sectionNumber} at scroll position ${currentScroll}px`);
      
      currentScroll += viewportHeight;
      sectionNumber++;
    }
    
    // Return to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Final full page screenshot
    await this.page.screenshot({ 
      path: 'tests/screenshots/inspection/05-final-full-page.png', 
      fullPage: true 
    });
  }

  async analyzeZIndexIssues() {
    console.log('\n🏗️ === Z-INDEX ANALYSIS ===');
    
    const elements = await this.page.$$('*');
    const zIndexMap = new Map();
    
    for (const element of elements.slice(0, 50)) { // Limit to first 50 elements
      const info = await this.page.evaluate(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          className: el.className,
          zIndex: style.zIndex,
          position: style.position,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        };
      }, element);
      
      if (info.zIndex !== 'auto' && info.zIndex !== '0') {
        zIndexMap.set(`${info.tagName}.${info.className}`, info);
      }
    }
    
    console.log('🏗️ Elements with custom z-index:');
    for (const [key, info] of zIndexMap) {
      console.log(`  ${key}: z-index ${info.zIndex}, position ${info.position}`);
    }
  }

  async generateReport() {
    console.log('\n📋 === GENERATING INSPECTION REPORT ===');
    
    const report = `# TradeWizard UI Inspection Report
Generated: ${new Date().toISOString()}

## Issues Found (${this.issues.length})
${this.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## Screenshots Generated
- 01-full-page-initial.png - Initial full page view
- 02-navigation-area.png - Navigation/sidebar area
- 03-chart-*.png - Individual chart screenshots
- 04-section-*.png - Page sections while scrolling
- 05-final-full-page.png - Final full page view

## Next Steps
${this.issues.length > 0 ? 
  'Fix the identified issues above, particularly:\n- Navigation visibility problems\n- Button visibility issues\n- Chart overlapping problems' : 
  'All major UI issues appear to be resolved!'}
`;

    fs.writeFileSync('tests/screenshots/inspection/inspection-report.md', report);
    console.log('📄 Report saved: tests/screenshots/inspection/inspection-report.md');
    
    console.log('\n🔍 INSPECTION SUMMARY:');
    console.log(`❌ Issues found: ${this.issues.length}`);
    if (this.issues.length > 0) {
      console.log('Top issues:');
      this.issues.slice(0, 5).forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async runFullInspection() {
    try {
      await this.setup();
      await this.loginAndNavigate();
      await this.inspectLayout();
      await this.inspectNavigation();
      await this.inspectButtons();
      await this.inspectCharts();
      await this.scrollAndCapture();
      await this.analyzeZIndexIssues();
      await this.generateReport();
      
      console.log('\n🎯 Detailed UI inspection complete!');
      console.log('📁 Check tests/screenshots/inspection/ for all evidence');
      
    } catch (error) {
      console.error('💥 Inspection failed:', error.message);
      this.issues.push(`Inspection error: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the inspection
const inspector = new DetailedUIInspector();
inspector.runFullInspection().catch(console.error);