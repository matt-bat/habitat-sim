import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROOT_VIEWS = ["Planet", "Origins", "Biosphere", "Lineages", "Timeline", "Lab"] as const;
const WIZARD_STEPS = ["Start", "System", "World", "Surface", "Origin", "Plan", "Review"] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function openWizard(page: Page) {
  await page.getByRole("button", { name: "Lab", exact: true }).click();
  await page.getByRole("button", { name: /Launch Sim Wizard/i }).click();
  await expect(page.getByTestId("sim-wizard")).toBeVisible();
}

async function wcagViolations(page: Page, scene: string) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return result.violations.map((violation) => ({
    scene,
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(" "))
  }));
}

async function reflowMetrics(page: Page, surfaceSelector: string) {
  return page.locator(surfaceSelector).evaluate((surface) => {
    const documentOverflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth;
    const surfaceOverflow = surface.scrollWidth - surface.clientWidth;
    const clippedControls = [...surface.querySelectorAll<HTMLElement>("button:enabled,input:enabled,select:enabled,a[href]")].flatMap((control) => {
      const style = getComputedStyle(control);
      const box = control.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || box.width === 0 || box.height === 0) return [];
      return box.left < -1 || box.right > window.innerWidth + 1
        ? [{ label: control.getAttribute("aria-label") || control.textContent?.trim().slice(0, 80), left: box.left, right: box.right }]
        : [];
    });
    return { documentOverflow, surfaceOverflow, clippedControls };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("meets automated WCAG A and AA rules in every root workspace", async ({ page }) => {
  test.setTimeout(90_000);
  const violations = [];
  for (const view of ROOT_VIEWS) {
    await page.getByRole("button", { name: view, exact: true }).click();
    await expect(page.getByTestId(`${view.toLowerCase()}-view`)).toBeVisible();
    violations.push(...await wcagViolations(page, `root/${view}`));
  }
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("meets automated WCAG A and AA rules throughout the Sim Wizard", async ({ page }) => {
  test.setTimeout(90_000);
  const violations = [];
  await openWizard(page);
  const progress = page.getByRole("navigation", { name: "Simulation setup progress" });
  for (const step of WIZARD_STEPS) {
    await progress.getByRole("button", { name: new RegExp(step, "i") }).click();
    violations.push(...await wcagViolations(page, `wizard/${step}`));
  }
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("keeps every root workspace operable at the 320 CSS-pixel reflow width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const navigation = await page.locator(".rail").evaluate((rail) => ({
    horizontalOverflow: rail.scrollWidth - rail.clientWidth,
    undersizedTargets: [...rail.querySelectorAll<HTMLElement>("button")].flatMap((button) => {
      const style = getComputedStyle(button);
      const box = button.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || box.width === 0 || box.height === 0) return [];
      return box.width < 44 || box.height < 44 ? [{ label: button.textContent?.trim(), width: box.width, height: box.height }] : [];
    })
  }));
  expect(navigation.horizontalOverflow, "primary navigation must not require horizontal scrolling").toBeLessThanOrEqual(1);
  expect(navigation.undersizedTargets, "primary navigation must retain 44 CSS-pixel touch targets").toEqual([]);
  for (const view of ROOT_VIEWS) {
    await page.getByRole("button", { name: view, exact: true }).click();
    const selector = `[data-testid="${view.toLowerCase()}-view"]`;
    await expect(page.locator(selector)).toBeVisible();
    expect(await reflowMetrics(page, selector), `${view} must reflow without clipped content or controls`).toEqual({
      documentOverflow: 0,
      surfaceOverflow: 0,
      clippedControls: []
    });
  }
});

test("keeps every Sim Wizard step operable at the 320 CSS-pixel reflow width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openWizard(page);
  const progress = page.getByRole("navigation", { name: "Simulation setup progress" });
  for (const step of WIZARD_STEPS) {
    await progress.getByRole("button", { name: new RegExp(step, "i") }).click();
    const metrics = await reflowMetrics(page, "[data-testid=sim-wizard]");
    expect(metrics.documentOverflow, `${step} must not overflow the document`).toBeLessThanOrEqual(1);
    expect(metrics.surfaceOverflow, `${step} must not overflow the Wizard surface`).toBeLessThanOrEqual(1);
    expect(metrics.clippedControls, `${step} must not clip interactive controls`).toEqual([]);
  }
});
