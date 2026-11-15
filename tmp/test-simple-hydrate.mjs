import puppeteer from "puppeteer-core";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
page.on("console", (msg) => console.log("CONSOLE", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("PAGEERROR", err.message));

for (const path of ["/", "/destinations", "/admin/login", "/admin/destinations"]) {
  const cookies = await page.cookies();
  if (path.startsWith("/admin/") && path !== "/admin/login" && !cookies.find(c => c.name === "session")) {
    await page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "domcontentloaded" });
    await page.type('input[name="email"]', "admin@travel.test");
    await page.type('input[name="password"]', "Admin@12345");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);
  }
  await page.goto(`http://127.0.0.1:3000${path}`, {
    waitUntil: "networkidle0",
    timeout: 90000,
  });
  await new Promise((r) => setTimeout(r, 2000));
  const info = await page.evaluate(() => {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    let roots = 0;
    try {
      for (const r of hook?.renderers?.values?.() || []) roots++;
    } catch {}
    // React 19 may put fiber on different keys
    function hasFiber(node) {
      for (const k of Object.getOwnPropertyNames(node)) {
        if (k.startsWith("__reactFiber") || k.startsWith("__reactContainer")) return k;
      }
      return null;
    }
    const bodyFiber = hasFiber(document.body);
    const htmlFiber = hasFiber(document.documentElement);
    let anyFiber = bodyFiber || htmlFiber;
    if (!anyFiber) {
      for (const el of document.querySelectorAll("body *")) {
        const k = hasFiber(el);
        if (k) {
          anyFiber = `${el.tagName}:${k}`;
          break;
        }
      }
    }
    return {
      path: location.pathname,
      renderers: roots || hook?.renderers?.size || 0,
      anyFiber,
      nextF: Array.isArray(window.__next_f) ? window.__next_f.length : typeof window.__next_f,
    };
  });
  console.log("PAGE", JSON.stringify(info));
}
await browser.close();
