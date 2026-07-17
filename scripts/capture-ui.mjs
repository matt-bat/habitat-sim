import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const outputDir = resolve(process.argv[2] || "artifacts/ui");
const baseURL = process.env.HABITAT_BASE_URL || "http://127.0.0.1:5174";
const views = [
  { id: "planet", label: "Planet" },
  { id: "origins", label: "Origins" },
  { id: "biosphere", label: "Biosphere" },
  { id: "lineages", label: "Lineages" },
  { id: "timeline", label: "Timeline" },
  { id: "lab", label: "Lab" }
];
const profiles = [
  { name: "desktop", viewport: { width: 1728, height: 1117 }, isMobile: false, hasTouch: false },
  { name: "mobile", viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const captures = [];

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: 1,
      isMobile: profile.isMobile,
      hasTouch: profile.hasTouch,
      colorScheme: "dark",
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Date.now = () => 1_721_234_567_890;
    });
    await page.goto(baseURL, { waitUntil: "networkidle" });

    for (const view of views) {
      await page.getByRole("button", { name: view.label, exact: true }).click();
      await page.locator(`[data-testid="${view.id}-view"]`).waitFor({ state: "visible" });
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll(".workspace-body,.view-stack,.lab-column,.lineage-inspector,.event-inspector").forEach((element) => element.scrollTo(0, 0));
      });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        document.querySelectorAll(".workspace-body,.view-stack,.lab-column,.lineage-inspector,.event-inspector").forEach((element) => element.scrollTo(0, 0));
      });
      const path = resolve(outputDir, `${profile.name}-${view.id}.png`);
      await page.screenshot({ path, fullPage: !profile.isMobile, animations: "disabled" });
      captures.push({ profile: profile.name, view: view.id, path });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

process.stdout.write(`${JSON.stringify({ baseURL, captures }, null, 2)}\n`);
