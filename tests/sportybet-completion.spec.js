const {test,expect}=require('@playwright/test');
const fs=require('fs'),vm=require('vm');
const base='/sportybet-demo/';
const watch=page=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});return errors};
test('all sixteen article screens load local assets and route their CTAs',async({page})=>{
 const errors=watch(page);await page.goto(base+'#/menu');
 for(const section of ['promotions','features']){
  const count=section==='promotions'?5:11;
  for(let i=0;i<count;i++){
   await page.goto(`${base}#/promotions/reference/${section}/${i}`);
   const frame=page.frameLocator('.reference-promo-frame');await expect(frame.locator('#promotion')).toBeVisible();
   await frame.locator('body').evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r}))) });
   expect(await frame.locator('body').evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src))).toEqual([]);
   expect(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${section}/${i}`).toBe(true);
   const cta=frame.locator('a[data-demo-destination]:visible').first();
   if(await cta.count()){const destination=await cta.getAttribute('data-demo-destination');await cta.click();await expect(page).toHaveURL(new RegExp('#/'+destination+'$'));await page.goBack();await expect(page.locator('.reference-promo-frame')).toBeVisible()}
  }
 }
 expect(errors).toEqual([]);
});
test('captured market catalog, rules, variants and local early-payout settlement',async({page},info)=>{
 test.setTimeout(60000);const errors=watch(page);await page.goto(base+'#/event/100');
 await expect(page.locator('.native-market-block')).toHaveCount(311);
 await expect(page.locator('[data-native-market="18"] .native-total-row')).toHaveCount(6);
 await page.locator('[data-native-info="60200"]').click();await expect(page.getByRole('dialog')).toContainText('one-goal lead');await page.getByRole('dialog').getByRole('button',{name:'OK',exact:true}).click();
 const pin=page.locator('[data-native-pin="60100"]');await pin.click();await expect(pin).toHaveAttribute('aria-pressed','true');await page.reload();await expect(page.locator('[data-native-pin="60100"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-marketgroup="Corners"]').click();await expect(page.locator('.native-market-block')).not.toHaveCount(0);await page.locator('.native-market-block').first().locator('summary').click();
 const selection=page.locator('[data-native-unavailable]:visible').first();await selection.click();await expect(page.getByRole('dialog')).toContainText('no local settlement model');await page.getByRole('dialog').getByRole('button',{name:'OK',exact:true}).click();
 await page.locator('[data-marketgroup="All"]').click();await page.locator('[data-pick="100|early:1|home"]').click();if(info.project.name==='mobile')await page.locator('[data-openslip]').click();
 await page.locator('[aria-label=Stake]').fill('100');await page.locator('[data-place]').click();await page.locator('[data-confirmbet]').click();
 await page.goto(base+'#/event/100');await page.locator('.simulation-controls summary').click();await page.locator('[data-simulate="100"]').click();
 await expect.poll(()=>page.evaluate(()=>Boolean(JSON.parse(localStorage.getItem('sporty-demo-v2')).results[100]))).toBe(true);
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('sporty-demo-v2'))),r=state.results[100];
 expect(r.goals.filter(g=>g==='home')).toHaveLength(r.home);expect(r.goals.filter(g=>g==='away')).toHaveLength(r.away);
 let difference=0,lead=0;for(const g of r.goals){difference+=g==='home'?1:-1;lead=Math.max(lead,difference)}expect(state.tickets[0].status).toBe(lead>=1?'Won':'Lost');expect(errors).toEqual([]);
});
test('early payout logic respects order, comeback wins and draws',()=>{
 const source=fs.readFileSync('works/sportybet-demo/assets/js/demo.js','utf8');const fn=source.slice(source.indexOf('  function evaluate(p, r) {'),source.indexOf('  function simulatedResult(id) {'));
 const evaluate=vm.runInNewContext('('+fn.trim()+')');const result={home:2,away:1,goals:['away','home','home']};
 expect(evaluate({market:'never-down',outcome:'home'},result)).toBe(false);expect(evaluate({market:'early:1',outcome:'away'},result)).toBe(true);expect(evaluate({market:'early:2',outcome:'home'},result)).toBe(false);
 expect(evaluate({market:'never-down',outcome:'home'},{home:2,away:1,goals:['home','home','away']})).toBe(true);
 expect(evaluate({market:'early:2',outcome:'home'},{home:2,away:2,goals:['home','home','away','away']})).toBe(true);
 expect(evaluate({market:'never-down',outcome:'draw'},{home:1,away:1,goals:['home','away']})).toBe(true);
});
test('instant virtual round and settings survive navigation and reload',async({page})=>{
 const errors=watch(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'#/virtual/instant');
 await page.locator('[data-iv-builder]').click();await expect(page.getByRole('dialog')).toContainText('one selection per event');await page.getByRole('dialog').getByRole('button',{name:'OK',exact:true}).click();
 await page.locator('[data-iv-market="btts"]').click();await expect(page.locator('.iv-odds').first().locator('[data-pick]')).toHaveCount(2);
 await page.locator('[data-iv-next]').click();await expect(page.locator('.iv-demo-caption')).toContainText('round 2');await page.reload();await expect(page.locator('.iv-demo-caption')).toContainText('round 2');await expect(page.locator('.iv-rows [data-pick]').first()).toBeEnabled();expect(errors).toEqual([]);
});
test('virtual lobby cards retain distinct destinations and extended screens fit five widths',async({page},info)=>{
 test.skip(info.project.name!=='desktop');test.setTimeout(90000);const errors=watch(page);
 await page.goto(base+'#/virtual');const links=await page.locator('.virtual-reference-card').evaluateAll(a=>a.map(x=>x.getAttribute('href')));expect(new Set(links).size).toBe(12);
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['loyalty','virtual','virtual/instant','virtual/product/1','virtual/product/3','virtual/product/11','promotions/reference/features/0']){
   await page.goto(base+'#/'+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${route}`).toBe(true);
   if(route==='virtual/product/3')await expect(page.locator('.reference-product h1')).toHaveText('Instant Basketball');
   if(route==='promotions/reference/features/0'){const frame=page.frameLocator('.reference-promo-frame');await expect(frame.locator('#promotion')).toBeVisible();expect(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} inner article`).toBe(true)}
  }
 }
 expect(errors).toEqual([]);
});
test('service worker precaches and serves the article reader offline',async({page,context})=>{
 const errors=watch(page);await page.goto(base+'#/home');await page.evaluate(()=>navigator.serviceWorker.ready);
 await expect.poll(()=>page.evaluate(async()=>{const keys=await caches.keys();return keys.some(k=>k.endsWith(':v16'))})).toBe(true);
 await page.reload();await page.goto(base+'#/promotions/reference/features/0');await expect(page.frameLocator('.reference-promo-frame').locator('#promotion')).toBeVisible();
 await context.setOffline(true);await page.reload();await expect(page.frameLocator('.reference-promo-frame').locator('#promotion')).toBeVisible();await context.setOffline(false);expect(errors).toEqual([]);
});
test('signed-in account, notification tabs and transaction filters use local data only',async({page},info)=>{
 const errors=watch(page);await page.goto(base+'#/account/register');
 await page.locator('input[name=phone]').fill('08100000000');
 if(info.project.name==='mobile')await page.locator('[data-reference-phone-next] button').click();
 await page.locator('input[name=pin]').fill('123456');await page.locator('input[name=terms]').check();await page.locator('[data-authform=register] .btn-green').click();
 await expect(page.getByRole('dialog')).toContainText('recovery');await page.getByRole('dialog').getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page).toHaveURL(/#\/account$/);
 if(info.project.name==='mobile'){
  await expect(page.locator('.reference-me-signed')).toBeVisible();await expect(page.locator('.signed-me-profile')).toContainText('Demo 0000');await page.getByRole('button',{name:'Hide balance'}).click();await expect(page.locator('.reference-me-balance')).toContainText('••••••');await page.getByRole('button',{name:'Show balance'}).click();
  await page.getByRole('link',{name:'Notification Center'}).click();
 }else await page.goto(base+'#/account/notifications');
 for(const tab of ['System','Promotion','Message']){await page.getByRole('tab',{name:tab,exact:true}).click();await expect(page.getByRole('tabpanel')).toContainText('No Messages available')}
 await page.goto(base+'#/wallet/transactions');await page.locator('[data-transaction-category]').selectOption('Deposits');await expect(page.locator('.ledger-row')).toHaveCount(0);await expect(page.locator('.transaction-empty')).toContainText('No Records Found');
 await page.locator('[data-transaction-reset]').click();await expect(page.locator('.ledger-row')).toHaveCount(1);
 await page.locator('[data-transaction-dates]').click();const d=page.getByRole('dialog');await d.locator('[name=from]').fill('2026-11-10');await d.locator('[name=to]').fill('2026-11-01');await d.getByRole('button',{name:'Apply',exact:true}).click();await expect(d.locator('[role=alert]')).toContainText('start date');await d.locator('[data-transaction-preset="7"]').click();await d.getByRole('button',{name:'Apply',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.ledger-row')).toHaveCount(1);
 await page.locator('[data-transaction-status]').click();await expect(page.getByRole('dialog')).toContainText('No external payment is pending');await page.getByRole('dialog').getByRole('button',{name:'OK',exact:true}).click();
 if(info.project.name==='desktop')for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});for(const route of ['account','account/notifications','wallet/transactions']){await page.goto(base+'#/'+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} signed-in ${route}`).toBe(true)}}
 await page.setViewportSize({width:info.project.name==='mobile'?390:1440,height:900});await page.goto(base+'#/account');if(info.project.name==='mobile')await page.locator('.signed-me-logout').click();else await page.locator('[data-signout-demo]').click();await expect(page).toHaveURL(/#\/account\/login$/);await expect(page.locator('input[name=pin]')).toBeVisible();expect(errors).toEqual([]);
});
test('all four entry URLs load the current catalog, article and market implementation',async({page})=>{
 test.setTimeout(90000);const errors=watch(page);
 for(const alias of ['', 'ng/', 'm/', 'ng/m/']){
  await page.goto(base+alias+'#/home');
  await expect(page.locator('meta[name="sporty-demo-version"]')).toHaveAttribute('content','reference-20261106-r16');
  expect(await page.evaluate(()=>Boolean(globalThis.SportyCatalog&&globalThis.SportySurfaces&&globalThis.SportyMenu&&globalThis.SportyPromoReferences&&globalThis.SportyEventMarkets))).toBe(true);
  await page.goto(base+alias+'#/games');await expect(page.locator('.catalog-card').first()).toBeVisible();await expect.poll(()=>page.locator('.catalog-card img').first().evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.goto(base+alias+'#/event/100');await expect(page.locator('.native-market-block')).toHaveCount(311);
  await page.goto(base+alias+'#/promotions/reference/features/0');await expect(page.frameLocator('.reference-promo-frame').locator('#promotion')).toBeVisible();
  expect(await page.frameLocator('.reference-promo-frame').locator('body').evaluate(()=>[...document.images].filter(img=>img.complete&&!img.naturalWidth).length)).toBe(0);
 }
 expect(errors).toEqual([]);
});
test('homepage shows refreshed reference content and its market controls work',async({page},info)=>{
 const errors=watch(page);await page.goto(base+'#/home');
 if(info.project.name==='mobile'){
  await expect(page.locator('.m-promos button')).toHaveCount(15);await expect(page.locator('.m-feature-card')).toHaveCount(27);await expect(page.locator('.m-feature-card').first()).toContainText('Fritz, Taylor');
  await page.locator('.m-feature-card').first().locator('[data-pick]').first().click();await page.locator('[data-openslip]').click();await expect(page.locator('.slip-item')).toContainText('Fritz, Taylor');await page.locator('.sheet-close').click();
  await page.locator('.m-promos [data-path="promotions/reference/features/0"]').click();await expect(page.frameLocator('.reference-promo-frame').locator('#promotion')).toContainText('AutoBet');
 }else{
  await expect(page.locator('.hero-carousel .slide').first().locator('img')).toHaveAttribute('src',/home-current-hero\.webp$/);await expect(page.locator('.highlights .match-row')).toHaveCount(2);await expect(page.locator('.highlights')).toContainText('Reyady Abaseya');
  await page.locator('[data-pick="600|1x2|home"]').click();await expect(page.locator('.slip-item')).toContainText('Reyady Abaseya');await page.locator('[data-lines="600"]').click();await expect(page.getByRole('dialog')).toContainText('Total goals 2.5');await page.getByRole('dialog').locator('[data-pick="600|totals:2.5|over"]').click();await expect(page.locator('.slip-item')).toContainText('Over 2.5');
 }
 expect(errors).toEqual([]);
});
