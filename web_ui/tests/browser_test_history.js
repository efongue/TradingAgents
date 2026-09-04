import puppeteer from 'puppeteer';

async function testPages() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1380, height: 960 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[CONSOLE ${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE ERROR]: ${err.toString()}`));

  console.log('1. Testing http://127.0.0.1:8787/?page=history...');
  await page.goto('http://127.0.0.1:8787/?page=history', { waitUntil: 'networkidle0' });

  const kpiValues = await page.$$eval('.kpi-value', els => els.map(e => e.innerText));
  console.log('History KPIs:', kpiValues);

  console.log('2. Clicking first history row to open ResultPage...');
  await page.click('.history-table-row');
  await new Promise(r => setTimeout(r, 600));

  const resultTitle = await page.$eval('.result-heading h1', el => el.innerText);
  console.log('ResultPage Title:', resultTitle);

  const exportBtn = await page.$('.export-toggle-btn');
  console.log('Export & Partager button exists:', !!exportBtn);

  if (exportBtn) {
    await exportBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const items = await page.$$eval('.export-dropdown-item', els => els.map(e => e.innerText.replace(/\n/g, ' ')));
    console.log('Export Dropdown items:', items);
  }

  const bentoThesis = await page.$('.bento-thesis-hero');
  console.log('Bento Thesis card exists in Synthesis tab:', !!bentoThesis);

  console.log('Console logs during run:');
  consoleLogs.forEach(l => console.log(l));

  await browser.close();
}

testPages().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
