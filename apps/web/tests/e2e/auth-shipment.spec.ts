import { test, expect } from "@playwright/test";

test("login and shipment creation flow scaffold", async ({ page }) => {
  await page.goto("/sign-up");

  await page.getByLabel("Name").fill("Phase One User");
  await page.getByLabel("Email").fill(`phase1_${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("Passw0rd!123");

  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page).toHaveURL(/\/customer\/shipments/);

  await page.goto("/customer/shipments/new");
  await page.getByPlaceholder("Title").fill("Sample Package");
  await page.getByPlaceholder("Weight (kg)").fill("1.2");

  const line1Inputs = page.getByPlaceholder("Line 1");
  await line1Inputs.nth(0).fill("Origin A");
  await line1Inputs.nth(1).fill("Destination B");

  const cityInputs = page.getByPlaceholder("City");
  await cityInputs.nth(0).fill("Colombo");
  await cityInputs.nth(1).fill("Kandy");

  const stateInputs = page.getByPlaceholder("State");
  await stateInputs.nth(0).fill("WP");
  await stateInputs.nth(1).fill("CP");

  const postalInputs = page.getByPlaceholder("Postal");
  await postalInputs.nth(0).fill("00100");
  await postalInputs.nth(1).fill("20000");

  const countryInputs = page.getByPlaceholder("Country");
  await countryInputs.nth(0).fill("LK");
  await countryInputs.nth(1).fill("LK");

  await page.getByRole("button", { name: "Create Shipment" }).click();
  await expect(page).toHaveURL(/\/customer\/shipments/);
});
