import puppeteer from 'puppeteer';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1024 });

  console.log('Navigating to ResultPage NVDA...');
  await page.goto('http://127.0.0.1:8787/?page=history', { waitUntil: 'networkidle0' });
  await page.click('.history-table-row');
  await new Promise(r => setTimeout(r, 600));

  // Open first two polarity cards to see expanded clean text
  const polarityCards = await page.$$('.polarity-card-header');
  if (polarityCards.length > 1) {
    await polarityCards[0].click();
    await polarityCards[1].click();
    await new Promise(r => setTimeout(r, 300));
  }

  // 1. Screenshot of the full-width ResultPage (Vue Bento tab)
  await page.screenshot({
    path: '/Users/etienne/.gemini/antigravity/brain/6999d0f1-0dac-4321-80d2-473bcf2e0ee8/fullwidth_result_screenshot.png',
    fullPage: false
  });
  console.log('Saved fullwidth_result_screenshot.png');

  // 2. Click on "Déroulement & Métriques" tab
  const tabs = await page.$$('.tabs button');
  for (const tab of tabs) {
    const text = await (await tab.getProperty('innerText')).jsonValue();
    if (text.includes('Déroulement')) {
      await tab.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({
    path: '/Users/etienne/.gemini/antigravity/brain/6999d0f1-0dac-4321-80d2-473bcf2e0ee8/workflow_integrated_reliability_screenshot.png',
    fullPage: false
  });
  console.log('Saved workflow_integrated_reliability_screenshot.png');

  await browser.close();
}

captureScreenshots().catch(console.error);
