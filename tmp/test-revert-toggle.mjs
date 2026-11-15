import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "domcontentloaded" });
await page.type('input[name="email"]', "admin@travel.test");
await page.type('input[name="password"]', "Admin@12345");
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "domcontentloaded" }),
]);
await page.goto("http://127.0.0.1:3000/admin/destinations", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => {
  for (const el of document.querySelectorAll("body *")) {
    if (el.tagName === "NEXTJS-PORTAL") continue;
    for (const k of Object.getOwnPropertyNames(el)) {
      if (k.startsWith("__reactFiber")) return true;
    }
  }
  return false;
}, { timeout: 30000 });
const result = await page.evaluate(async () => {
  const sw = document.querySelector('[role="switch"]');
  const before = sw?.getAttribute("aria-checked");
  if (before === "true") {
    sw.click();
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { before, after: sw?.getAttribute("aria-checked") };
});
console.log(result);
await browser.close();
