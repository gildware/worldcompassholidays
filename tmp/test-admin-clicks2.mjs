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
page.on("console", (msg) => {
  const t = msg.text();
  if (t.includes("Download the React") || t.includes("HMR") || t.includes("WebSocket") || t.includes("Fast Refresh") || msg.type() === "error") {
    logs.push(`[${msg.type()}] ${t}`);
  }
});
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

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

// Wait for hydration: any non-portal react fiber
await page.waitForFunction(
  () => {
    for (const el of document.querySelectorAll("body *")) {
      if (el.tagName === "NEXTJS-PORTAL") continue;
      for (const k of Object.getOwnPropertyNames(el)) {
        if (k.startsWith("__reactFiber") || k.startsWith("__reactProps")) return true;
      }
    }
    return false;
  },
  { timeout: 45000 },
).catch(() => null);

await new Promise((r) => setTimeout(r, 1000));

const probe = await page.evaluate(() => {
  let pageFiber = false;
  for (const el of document.querySelectorAll("body *")) {
    if (el.tagName === "NEXTJS-PORTAL") continue;
    for (const k of Object.getOwnPropertyNames(el)) {
      if (k.startsWith("__reactFiber") || k.startsWith("__reactProps")) {
        pageFiber = true;
        break;
      }
    }
    if (pageFiber) break;
  }
  return {
    url: location.href,
    pageFiber,
    switches: document.querySelectorAll('[role="switch"]').length,
    addExists: [...document.querySelectorAll("button")].some((b) =>
      (b.textContent || "").includes("Add destination"),
    ),
  };
});
console.log("probe", JSON.stringify(probe));

// Click Add destination
await page.evaluate(() => {
  const add = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("Add destination"),
  );
  add?.click();
});
await new Promise((r) => setTimeout(r, 800));
const afterAdd = await page.evaluate(() => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  createHint: document.body.innerText.includes("Add a top-level place") ||
    document.body.innerText.toLowerCase().includes("create destination") ||
    document.body.innerText.toLowerCase().includes("new destination") ||
    [...document.querySelectorAll('[role="dialog"]')].some((d) =>
      (d.textContent || "").toLowerCase().includes("destination"),
    ),
  dialogText: [...document.querySelectorAll('[role="dialog"]')]
    .map((d) => (d.textContent || "").slice(0, 200))
    .join(" | "),
}));
console.log("afterAdd", afterAdd);

// Close dialog if open, then toggle first switch
if (afterAdd.dialogs > 0) {
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
}

const toggle = await page.evaluate(async () => {
  const sw = document.querySelector('[role="switch"]');
  if (!sw) return { found: false };
  const before = sw.getAttribute("aria-checked");
  sw.click();
  await new Promise((r) => setTimeout(r, 1500));
  return {
    found: true,
    before,
    after: sw.getAttribute("aria-checked"),
    changed: sw.getAttribute("aria-checked") !== before,
  };
});
console.log("toggle", toggle);

// Open navigation
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
console.log("logs", logs.slice(-20));

const ok = probe.pageFiber && afterAdd.dialogs > 0;
await browser.close();
process.exit(ok ? 0 : 2);
