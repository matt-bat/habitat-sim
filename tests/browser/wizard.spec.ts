import { expect, test, type Page } from "@playwright/test";

async function openWizard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Lab", exact: true }).click();
  await page.getByRole("button", { name: /Launch Sim Wizard/i }).click();
  await expect(page.getByTestId("sim-wizard")).toBeVisible();
}

function progress(page: Page) {
  return page.getByRole("navigation", { name: "Simulation setup progress" });
}

test("offers research-linked presets and all seven reversible setup steps", async ({ page }) => {
  await openWizard(page);
  await expect(page.getByText("Hadean cooling analogue", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Late-Hadean shore analogue" })).toBeVisible();
  await page.getByRole("tab", { name: /Origin theories/i }).click();
  await expect(page.getByText("Spark: alkaline vents", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /Experimental/i }).click();
  await expect(page.getByText("Circumbinary pulse shore", { exact: true })).toBeVisible();

  for (const name of ["System", "World", "Surface", "Origin", "Plan", "Review", "Start"]) {
    await progress(page).getByRole("button", { name: new RegExp(name, "i") }).click();
    await expect(page.getByTestId("sim-wizard")).toHaveAttribute("data-step", name === "Start" ? "foundation" : name.toLowerCase() === "plan" ? "evolution" : name.toLowerCase() === "review" ? "review" : name.toLowerCase() === "surface" ? "surface" : name.toLowerCase());
  }
});

test("adapts multi-star preview and keyboard-accessible science guidance", async ({ page }) => {
  await openWizard(page);
  await page.getByRole("tab", { name: /Experimental/i }).click();
  const card = page.locator(".scenario-card").filter({ hasText: "Circumbinary pulse shore" });
  await card.getByRole("button", { name: /Customize/i }).click();
  await progress(page).getByRole("button", { name: /System/i }).click();
  await expect(page.getByRole("radio", { name: /Circumbinary proxy/i })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Multiple-star forcing is a proxy", { exact: true })).toBeVisible();
  const help = page.getByRole("button", { name: "Science note: Orbital distance" });
  await help.focus();
  await help.press("Enter");
  await expect(page.getByLabel("Orbital distance science note")).toContainText("S⊕");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Orbital distance science note")).toHaveCount(0);
});

test("saves a modified preset, survives reload, duplicates, deletes, and undoes", async ({ page }) => {
  await openWizard(page);
  const card = page.locator(".scenario-card").filter({ hasText: "Late-Hadean shore analogue" });
  await card.getByRole("button", { name: /Customize|Selected/i }).click();
  await progress(page).getByRole("button", { name: /Review/i }).click();
  await page.getByLabel("Preset name").fill("Matt's shoreline test");
  await page.getByRole("button", { name: /Save as new preset/i }).click();
  await page.reload();
  await page.getByRole("button", { name: "Lab", exact: true }).click();
  await page.getByRole("button", { name: /Launch Sim Wizard/i }).click();
  await page.getByRole("tab", { name: /My presets/i }).click();
  const userCard = page.locator(".user-preset-grid article").filter({ hasText: "Matt's shoreline test" });
  await expect(userCard).toBeVisible();
  await userCard.getByRole("button", { name: /Duplicate/i }).click();
  await expect(page.getByText("Matt's shoreline test copy", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Delete Matt's shoreline test", exact: true }).click();
  await expect(page.getByRole("alertdialog", { name: /Confirm preset deletion/i })).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("Matt's shoreline test", { exact: true })).toBeVisible();
});

test("launches only from reviewed configuration with planned interventions", async ({ page }) => {
  await openWizard(page);
  await progress(page).getByRole("button", { name: /Plan/i }).click();
  await page.getByLabel("Planned intervention").selectOption("ice-comet");
  await page.getByLabel("Intervention age").fill("300");
  await page.getByRole("button", { name: /Add to timeline/i }).click();
  await expect(page.locator(".planned-events")).toContainText("Ice-rich comet");
  await progress(page).getByRole("button", { name: /Review/i }).click();
  await page.getByRole("button", { name: /Launch deterministic simulation/i }).click();
  await expect(page.getByTestId("sim-wizard")).toHaveCount(0);
  await expect(page.getByTestId("planet-view")).toBeVisible();
  await page.getByRole("button", { name: "Lab", exact: true }).click();
  await expect(page.getByTestId("lab-view")).toBeVisible();
});

test("keeps every wizard step inside a compact mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWizard(page);
  for (const name of ["Start", "System", "World", "Surface", "Origin", "Plan", "Review"]) {
    await progress(page).getByRole("button", { name: new RegExp(name, "i") }).click();
    const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
    expect(overflow, `${name} wizard step has horizontal overflow`).toBeLessThanOrEqual(1);
    const footer = await page.locator(".wizard-footer").boundingBox();
    expect(footer?.width).toBeLessThanOrEqual(390);
    const stage = await page.locator(".wizard-stage").boundingBox();
    const step = await page.locator(".wizard-step").boundingBox();
    const heading = await page.locator(".wizard-step h2").first().boundingBox();
    const progressBox = await progress(page).boundingBox();
    const railDisplay = await page.locator(".wizard-step-rail").evaluate((element) => getComputedStyle(element).display);
    expect(railDisplay, `${name} desktop rail must be removed from mobile layout`).toBe("none");
    expect((stage?.y ?? 0) - (progressBox?.y ?? 0) - (progressBox?.height ?? 0), `${name} content must immediately follow progress`).toBeLessThan(8);
    expect((step?.y ?? 0) - (stage?.y ?? 0), `${name} must not reserve hidden desktop-rail space`).toBeLessThan(40);
    expect((heading?.y ?? 0) - (step?.y ?? 0), `${name} heading must start at the top of its step`).toBeLessThan(40);
    const undersized = await page.locator(".wizard-shell button:visible").evaluateAll((buttons) => buttons.flatMap((button) => {
      const box = button.getBoundingClientRect();
      return box.width < 43.5 || box.height < 43.5 ? [{ label: button.getAttribute("aria-label") || button.textContent?.trim(), width: box.width, height: box.height }] : [];
    }));
    expect(undersized, `${name} must retain 44 CSS-pixel touch targets`).toEqual([]);
    const unlabeled = await page.locator(".wizard-shell input:visible,.wizard-shell select:visible").evaluateAll((controls) => controls.flatMap((control) => {
      const id = control.getAttribute("id");
      const hasName = control.hasAttribute("aria-label") || control.closest("label") || (id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
      return hasName ? [] : [control.outerHTML.slice(0, 120)];
    }));
    expect(unlabeled, `${name} controls need accessible names`).toEqual([]);
  }
});
