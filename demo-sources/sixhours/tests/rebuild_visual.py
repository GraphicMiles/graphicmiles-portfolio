"""Capture the actual rebuilt store, independently of the earlier reference study."""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'verification/rebuild'
OUT.mkdir(exist_ok=True)
SELECTORS = {
 'announcement':'.announcement','header':'.site-header','wordmark':'.wordmark','hero':'.hero','heroTitle':'.hero h1','heroBody':'.hero-copy > p','heroCTA':'.hero-copy .button',
 'categories':'.category-section','categoryTitle':'.category-copy h2','campaign':'.campaign','campaignTitle':'.campaign h2','campaignLabel':'.campaign-copy > p','campaignCTA':'.campaign .button',
 'productsHeading':'#featured-heading','productGrid':'#home-products','productCard':'#home-products .product-card','productImage':'#home-products .product-media','productTitle':'#home-products h3','productPrice':'#home-products .product-price','productButton':'#home-products .card-add',
 'bundlesHeading':'#bundles-heading','bundlesGrid':'#home-bundles','editorials':'.editorial-section','editorialImage':'.editorial-image img','reviews':'.reviews-section','reviewsHeading':'#reviews-heading','reviewCard':'.review-card[aria-hidden="false"]',
 'corporate':'.corporate-section','corporateTitle':'#corporate-heading','corporateBody':'.corporate-copy > p','newsletterTitle':'#newsletter-heading','newsletterForm':'.newsletter-form','newsletterInput':'#newsletter-name','newsletterButton':'.newsletter-submit','information':'.faq-section','footer':'.site-footer','footerLogo':'.footer-brand img','footerBottom':'.footer-bottom','payment':'.payment-note',
}
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(args=['--no-sandbox'])
  results={}
  for width in [980,1440,390]:
   context=await browser.new_context(viewport={'width':width,'height':1800},device_scale_factor=1)
   await context.add_init_script("try{sessionStorage.setItem('sixhours:signup-dismissed','1')}catch{}")
   page=await context.new_page();errors=[];requests=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('requestfailed',lambda r:requests.append({'url':r.url,'failure':r.failure}))
   await page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
   await page.evaluate('document.fonts.ready')
   await page.evaluate("""async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));} """)
   assert await page.evaluate('[...document.images].every(image=>image.naturalWidth>0)'), 'A catalogue or editorial image failed to decode'
   await page.wait_for_timeout(200)
   metrics=await page.evaluate('''(selectors)=>{const get=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {rect:{x:r.x,y:r.y+scrollY,width:r.width,height:r.height},style:Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','borderRadius','padding','gap','transform','transition','gridTemplateColumns'].map(k=>[k,s[k]]))}};return{width:innerWidth,documentWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,featured:document.querySelectorAll('#home-products .product-card').length,bundles:document.querySelectorAll('#home-bundles .bundle-card').length,roles:Object.fromEntries(Object.entries(selectors).map(([k,s])=>[k,get(s)]))}}''',SELECTORS)
   await page.screenshot(path=str(OUT/f'home-{width}.jpg'),full_page=True,type='jpeg',quality=86)
   await page.screenshot(path=str(OUT/f'top-{width}.png'))
   for label,selector in [('editorials','.editorial-section'),('lower','.newsletter-section')]:
    y=await page.locator(selector).evaluate('el=>el.getBoundingClientRect().top+scrollY')
    await page.evaluate('(y)=>scrollTo(0,y)',y)
    await page.screenshot(path=str(OUT/f'{label}-{width}.jpg'),type='jpeg',quality=87)
   await page.evaluate('scrollTo(0,0)')
   if width==980:
    await page.get_by_role('button',name='Open navigation',exact=True).click();await page.wait_for_timeout(550)
    await page.screenshot(path=str(OUT/'menu-980.jpg'),type='jpeg',quality=88)
    await page.locator('.menu-links > li').first.locator('button').first.click();await page.wait_for_timeout(450)
    await page.screenshot(path=str(OUT/'menu-expanded-980.jpg'),type='jpeg',quality=88)
   metrics['pageErrors']=errors;metrics['failedRequests']=requests;results[str(width)]=metrics
   await context.close()
  (OUT/'rendered-metrics.json').write_text(json.dumps(results,indent=2))
  print(json.dumps({w:{'height':m['height'],'documentWidth':m['documentWidth'],'featured':m['featured'],'bundles':m['bundles'],'errors':m['pageErrors'],'failedRequests':m['failedRequests'],'hero':m['roles']['hero']['rect'],'campaign':m['roles']['campaign']['rect'],'productImage':m['roles']['productImage']['rect']} for w,m in results.items()},indent=2))
  await browser.close()
asyncio.run(main())
