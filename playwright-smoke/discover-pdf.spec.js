// Run with:
//   npx playwright test playwright-smoke/discover-pdf.spec.js --reporter=line
// Requires dev server running on BASE_URL (default http://localhost:4028).

const { test, expect } = require("playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const BASE_URL = process.env.BASE_URL || "http://localhost:4028";

test("discover gate1 can export pdf", async ({ page }) => {
  const outDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto(`${BASE_URL}/discover/`, { waitUntil: "networkidle" });

  // Step 1
  await page.locator("#g1-fn-grid button, #g1-fn-grid [role='button']").first().click();
  await page.locator("#g1-svc-list button, #g1-svc-list [role='button']").first().click();
  await page.locator("#discover-next").click();

  // Step 2
  const goals = page.locator("#g1-goals-grid button, #g1-goals-grid [role='button']");
  const goalCount = await goals.count();
  if (goalCount > 0) {
    await goals.nth(0).click();
    if (goalCount > 1) await goals.nth(1).click();
  }
  await page.locator("#discover-next").click();

  // Step 3 (best-effort: open first area, pick first task)
  await page.waitForSelector("#g1-area-list");
  const areaHeader = page.locator(
    "#g1-area-list button[aria-expanded], #g1-area-list .g1-area button, #g1-area-list summary",
  );
  if ((await areaHeader.count()) > 0) await areaHeader.first().click();
  const chip = page.locator(
    "#g1-area-list button.g1-task-chip, #g1-area-list .g1-task-chip button",
  );
  if ((await chip.count()) > 0) await chip.first().click();
  await expect(page.locator("#discover-next")).toBeEnabled();
  await page.locator("#discover-next").click();

  // Step 4 export
  await page.waitForSelector("#g1-download");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#g1-download")]);

  const savePath = path.join(outDir, download.suggestedFilename());
  await download.saveAs(savePath);

  const stat = fs.statSync(savePath);
  expect(stat.size).toBeGreaterThan(1024);
});

