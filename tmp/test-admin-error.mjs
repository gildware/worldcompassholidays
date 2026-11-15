import puppeteer from "puppeteer-core";

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
const failed = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) =>
  logs.push(`[pageerror] ${err.message}\n${err.stack || ""}`),
);
page.on("requestfailed", (req) =>
  failed.push(`${req.url()} :: ${req.failure()?.errorText || ""}`),
);
page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/_next/") || url.includes("hmr") || res.status() >= 400) {
    logs.push(`[resp ${res.status()}] ${url.slice(0, 180)}`);
  }
});

await page.setViewport({ width: 1400, height: 900 });

await page.goto(`${BASE}/admin/login?next=%2Fadmin%2Fdestinations`, {
  waitUntil: "networkidle0",
  timeout: 90000,
});
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', "admin@travel.test");
await page.type('input[name="password"]', "Admin@12345");
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "networkidle0", timeout: 90000 }),
]);

await new Promise((r) => setTimeout(r, 4000));

const probe = await page.evaluate(() => {
  const portal = document.querySelector("nextjs-portal");
  const dialogs = [...document.querySelectorAll("[data-nextjs-dialog], [data-nextjs-toast], nextjs-portal *")]
    .slice(0, 30)
    .map((el) => ({
      tag: el.tagName,
      text: (el.textContent || "").slice(0, 300),
      attrs: [...el.attributes].map((a) => `${a.name}=${a.value}`).slice(0, 8),
    }));

  const scripts = [...document.scripts].map((s) => ({
    src: s.src || null,
    type: s.type || null,
    len: (s.textContent || "").length,
    hasNextF: (s.textContent || "").includes("__next_f"),
  }));

  // Check for react fiber props on root
  const root = document.querySelector("#__next") || document.body;
  const rootKeys = Object.getOwnPropertyNames(root).filter(
    (k) => k.startsWith("__react") || k.includes("react"),
  );

  return {
    title: document.title,
    portalHtml: portal ? portal.outerHTML.slice(0, 2000) : null,
    dialogs,
    bodyTextStart: (document.body.innerText || "").slice(0, 800),
    scripts: scripts.slice(0, 40),
    scriptCount: scripts.length,
    nextFType: typeof window.__next_f,
    nextFLen: Array.isArray(window.__next_f) ? window.__next_f.length : null,
    nextFSample: Array.isArray(window.__next_f)
      ? window.__next_f.slice(0, 3).map((x) => JSON.stringify(x).slice(0, 200))
      : null,
    rootKeys,
    hasWebpack: typeof window.__webpack_require__ !== "undefined",
    hasTurbopack: typeof window.__turbopack_require__ !== "undefined" || typeof window.TURBOPACK !== "undefined",
  };
});

console.log(JSON.stringify({ probe, failed: failed.slice(0, 40), logs: logs.slice(-80) }, null, 2));
await page.screenshot({ path: "tmp/admin-error-overlay.png", fullPage: true });
await browser.close();
