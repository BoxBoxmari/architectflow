import fs from "node:fs/promises";
import path from "node:path";

// Run with:
//   npx playwright node scripts/smoke_discover_pdf.mjs
// Requires dev server running (see terminal output for port).

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4028";
const OUT_DIR = process.env.OUT_DIR ?? path.join(process.cwd(), "tmp");

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();

  await page.goto(`${BASE_URL}/discover/`, { waitUntil: "networkidle" });

  // Step 1: select first function and first service
  await page.waitForSelector("#g1-fn-grid button, #g1-fn-grid [role='button']", {
    timeout: 30_000,
  });
  await page.locator("#g1-fn-grid button, #g1-fn-grid [role='button']").first().click();

  await page.waitForSelector("#g1-svc-list button, #g1-svc-list [role='button']", {
    timeout: 30_000,
  });
  await page.locator("#g1-svc-list button, #g1-svc-list [role='button']").first().click();

  await page.locator("#discover-next").click();

  // Step 2: pick up to 2 goals
  await page.waitForSelector("#g1-goals-grid button, #g1-goals-grid [role='button']", {
    timeout: 30_000,
  });
  const goals = page.locator("#g1-goals-grid button, #g1-goals-grid [role='button']");
  const goalCount = await goals.count();
  if (goalCount > 0) {
    await goals.nth(0).click();
    if (goalCount > 1) await goals.nth(1).click();
  }

  await page.locator("#discover-next").click();

  // Step 3: open first area + select first task chip (best-effort)
  await page.waitForSelector("#g1-area-list", { timeout: 30_000 });
  // Try click first accordion header button if exists.
  const areaHeader = page.locator(
    "#g1-area-list button[aria-expanded], #g1-area-list .g1-area button, #g1-area-list summary",
  );
  if ((await areaHeader.count()) > 0) {
    await areaHeader.first().click();
  }

  const chip = page.locator(
    "#g1-area-list button.g1-task-chip, #g1-area-list .g1-task-chip button",
  );
  if ((await chip.count()) > 0) {
    await chip.first().click();
  }

  await page.waitForSelector("#discover-next:not([disabled])", { timeout: 30_000 });
  await page.locator("#discover-next").click();

  // Step 4: export PDF (download)
  await page.waitForSelector("#g1-download", { timeout: 30_000 });
  const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
  await page.locator("#g1-download").click();
  const download = await downloadPromise;

  const suggested = download.suggestedFilename();
  const savePath = path.join(OUT_DIR, suggested);
  await download.saveAs(savePath);

  // Basic sanity checks (bytes > 1KB)
  const st = await fs.stat(savePath);
  if (st.size < 1024) {
    throw new Error(`Downloaded PDF too small: ${st.size} bytes at ${savePath}`);
  }

  console.log(`OK: downloaded ${suggested} (${st.size} bytes) -> ${savePath}`);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

