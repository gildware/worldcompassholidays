import puppeteer from "puppeteer-core";
import fs from "fs";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://127.0.0.1:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) =>
  logs.push(`[pageerror] ${err.message}\n${(err.stack || "").slice(0, 800)}`),
);
await page.evaluateOnNewDocument(() => {
  window.addEventListener("unhandledrejection", (e) => {
    console.error(
      "[unhandledrejection]",
      String(e.reason?.stack || e.reason || e),
    );
  });
  const origPush = Array.prototype.push;
  Object.defineProperty(window, "__next_f_debug", {
    value: { pushes: 0, resets: [] },
    configurable: true,
  });
  let _f;
  Object.defineProperty(window, "__next_f", {
    configurable: true,
    enumerable: true,
    get() {
      return _f;
    },
    set(v) {
      window.__next_f_debug.resets.push({
        type: typeof v,
        len: Array.isArray(v) ? v.length : null,
        stack: new Error().stack?.split("\n").slice(0, 6).join(" | "),
      });
      _f = v;
      if (Array.isArray(v)) {
        const p = v.push.bind(v);
        v.push = (...args) => {
          window.__next_f_debug.pushes += 1;
          return p(...args);
        };
      }
    },
  });
});

await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', "admin@travel.test");
await page.type('input[name="password"]', "Admin@12345");
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
]);
await page.goto(`${BASE}/admin/destinations`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 5000));

const html = await page.content();
fs.writeFileSync("tmp/admin-destinations.html", html);

const probe = await page.evaluate(() => {
  const inline = [...document.scripts]
    .filter((s) => !s.src)
    .map((s) => (s.textContent || "").slice(0, 200));

  // Find react root containers in Next 13+
  const candidates = [
    document.documentElement,
    document.body,
    ...document.querySelectorAll("[data-reactroot], #__next, body > div"),
  ];
  const fiberInfo = candidates.slice(0, 10).map((el) => {
    const keys = Object.getOwnPropertyNames(el).filter(
      (k) => k.includes("react") || k.includes("React") || k.startsWith("__"),
    );
    return { tag: el.tagName, id: el.id, keys };
  });

  return {
    debug: window.__next_f_debug,
    nextFLen: Array.isArray(window.__next_f) ? window.__next_f.length : typeof window.__next_f,
    inlineStarts: inline,
    fiberInfo,
    sw: navigator.serviceWorker?.controller?.scriptURL || null,
  };
});

console.log(JSON.stringify({ probe, logs: logs.slice(-60) }, null, 2));
await browser.close();
