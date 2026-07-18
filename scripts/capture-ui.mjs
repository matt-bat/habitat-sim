import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const outputDir = resolve(process.argv[2] || "artifacts/ui");
const baseURL = process.env.HABITAT_BASE_URL || "http://127.0.0.1:5174";
const allProfiles = [
  { name: "wide-desktop-1920x1080", viewport: { width: 1920, height: 1080 }, isMobile: false, hasTouch: false },
  { name: "laptop-1440x900", viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: "compact-1280x800", viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false },
  { name: "tablet-768x1024", viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
  { name: "mobile-390x844", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
];
const profiles = process.env.HABITAT_PROFILE ? allProfiles.filter((item) => item.name === process.env.HABITAT_PROFILE) : allProfiles;
if (!profiles.length) throw new Error(`Unknown HABITAT_PROFILE: ${process.env.HABITAT_PROFILE}`);
const views = ["Planet", "Origins", "Biosphere", "Lineages", "Timeline", "Lab"];
const wizardSteps = { Start: "foundation", System: "system", World: "world", Surface: "surface", Origin: "origin", Plan: "evolution", Review: "review" };

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const captures = [];
const failures = [];

const settle = (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const slug = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");

async function resetScroll(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll(".workspace-body,.view-stack,.lab-column,.lineage-inspector,.event-inspector,.wizard-content,.impact-lens,.wizard-stage").forEach((element) => element.scrollTo(0, 0));
  });
}

async function measurements(page) {
  return page.evaluate(() => {
    const rootOverflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
    const selectors = [".workspace-body", ".wizard-shell", ".wizard-progress", ".wizard-stage", ".wizard-step-rail", ".wizard-content", ".impact-lens", ".wizard-footer", ".rail", ".transport"];
    const panels = selectors.flatMap((selector) => [...document.querySelectorAll(selector)].flatMap((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || box.width <= 0 || box.height <= 0) return [];
      return [{
        selector,
        horizontalOverflow: Math.max(0, element.scrollWidth - element.clientWidth),
        verticalOverflow: Math.max(0, element.scrollHeight - element.clientHeight),
        bounds: { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom }
      }];
    }));
    const focused = document.activeElement instanceof HTMLElement ? (() => { const box = document.activeElement.getBoundingClientRect(); return { tag: document.activeElement.tagName, label: document.activeElement.getAttribute("aria-label") || document.activeElement.textContent?.trim().slice(0, 80), bounds: { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom } }; })() : null;
    return { rootOverflow, panels, focused, viewport: { width: innerWidth, height: innerHeight }, scrollY: window.scrollY };
  });
}

async function writeCapture(page, profile, scene, depth) {
  const path = resolve(outputDir, `${profile.name}--${slug(scene)}--${depth}.png`);
  await page.screenshot({ path, fullPage: false, animations: "disabled" });
  const hash = createHash("sha256").update(await readFile(path)).digest("hex");
  const metrics = await measurements(page);
  captures.push({ profile: profile.name, viewport: profile.viewport, scene, depth, path, sha256: hash, reducedMotion: true, colorScheme: "dark", ...metrics });
  if (metrics.rootOverflow > 1) failures.push(`${profile.name}/${scene}/${depth}: root horizontal overflow ${metrics.rootOverflow}px`);
  for (const panel of metrics.panels) {
    if (panel.horizontalOverflow > 1) failures.push(`${profile.name}/${scene}/${depth}: ${panel.selector} horizontal overflow ${panel.horizontalOverflow}px`);
  }
}

async function captureScene(page, profile, scene, { preserveScroll = false, depthSweep = true } = {}) {
  if (!preserveScroll) await resetScroll(page);
  await settle(page);
  await writeCapture(page, profile, scene, "top");
  if (!depthSweep) return;
  const scrollables = await page.locator(".wizard-content:visible,.lab-column:visible,.view-stack:visible,.lineage-inspector:visible,.event-inspector:visible,.workspace-body:visible").all();
  const overflowing = [];
  for (const locator of scrollables) if (await locator.evaluate((element) => element.scrollHeight - element.clientHeight > 80)) overflowing.push(locator);
  if (!overflowing.length) return;
  for (const [depth, fraction] of [["middle", .5], ["bottom", 1]]) {
    for (const locator of overflowing) await locator.evaluate((element, ratio) => element.scrollTo(0, (element.scrollHeight - element.clientHeight) * ratio), fraction);
    await settle(page);
    await writeCapture(page, profile, scene, depth);
  }
}

async function rootView(page, label) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.locator(`[data-testid="${label.toLowerCase()}-view"]`).waitFor({ state: "visible" });
}

async function openWizard(page) {
  if (await page.getByTestId("sim-wizard").count()) return;
  await rootView(page, "Lab");
  await page.getByRole("button", { name: /Launch Sim Wizard/i }).click();
  await page.getByTestId("sim-wizard").waitFor({ state: "visible" });
}

async function wizardStep(page, label) {
  await openWizard(page);
  await page.getByRole("navigation", { name: "Simulation setup progress" }).getByRole("button", { name: new RegExp(label, "i") }).click();
  await page.getByTestId("sim-wizard").waitFor({ state: "visible" });
}

async function category(page, label) {
  await wizardStep(page, "Start");
  await page.getByRole("tab", { name: new RegExp(label, "i") }).click();
}

async function selectScenario(page, categoryName, scenarioName) {
  await category(page, categoryName);
  const card = page.locator(".scenario-card").filter({ has: page.getByRole("heading", { name: scenarioName, exact: true }) });
  await card.getByRole("button", { name: /Customize|Selected/i }).click();
}

async function clearPlannedEvents(page) {
  await wizardStep(page, "Plan");
  while (await page.locator(".planned-events article").count()) await page.locator(".planned-events article").first().getByRole("button", { name: /Remove/i }).click();
}

async function establishBiosphere(page) {
  if (await page.getByTestId("sim-wizard").count()) await page.getByRole("button", { name: "Planet", exact: true }).click();
  await rootView(page, "Planet");
  await page.getByLabel("Quick intervention").selectOption("microbial-seed");
  let lineages = 0;
  for (let attempt = 0; attempt < 260 && lineages < 4; attempt += 1) {
    await page.getByRole("button", { name: /intervene now/i }).click();
    if (attempt % 10 === 9) {
      await rootView(page, "Biosphere");
      const match = (await page.getByTestId("biosphere-view").innerText()).match(/(\d+) lineages/i);
      lineages = Number(match?.[1] || 0);
      await rootView(page, "Planet");
    }
  }
  return lineages;
}

async function runProfile(profile) {
  const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: 1, isMobile: profile.isMobile, hasTouch: profile.hasTouch, colorScheme: "dark", reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.addInitScript(() => { Date.now = () => 1_721_234_567_890; });
  await page.goto(baseURL, { waitUntil: "networkidle" });

  for (const label of views) { await rootView(page, label); await captureScene(page, profile, `root sterile ${label}`); }

  await rootView(page, "Lab");
  await page.getByText("Intervention", { exact: true }).locator("..").getByRole("combobox").selectOption("custom");
  await page.getByLabel("Cargo organics").fill("0.75"); await page.getByLabel("Cargo phosphorus").fill("0.45");
  await captureScene(page, profile, "lab custom material intervention");
  await page.getByRole("button", { name: /Save snapshot/i }).click();
  await captureScene(page, profile, "lab populated simulation snapshots");
  await page.locator('.file-button input[accept="application/json,.json"]').last().setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"invalid":true}') });
  await captureScene(page, profile, "lab import error feedback", { depthSweep: false });
  await page.waitForTimeout(3200);

  await openWizard(page);
  for (const [label, id] of Object.entries(wizardSteps)) { await wizardStep(page, label); await captureScene(page, profile, `wizard default ${id}`); }

  for (const [tab, scene] of [["Origin theories", "foundation origin theories"], ["Experimental", "foundation experimental worlds"], ["My presets", "foundation empty user library"]]) {
    await category(page, tab); await captureScene(page, profile, scene);
  }

  await selectScenario(page, "Experimental", "Circumbinary pulse shore");
  await wizardStep(page, "System");
  await captureScene(page, profile, "stellar system binary proxy");
  await page.getByRole("radio", { name: /Hierarchical triple/i }).click();
  await captureScene(page, profile, "stellar system hierarchical triple");
  const orbitHelp = page.getByRole("button", { name: "Science note: Orbital distance" });
  await orbitHelp.focus(); await orbitHelp.press("Enter");
  await captureScene(page, profile, "stellar adaptive science note", { preserveScroll: true, depthSweep: false });
  await page.keyboard.press("Escape");
  await page.getByRole("slider", { name: "Primary stellar mass", exact: true }).fill("2"); await page.getByRole("slider", { name: "System age", exact: true }).fill("13");
  await captureScene(page, profile, "stellar blocking validation");

  await selectScenario(page, "Earth history", "Late-Hadean shore analogue");
  await wizardStep(page, "World");
  const carbonHelp = page.getByRole("button", { name: "Science note: carbon availability" });
  await carbonHelp.focus(); await carbonHelp.press("Enter");
  await captureScene(page, profile, "planet element science note", { preserveScroll: true, depthSweep: false });
  await page.keyboard.press("Escape");

  await wizardStep(page, "Surface");
  const oxygenHelp = page.getByRole("button", { name: "Science note: O2 partial pressure" });
  await oxygenHelp.focus(); await oxygenHelp.press("Enter");
  await captureScene(page, profile, "atmosphere oxygen science note", { preserveScroll: true, depthSweep: false });
  await page.keyboard.press("Escape");
  await page.getByRole("spinbutton", { name: "O2 partial pressure", exact: true }).fill("0.05");
  await captureScene(page, profile, "atmosphere prelife oxygen warning");

  await wizardStep(page, "Origin");
  await page.getByRole("button", { name: /Hydrothermal gradients/i }).click();
  await captureScene(page, profile, "origin alkaline vent selection");
  const energyHelp = page.getByRole("button", { name: "Science note: energy" });
  await energyHelp.focus(); await energyHelp.press("Enter");
  await captureScene(page, profile, "origin adaptive protocol note", { preserveScroll: true, depthSweep: false });
  await page.keyboard.press("Escape");

  await clearPlannedEvents(page);
  await captureScene(page, profile, "intervention plan empty");
  await page.getByLabel("Planned intervention").selectOption("ice-comet"); await page.getByLabel("Intervention age").fill("300"); await page.getByRole("button", { name: /Add to timeline/i }).click();
  await captureScene(page, profile, "intervention plan populated");
  await page.getByLabel("Planned intervention").selectOption("fungal-spores"); await page.getByRole("button", { name: /Add to timeline/i }).click();
  await captureScene(page, profile, "intervention plan speculative biological cargo");

  await selectScenario(page, "Earth history", "Late-Hadean shore analogue");
  await wizardStep(page, "Review");
  await captureScene(page, profile, "review launch ready");
  await page.getByLabel("Preset name").fill("Audit shoreline preset");
  await captureScene(page, profile, "review save new preset form");
  await page.getByRole("button", { name: /Save as new preset/i }).click();
  await category(page, "My presets");
  await captureScene(page, profile, "foundation populated user library");
  const originalUserCard = page.locator(".user-preset-grid article").filter({ has: page.getByRole("heading", { name: "Audit shoreline preset", exact: true }) });
  await originalUserCard.getByRole("button", { name: /Duplicate/i }).click();
  await captureScene(page, profile, "user preset duplicated");
  await page.getByRole("button", { name: "Delete Audit shoreline preset", exact: true }).click();
  await captureScene(page, profile, "user preset delete confirmation", { depthSweep: false });
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
  await captureScene(page, profile, "user preset deleted undo available", { depthSweep: false });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await captureScene(page, profile, "user preset restored");
  await page.waitForTimeout(3200);

  await selectScenario(page, "Experimental", "Circumbinary pulse shore");
  await wizardStep(page, "Review");
  await captureScene(page, profile, "review multi-star caveat register");
  await selectScenario(page, "Experimental", "Cryogenic methane boundary case");
  await wizardStep(page, "Review");
  await captureScene(page, profile, "review outside-model acknowledgement");
  await page.locator(".boundary-ack input").check();
  await captureScene(page, profile, "review outside-model acknowledged");

  const livingLineages = await establishBiosphere(page);
  for (const label of ["Biosphere", "Lineages", "Timeline"]) { await rootView(page, label); await captureScene(page, profile, `root living ${label} ${livingLineages} lineages`); }

  if (consoleErrors.length) failures.push(`${profile.name}: console/page errors: ${consoleErrors.join(" | ")}`);
  await context.close();
}

try {
  for (const profile of profiles) await runProfile(profile);
} finally {
  await browser.close();
}

const manifest = { baseURL, generatedAt: new Date().toISOString(), profiles, canonicalScenes: [...new Set(captures.map((item) => item.scene))], captureCount: captures.length, failures, captures };
await writeFile(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ baseURL, outputDir, profileCount: profiles.length, sceneCount: manifest.canonicalScenes.length, captureCount: captures.length, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
