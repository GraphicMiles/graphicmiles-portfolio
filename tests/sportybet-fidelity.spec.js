const {test,expect}=require('@playwright/test');
const base='/sportybet-demo/';
function watch(page){const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});return errors;}

test('reference home navigation, competition tabs and captured prices stay connected',async({page},info)=>{
 test.setTimeout(60000);const errors=watch(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
 if(info.project.name==='desktop'){
  for(const sport of ['Football','Basketball','Tennis','eFootball']){
   await page.locator('.highlights [data-tab]').filter({hasText:new RegExp('^'+sport+'$')}).click();
   const groups=await page.evaluate(s=>SportyHome.highlightSports[s],sport);
   await expect(page.locator('[data-home-league]')).toHaveCount(groups.length);
   for(let i=0;i<groups.length;i++){
    await page.locator(`[data-home-league="${i}"]`).click();
    await expect(page.locator('.highlights .match-row')).toHaveCount(groups[i].rows.length);
    await expect(page.locator('.highlights .match-table')).toContainText(groups[i].rows[0].home);
    const prices=await page.locator('.highlights [data-pick]').evaluateAll(es=>es.map(e=>({key:e.dataset.pick,price:Number(e.textContent)})));
    expect(prices.every(p=>Number.isFinite(p.price)&&p.price>1)).toBe(true);
    expect(await page.evaluate(ps=>ps.every(p=>{const [id,market,outcome]=p.key.split('|');return lookupOdd(Number(id),market,outcome)===p.price}),prices)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   }
  }
  await expect(page.locator('.highlights .match-table')).not.toContainText('No captured');
 }else{
  await expect(page.locator('.m-tools img')).toHaveCount(6);await expect(page.locator('[data-home-category]')).toHaveCount(17);
  const track=page.locator('.m-feature-track');await track.focus();await track.press('ArrowRight');await expect.poll(()=>track.evaluate(e=>e.scrollLeft)).toBeGreaterThan(100);
  for(let i=0;i<17;i++){
   await page.locator(`[data-home-category="${i}"]`).click();
   await expect(page.locator(`[data-home-category="${i}"]`)).toHaveAttribute('aria-pressed','true');
   const title=await page.locator(`[data-home-category="${i}"]`).getAttribute('aria-label');
   expect(await page.evaluate(t=>SportyHome.featured.some(r=>r.category===t),title)).toBe(true);
  }
  await page.locator('[data-feature="Games"]').click();await expect(page.locator('.home-feature-games [data-catalog-game]')).toHaveCount(12);await expect(page.locator('[data-game]')).toHaveCount(0);
  await page.locator('[data-feature="Virtuals"]').click();await expect(page.locator('.home-feature-games [data-path]')).toHaveCount(7);
  await page.locator('.home-feature-games [data-path]').first().click();await expect(page.locator('.reference-instant')).toBeVisible();
  await page.goto(base);await page.locator('.m-market-tabs [data-market="O/U"]').click();await expect(page.locator('.home-live-match').first().locator('[data-pick]')).toHaveCount(2);
  const first=page.locator('.home-live-match').first().locator('[data-pick]').first();await first.click();await page.locator('[data-openslip]').click();await expect(page.locator('.slip-item')).toContainText('Over 1.5');await page.locator('.sheet-close').click();
  await page.locator('.m-all').click();await expect(page).toHaveURL(/#\/live$/);await expect(page.locator('.reference-fixture-list')).toContainText('FC Obolon Kyiv');await expect(page.locator('.reference-fixture-list')).not.toContainText('AC Milan');
 }
 expect(errors).toEqual([]);
});

test('home landmark geometry matches the measured reference at five widths',async({page},info)=>{
 test.skip(info.project.name!=='desktop');test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width<768){
   expect(await page.locator('.m-market-tabs>button').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth))).toBe(true);
   const live=await page.locator('.m-live').boundingBox();expect(Math.abs(live.y-(width===360?456:496))).toBeLessThan(5);
   const row=await page.locator('.home-live-match').first().boundingBox();const teams=await page.locator('.home-live-teams').first().boundingBox();const odds=await page.locator('.home-live-odds').first().boundingBox();expect(teams.x+teams.width).toBeLessThanOrEqual(odds.x);expect(row.height).toBeLessThan(120);
  }else{
   expect((await page.locator('.hero').boundingBox()).height).toBe(264);
   if(width===1440){expect((await page.locator('.promo-banner').boundingBox()).y).toBe(436);expect((await page.locator('.highlights').boundingBox()).y).toBe(526);expect((await page.locator('.highlights').boundingBox()).width).toBe(747)}
  }
  const broken=await page.locator('img:visible').evaluateAll(es=>es.filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src));expect(broken).toEqual([]);
 }
});
