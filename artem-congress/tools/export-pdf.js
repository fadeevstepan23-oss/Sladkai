// PDF для отправки: каждый слайд — страница 1920×1080 в финальном состоянии анимаций.
//   node artem-congress/tools/export-pdf.js            — с пометками черновика
//   node artem-congress/tools/export-pdf.js --clean    — без пометок
// Нужен Playwright (npm i -D playwright) или глобальная установка.
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const clean = process.argv.includes('--clean');
  const root = path.resolve(__dirname, '..');
  const out = path.join(root, 'dist', clean ? 'presentation-clean.pdf' : 'presentation.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(root, 'index.html') + '?print' + (clean ? '&clean' : ''));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(path.relative(process.cwd(), out));
})();
