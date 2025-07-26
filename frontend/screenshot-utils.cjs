const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Generate datetime-based folder name
function generateScreenshotFolder(description = 'Screenshots') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  const folderName = `${year}-${month}-${day}_${hour}-${minute}_${description}`;
  const folderPath = path.join(__dirname, 'screenshots', folderName);
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  return folderPath;
}

// Screenshot utility class
class ScreenshotUtil {
  constructor(description = 'Test-Session') {
    this.folderPath = generateScreenshotFolder(description);
    this.browser = null;
    this.page = null;
  }
  
  async init() {
    console.log(`📁 Screenshots will be saved to: ${this.folderPath}`);
    
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => console.log('🖥️  CONSOLE:', msg.text()));
    this.page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));
  }
  
  async loginToDashboard() {
    console.log('🔐 Logging into TradeWizard...');
    
    await this.page.goto('http://localhost:5180', { waitUntil: 'networkidle2' });
    
    await this.page.waitForSelector('input[type="email"]');
    const emailInput = await this.page.$('input[type="email"]');
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('demo@tradewizard.com');
    
    const passwordInput = await this.page.$('input[type="password"]');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('demo123');
    
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Successfully logged in');
  }
  
  async takeScreenshot(name, options = {}) {
    const timestamp = new Date().toLocaleTimeString().replace(/:/g, '-');
    const filename = `${timestamp}_${name}.png`;
    const filepath = path.join(this.folderPath, filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: options.fullPage !== false, // Default to full page
      ...options 
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }
  
  async testResponsive() {
    console.log('📱 Testing responsive design...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1440, height: 900, name: 'desktop-medium' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await this.page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.takeScreenshot(`responsive-${viewport.name}`, { fullPage: false });
    }
    
    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
  }
  
  async createReadme(description, improvements = []) {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    const readmeContent = `# TradeWizard UI Screenshots - ${dateStr}

**Session**: ${description}  
**Date**: ${dateStr}, ${timeStr}  
**Purpose**: ${description}

## 📸 Screenshots in this session

${fs.readdirSync(this.folderPath)
  .filter(file => file.endsWith('.png'))
  .map(file => `- **${file}** - ${this.getScreenshotDescription(file)}`)
  .join('\n')}

## 🎉 Improvements Made

${improvements.map(improvement => `- ${improvement}`).join('\n')}

## 📁 File Organization

- **Folder**: \`${path.basename(this.folderPath)}/\`
- **Format**: \`YYYY-MM-DD_HH-MM_Description\`
- **Purpose**: Chronological organization of development sessions

---
*Generated automatically by screenshot-utils.cjs*`;

    const readmePath = path.join(this.folderPath, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log('📄 README.md created');
  }
  
  getScreenshotDescription(filename) {
    if (filename.includes('dashboard-full')) return 'Complete dashboard view';
    if (filename.includes('dashboard-viewport')) return 'Viewport-sized dashboard view';
    if (filename.includes('responsive-desktop')) return 'Desktop responsive test';
    if (filename.includes('responsive-tablet')) return 'Tablet responsive test';
    if (filename.includes('responsive-mobile')) return 'Mobile responsive test';
    if (filename.includes('login')) return 'Login page view';
    return 'Screenshot taken during testing';
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Export for use in other files
module.exports = { ScreenshotUtil, generateScreenshotFolder };

// Example usage function
async function exampleUsage() {
  const screenshots = new ScreenshotUtil('UI-Testing-Example');
  
  try {
    await screenshots.init();
    await screenshots.loginToDashboard();
    
    // Take various screenshots
    await screenshots.takeScreenshot('dashboard-full');
    await screenshots.takeScreenshot('dashboard-viewport', { fullPage: false });
    
    // Test responsive design
    await screenshots.testResponsive();
    
    // Create documentation
    await screenshots.createReadme('UI Testing and Improvements', [
      'Fixed sidebar width issues',
      'Improved content spacing',
      'Enhanced chart layouts',
      'Better responsive design'
    ]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await screenshots.close();
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}