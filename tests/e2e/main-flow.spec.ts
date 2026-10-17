import { expect, test } from "@playwright/test";

const reviewerEmail = process.env.REVIEWER_EMAIL ?? "";
const reviewerPassword = process.env.REVIEWER_PASSWORD ?? "";

test("complete organization and invitation flow", async ({ page }) => {
  test.skip(!reviewerEmail || !reviewerPassword, "Set REVIEWER_EMAIL and REVIEWER_PASSWORD to run the live flow");

  const runId = Date.now();
  const organizationName = `Test Org ${runId}`;
  const inviteEmail = `test-${runId}@example.com`;

  await page.goto("/auth");
  await page.getByLabel("Email").fill(reviewerEmail);
  await page.getByLabel("Password").fill(reviewerPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Organization Directory" })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: /new organization/i }).click();
  await page.getByLabel("Name").fill(organizationName);
  await page.getByLabel("School district").fill("Test District");
  await page.getByRole("button", { name: /create organization/i }).click();

  await expect(page.getByRole("heading", { name: organizationName })).toBeVisible();

  await page.getByRole("link", { name: "Back" }).click();
  await expect(page.getByRole("link", { name: new RegExp(organizationName) })).toBeVisible();

  await page.getByRole("link", { name: new RegExp(organizationName) }).click();
  await page.getByLabel("Email").fill(inviteEmail);
  await page.getByRole("button", { name: "Invite" }).click();

  await expect(page.getByText(inviteEmail)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("invited", { exact: true })).toBeVisible();

  await page.getByLabel("Email").fill(inviteEmail);
  await page.getByRole("button", { name: "Invite" }).click();

  await expect(page.getByText(/already been invited/i)).toBeVisible({ timeout: 30_000 });
});
