// @ts-check
const { test, expect } = require('@playwright/test');
const base='/sportybet-demo/';
function watch(page){const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});return errors;}
async function wallet(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('sporty-demo-v2')).ledger.reduce((sum,t)=>sum+t.amount,0));}

test('demo stays archived without appearing on the portfolio homepage',async({page})=>{
 const errors=watch(page);await page.goto('/');
 await expect(page.locator('a[href="/sportybet-demo/"]')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'SportyBet interface demo'})).toHaveCount(0);
 await expect(page.locator('article.project')).toHaveCount(4);
 await expect(page.getByRole('heading',{name:'Four things I built'})).toBeVisible();
 await page.goto('/projects/');await page.getByRole('link',{name:/SportyBet interface demo/}).click();
 await expect(page).toHaveURL(/\/sportybet-demo\/$/);await expect(page.locator('.demo-status')).toContainText('DEMO');
 await expect(page.locator('h1')).toContainText('interactive demo');expect(errors).toEqual([]);
});

test('mounted demo supports betting, refund and deposit without escaping its path',async({page},info)=>{
 const errors=watch(page);await page.goto(base+'#/event/0');
 await page.locator('.market-block [data-pick="0|1x2|home"]').click();
 if(info.project.name==='mobile')await page.locator('[data-openslip]').click();
 await page.locator('[aria-label=Stake]').fill('100');await page.locator('[data-place]').click();await page.locator('[data-confirmbet]').click();
 await expect(page.locator('.ticket-title h2')).toHaveText('Open');expect(await wallet(page)).toBe(990000);
 await page.locator('[data-cancel-demo]').click();await page.locator('[data-demo-confirm]').click();
 await expect(page.locator('.ticket-title h2')).toHaveText('Cancelled');expect(await wallet(page)).toBe(1000000);
 await page.goto(base+'#/wallet/deposit');await page.locator('[name=amount]').fill('500');await page.locator('[data-walletform] .btn-green').click();await page.locator('[data-demo-confirm]').click();
 await expect(page).toHaveURL(/\/sportybet-demo\/#\/wallet\/transactions$/);expect(await wallet(page)).toBe(1050000);
 await page.reload();expect(await wallet(page)).toBe(1050000);
 await page.getByRole('link',{name:'Back to portfolio',exact:true}).click();
 await expect(page).toHaveURL(/\/$/);await expect(page.locator('h1')).toContainText('Raji Farouq Adewunmi');
 expect(errors).toEqual([]);
});

test('portfolio and mounted demo retain their layouts at all required widths',async({page},info)=>{
 test.skip(info.project.name!=='desktop','one five-width matrix is sufficient');
 const errors=watch(page);
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/', '/projects/',base,base+'#/sports/football',base+'#/event/0',base+'#/games',base+'#/jackpot',base+'#/wallet',base+'#/account/register']){
   await page.goto(route);
   if(route.startsWith(base))await expect(page.locator('.demo-status')).toBeVisible();
   else await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${route}`).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});
