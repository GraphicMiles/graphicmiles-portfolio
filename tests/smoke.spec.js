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

test("home page introduces the developer, switches 3 segments, opens case notes, and links to the archive", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("Raji Farouq Adewunmi");

  // 3-segment switcher renders and switches cleanly
  await expect(page.locator("#tab-projects")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".feed-entry")).toHaveCount(5);

  await page.locator("#tab-experiments").click();
  await expect(page.locator("#tab-experiments")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".feed-entry")).toHaveCount(5);
  await page.locator("#expand-more-btn").click();
  await expect(page.locator(".feed-entry")).toHaveCount(9);

  await page.locator("#tab-demos").click();
  await expect(page.locator("#tab-demos")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".feed-entry")).toHaveCount(5);
  await page.locator("#expand-more-btn").click();
  await expect(page.locator(".feed-entry")).toHaveCount(12);

  // Slide-in detail view & Back button
  await page.locator("#tab-projects").click();
  await page.locator('[data-open-detail="legally-unbullied"]').first().click();
  await expect(page.locator("#detail-view")).toBeVisible();
  await expect(page.locator(".detail-title")).toHaveText("Legally Unbullied");
  await page.locator("#detail-back-btn").click();
  await expect(page.locator("#detail-view")).toBeHidden();

  // Archive navigation
  const archive = page.locator('footer.site-footer a[href="/projects/"]');
  await expect(archive).toHaveCount(1);
  await expect(archive).toHaveText("Archive");

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

  await page.locator('a[href="/drop/"]').click();
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

// The Atelier Drop demo is a self-contained static clone served at /atelier-drop/.
// It must open from its own folder, keep its pages noindex, and never reach the
// store it was rebuilt from.
test("the Atelier Drop demo opens from its folder and stays offline", async ({ page }) => {
  const problems = watch(page);
  const offsite = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) offsite.push(request.url());
  });

  const response = await page.goto("/atelier-drop/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Nikey/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator(".header-logo")).toBeVisible();
  await expect(page.locator(".st-circle")).not.toHaveCount(0);

  // the rail and the header are built by JS, so a broken script shows up as an
  // empty header rather than as a console error alone
  const navLinks = page.locator(".header-menu .menu-list__link");
  await expect(navLinks).toHaveCount(5);

  await page.goto("/atelier-drop/collection.html");
  await expect(page.locator(".product-card__title")).not.toHaveCount(0);

  await page.goto("/atelier-drop/product-blazzer.html");
  await page.locator(".opt-pill").first().click();
  await page.locator("[data-add]").click();
  await expect(page.locator("[data-cart-count]")).toHaveText(/[1-9]/);

  expect(offsite, `off-site requests: ${offsite.join(", ")}`).toEqual([]);
  expect(problems).toEqual([]);
});

test("the case study links to the demo and to the archive", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/atelier-drop-case-study");
  await expect(page.locator("h1")).toContainText("Atelier Drop");
  await expect(page.locator('a[href="/atelier-drop/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/projects/"]').first()).toBeVisible();
  expect(problems).toEqual([]);
});

test("archive separates shipped products from interface studies and all core pages render a footer", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/projects/");
  await expect(page.locator("#shipped-heading")).toHaveText(/Shipped products/i);
  await expect(page.locator("#studies-heading")).toHaveText(/Interface & storefront studies/i);
  await expect(page.locator('a[href*="odgdelivery"]')).toHaveCount(0);

  for (const route of ["/", "/projects/", "/atelier-drop-case-study", "/demos/", "/404.html"]) {
    await page.goto(route);
    await expect(page.locator("footer.site-footer")).toBeVisible();
  }
  expect(problems).toEqual([]);
});
