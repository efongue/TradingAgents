import puppeteer from 'puppeteer';

async function testVoirClick() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  console.log('Navigating to ScannerPage with latest scan...');
  await page.goto('http://127.0.0.1:8787/?page=scanner', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Find the first "Voir" button in the scanner table
  const voirButtons = await page.$$('.scanner-report-button');
  console.log(`Found ${voirButtons.length} "Voir" button(s).`);

  if (voirButtons.length > 0) {
    console.log('Clicking the first "Voir" button...');
    await voirButtons[0].click();
    await new Promise(r => setTimeout(r, 800));

    const currentUrl = page.url();
    console.log('Current URL after click:', currentUrl);

    await page.screenshot({
      path: '/Users/etienne/.gemini/antigravity/brain/6999d0f1-0dac-4321-80d2-473bcf2e0ee8/scanner_voir_click_success.png',
      fullPage: false
    });
    console.log('Saved scanner_voir_click_success.png');
  } else {
    console.log('No Voir button found on initial load.');
  }

  await browser.close();
}

testVoirClick().catch(console.error);
