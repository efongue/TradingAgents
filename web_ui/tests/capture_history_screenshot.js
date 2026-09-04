import puppeteer from 'puppeteer';

async function captureHistory() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  console.log('Navigating to HistoryPage...');
  await page.goto('http://127.0.0.1:8787/?page=history', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: '/Users/etienne/.gemini/antigravity/brain/6999d0f1-0dac-4321-80d2-473bcf2e0ee8/history_live_sync_screenshot.png',
    fullPage: false
  });
  console.log('Saved history_live_sync_screenshot.png');

  await browser.close();
}

captureHistory().catch(console.error);
