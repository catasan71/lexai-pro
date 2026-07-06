import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads with hero, nav and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Documente juridice");
    await expect(page.getByRole("button", { name: /Începe Gratuit/i }).first()).toBeVisible();
  });

  test("cookie consent banner appears and can be accepted", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByText("Folosim cookies tehnice");
    await expect(banner).toBeVisible();
    await page.getByRole("button", { name: "Accept toate" }).click();
    await expect(banner).not.toBeVisible();
    await page.reload();
    await expect(page.getByText("Folosim cookies tehnice")).not.toBeVisible();
  });

  test("opens GDPR modal from footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "GDPR & Confidențialitate" }).click();
    await expect(page.getByText("Operatorul de Date")).toBeVisible();
  });

  test("pricing toggle switches monthly/annual", async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await expect(page.locator("#pricing")).toBeVisible();
  });
});

test.describe("App entry", () => {
  test("entering the app prompts authentication", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Începe Gratuit/i }).first().click();
    await expect(page.getByRole("heading", { name: /Bine ai revenit|Creează cont/i })).toBeVisible({ timeout: 10000 });
  });
});
