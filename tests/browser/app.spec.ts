import { expect, test } from "@playwright/test";

test("runs the planet, applies an intervention, and drills into history", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /hostile surface|chemistry accumulating|origin window open/i })).toBeVisible();
  await expect(page.getByTestId("planet-view")).toBeVisible();
  await expect(page.getByTestId("planet-view")).toContainText("World intelligence");
  await expect(page.getByTestId("planet-view")).toContainText("Partial pressures");

  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(page.getByRole("button", { name: "Pause simulation" })).toBeVisible();
  await page.getByRole("button", { name: "Pause simulation" }).click();

  await page.getByLabel("Quick intervention").selectOption("organic-asteroid");
  await page.getByRole("button", { name: /intervene now/i }).click();
  await page.getByRole("button", { name: "Timeline" }).click();
  await expect(page.getByTestId("timeline-view")).toBeVisible();
  await page.getByRole("button", { name: /Carbonaceous asteroid/i }).first().click();
  await expect(page.getByTestId("event-inspector")).toContainText("Before and after");
  await expect(page.getByTestId("event-inspector")).toContainText("Model note");
});

test("edits an origin protocol and keeps all root views reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Origins" }).click();
  await expect(page.getByTestId("origins-view")).toBeVisible();
  await page.getByRole("button", { name: /Hydrothermal gradients/i }).click();
  await expect(page.getByText("hydrothermal gradients", { exact: false }).first()).toBeVisible();

  for (const name of ["Biosphere", "Lineages", "Timeline", "Lab", "Planet"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await expect(page.getByTestId("planet-view")).toBeVisible();
});

test("composes a custom material intervention with explicit cargo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lab" }).click();
  await page.getByText("Intervention", { exact: true }).locator("..").getByRole("combobox").selectOption("custom");
  await page.getByLabel("Cargo organics").fill("0.75");
  await page.getByLabel("Cargo phosphorus").fill("0.45");
  await page.getByRole("button", { name: /Apply intervention now/i }).click();
  await page.getByRole("button", { name: "Timeline" }).click();
  await expect(page.getByTestId("event-inspector")).toContainText("user-defined cargo", { ignoreCase: true });
});

test("builds a new preset and exposes lineage inspection safely when sterile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lab" }).click();
  await page.getByText("Planet preset").locator("..").getByRole("combobox").selectOption("ocean");
  await page.getByRole("button", { name: /Generate planet/i }).click();
  await expect(page.getByTestId("planet-view")).toBeVisible();
  await page.getByRole("button", { name: "Lineages" }).click();
  await expect(page.getByTestId("lineages-view")).toContainText(/Evolution has no starting population|Representative lineage/);
  await expect(page.getByTestId("lineages-view")).toContainText(/functional prerequisites|Structures and capabilities/);
});
