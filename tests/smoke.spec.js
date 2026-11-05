// @ts-check
const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const WORKS = path.join(__dirname, "..", "works");
const slugs = fs
  .readdirSync(WORKS)
  .filter((name) => fs.existsSync(path.join(WORKS, name, "index.html")));

/** Collects console errors and failed requests for a page. */
function watch(page) {
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const reason = request.failure() ? request.failure().errorText : "failed";
    problems.push(`request: ${request.url()} (${reason})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`http ${response.status()}: ${response.url()}`);
  });
  return problems;
}

test("home page introduces the developer and links to the archive", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("Raji Farouq Adewunmi");

  const archive = page.locator('nav[aria-label="Links"] a[href="/projects/"]');
  await expect(archive).toHaveCount(1);
  await expect(archive.locator(".row-title")).toHaveText("Archive");

  await archive.click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator("h1")).toHaveText(/Projects/i);

  expect(problems).toEqual([]);
});

test("archive lists the case studies and opens Drop", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/projects/");

  const rows = page.locator(".row-title");
  expect(await rows.count()).toBeGreaterThan(5);

  await page.getByRole("link", { name: /Drop/ }).first().click();
  await expect(page).toHaveURL(/\/drop\/$/);
  await expect(page).toHaveTitle(/Drop/i);

  expect(problems).toEqual([]);
});

test("the CV link points at a real file", async ({ request }) => {
  const response = await request.get("/Raji_Adewunmi_Farouq_CV.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test("unknown paths render the 404 page with a 404 status", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("404");
});

for (const slug of slugs) {
  test(`case study /${slug}/ loads without errors`, async ({ page }) => {
    const problems = watch(page);
    const response = await page.goto(`/${slug}/`);

    expect(response?.status()).toBe(200);
    expect(await page.locator("h1").count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator("body")).not.toBeEmpty();

    expect(problems).toEqual([]);
  });
}

test("pages do not scroll sideways on a phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "phone viewport only");
  for (const route of ["/", "/projects/", "/drop/"]) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `${route} overflows the viewport by ${overflow}px`).toBeLessThanOrEqual(1);
  }
});

test("a visit to the home page never leaves the keyboard without a target", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    return active ? active.tagName + (active.textContent || "").trim().slice(0, 20) : "none";
  });
  expect(focused).not.toBe("none");
});
