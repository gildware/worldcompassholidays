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
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) =>
  logs.push(`[pageerror] ${err.message}\n${err.stack || ""}`),
);
page.on("requestfailed", (req) =>
  logs.push(`[reqfail] ${req.url()} ${req.failure()?.errorText || ""}`),
);

await page.setViewport({ width: 1400, height: 900 });

await page.goto(`${BASE}/admin/login?next=%2Fadmin%2Fdestinations`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForSelector('input[name="email"]');
await page.type('input[name="email"]', "admin@travel.test");
await page.type('input[name="password"]', "Admin@12345");
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
]);
console.log("login url", page.url());

await page.waitForFunction(
  () => document.body?.innerText?.includes("Destinations"),
  { timeout: 30000 },
);
await new Promise((r) => setTimeout(r, 3000));

const probe = await page.evaluate(() => {
  const content = document.querySelector(".ops-cc .content");
  const add = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("Add destination"),
  );
  // React 19 / Next may store internals differently
  const allKeys = [];
  const walk = (el, depth = 0) => {
    if (!el || depth > 4) return;
    for (const k of Object.getOwnPropertyNames(el)) {
      if (k.includes("react") || k.includes("React") || k.startsWith("__")) {
        allKeys.push(`${el.tagName}:${k}`);
      }
    }
    walk(el.firstElementChild, depth + 1);
  };
  walk(document.body);

  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  let rendererCount = 0;
  try {
    rendererCount = hook?.renderers?.size || 0;
  } catch {}

  return {
    url: location.href,
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    contentClass: content?.className || null,
    contentPe: content ? getComputedStyle(content).pointerEvents : null,
    switches: document.querySelectorAll('[role="switch"]').length,
    addExists: Boolean(add),
    rendererCount,
    reactKeys: [...new Set(allKeys)].slice(0, 40),
    nextF: Array.isArray(window.__next_f) ? window.__next_f.length : typeof window.__next_f,
    hasErrorNext: Boolean(document.querySelector("nextjs-portal")),
  };
});
console.log("probe", JSON.stringify(probe, null, 2));

// Try Open navigation (AdminShell client button)
const openNav = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    (b.getAttribute("aria-label") || "").includes("Open navigation"),
  );
  if (!btn) return { found: false };
  btn.click();
  return {
    found: true,
    sidebarOpen: document.querySelector(".sidebar.open") != null,
    scrimShow: document.querySelector(".scrim.show") != null,
  };
});
console.log("openNav", openNav);

// Try Add destination
await page.evaluate(() => {
  const add = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("Add destination"),
  );
  add?.click();
});
await new Promise((r) => setTimeout(r, 800));
const afterAdd = await page.evaluate(() => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  createHint: document.body.innerText.includes("Add a top-level place"),
}));
console.log("afterAdd", afterAdd);

// Capture screenshot for debugging
await page.screenshot({
  path: "tmp/admin-destinations-click-test.png",
  fullPage: false,
});

console.log("=== LOGS ===");
for (const line of logs.slice(-50)) console.log(line);

await browser.close();
process.exit(afterAdd.dialogs > 0 ? 0 : 2);
