const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });

    try {
        const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
        await page.screenshot({ path: 'debug_screenshot.png' });
        console.log('Screenshot saved to debug_screenshot.png');
    } catch (err) {
        console.log('GOTO ERR:', err.message);
    }
    await browser.close();
})();
