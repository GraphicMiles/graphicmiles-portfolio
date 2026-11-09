// @ts-check
const { test, expect } = require('@playwright/test');

function watch(page) {
  const problems = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('requestfailed', request => problems.push(`Failed: ${request.url()}`));
  page.on('response', response => { if (response.status() >= 400) problems.push(`${response.status()}: ${response.url()}`); });
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) problems.push(`Unexpected write: ${request.method()} ${request.url()}`); });
  return problems;
}
async function ready(page, route = '/sixhours/') {
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
}
async function pick(page, selector, label) {
  await page.locator(selector).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  // Exercise a returning visitor, without interrupting shopping with the once-per-session preview.
  await page.addInitScript(() => { try { sessionStorage.setItem('sixhours:signup-dismissed', '1'); } catch {} });
});

test('the archive and demo hub open the Sixhours demo', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/projects/');
  const archiveLink = page.getByRole('link', { name: /Sixhours gadget-store demo/ });
  await expect(archiveLink).toHaveAttribute('href', '/sixhours/');
  await archiveLink.click();
  await expect(page.locator('#home-products .product-card')).toHaveCount(20);
  await expect(page.locator('#home-bundles .bundle-card')).toHaveCount(8);
  await page.goto('/demos/');
  await expect(page.locator('#concepts-heading').locator('..')).toContainText('8 studies');
  const demoLink = page.getByRole('link', { name: /^Sixhours / });
  await expect(demoLink).toHaveAttribute('href', '/sixhours/');
  await demoLink.click();
  await expect(page).toHaveTitle(/^sixhours \|/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(problems).toEqual([]);
});

test('assets and browser Back work under the portfolio prefix, including the bare entry URL', async ({ page }) => {
  const problems = watch(page);
  await ready(page, '/sixhours');
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all([...document.images].map(image => image.decode()));
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => [...document.images].every(image => image.naturalWidth > 0))).toBe(true);
  const link = page.locator('#home-products [data-product-card="apple-pencil-pro"] h3 a');
  await link.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  await link.click();
  await expect(page.locator('#route-view h1')).toHaveText('Apple Pencil Pro');
  await page.goBack();
  await expect(link).toBeFocused();
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(1);
  expect(problems).toEqual([]);
});

test('shopping, delivery checks and confirmation remain a local demo', async ({ page }) => {
  const problems = watch(page);
  await ready(page);
  await page.locator('#home-products [data-product="airpods-4"].card-add').click();
  await expect(page.locator('#overlay-title')).toHaveText('Your bag (1)');
  await page.locator('#overlay [data-action="open-delivery"]').click();
  await pick(page, '#delivery-city', 'Lagos');
  await pick(page, '#delivery-area', 'Yaba');
  await page.locator('.delivery-form [type="submit"]').click();
  await expect(page.locator('.delivery-result')).toBeFocused();
  await page.locator('[data-use-area]').click();
  await expect(page.locator('#overlay-title')).toHaveText('Your bag (1)');
  await page.locator('[data-action="begin-checkout"]').click();
  await page.locator('[data-sample-details]').click();
  await page.locator('[data-review-order]').click();
  await page.locator('[data-confirm-demo]').click();
  await expect(page.locator('.confirmation-heading')).toContainText('No payment was taken. Nothing will be dispatched.');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('six-preview:v1') || 'null'));
  expect(saved.cart).toEqual([]);
  expect(saved.lastDemo.demo).toBe(true);
  expect(JSON.stringify(saved)).not.toContain('ada@example.com');
  expect(JSON.stringify(saved)).not.toContain('12 Example Street');
  expect(problems).toEqual([]);
});

test('the 320px layout and gallery stay usable at the deployed path', async ({ page }) => {
  const problems = watch(page);
  await page.setViewportSize({ width: 320, height: 760 });
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#home-products [data-product-card="galaxy-a17"] h3 a').click();
  await page.locator('[data-gallery-open]').click();
  await expect(page.locator('#overlay')).toHaveAttribute('data-kind', 'gallery');
  await expect(page.locator('[data-gallery-step]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-gallery-open]')).toBeFocused();
  expect(problems).toEqual([]);
});
