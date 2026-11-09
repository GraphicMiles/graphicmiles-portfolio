"""Rebuild-specific responsive, rendered-font, motion and opaque offline-viewer checks."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json, html
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'verification/rebuild'
BASE='http://127.0.0.1:4173'
reports=[]
WIDTHS=[320,360,375,390,414,450,480,481,600,650,767,768,800,820,980,990,991,992,1024,1025,1280,1440,1600,1920]

def ready(p,hash=''):
 p.goto(BASE+'/'+hash,wait_until='networkidle');p.wait_for_function("document.documentElement.dataset.ready==='true'")

def overflow(p):
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth'),p.evaluate('({w:innerWidth,doc:document.documentElement.scrollWidth})')

with sync_playwright() as pw:
 browser=pw.chromium.launch(args=['--no-sandbox'])
 c=browser.new_context(viewport={'width':980,'height':1000});c.add_init_script("try{sessionStorage.setItem('sixhours:signup-dismissed','1')}catch{}")
 p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)));ready(p)
 matrix=[]
 for width in WIDTHS:
  p.set_viewport_size({'width':width,'height':1000});p.wait_for_timeout(80);overflow(p)
  state=p.evaluate("({width:innerWidth,columns:getComputedStyle(document.querySelector('#home-products')).gridTemplateColumns.split(' ').length,hero:document.querySelector('.hero').getBoundingClientRect().height,desktop:getComputedStyle(document.querySelector('.primary-nav')).display!=='none'})")
  assert state['columns']==(2 if width<=480 else 3 if width<=990 else 4),state
  assert state['hero']==(750 if width>=1025 else 500),state
  assert state['desktop']==(width>=992),state
  matrix.append(state)
 (OUT/'responsive-matrix.json').write_text(json.dumps(matrix,indent=2));reports.append({'case':'responsive-breakpoints-and-overflow','status':'passed','widths':WIDTHS})
 p.set_viewport_size({'width':320,'height':760})
 for route in ['#shop','#product/iphone-16','#bundle/everyday-essentials','#promise','#checkout']:
  ready(p,route);overflow(p)
 ready(p,'#shop');p.locator('[data-filter-toggle]').click()
 for selector in ['[data-price-select]','[data-sort-select]']:
  p.locator(selector+' .select-trigger').click();box=p.locator(selector+' .select-options').bounding_box();assert box['x']>=0 and box['x']+box['width']<=320,box;p.keyboard.press('Escape')
 ready(p,'#product/iphone-16');button=p.locator('[data-product-add]');box=button.bounding_box();assert box['x']>=0 and box['x']+box['width']<=320,box
 ready(p);p.locator('#home-products [data-product="iphone-16"].card-add').click();expect(p.locator('.quickview-layout')).to_be_visible();p.locator('.quickview-details [data-product-add]').scroll_into_view_if_needed();box=p.locator('.quickview-details [data-product-add]').bounding_box();assert box['x']>=0 and box['x']+box['width']<=320,box
 assert p.locator('.overlay-content').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
 p.screenshot(path=str(OUT/'quickview-320.jpg'),quality=86);p.keyboard.press('Escape');expect(p.locator('#overlay')).not_to_be_visible()
 reports.append({'case':'320px-routes-filter-popovers-and-quickview-controls','status':'passed'})
 p.set_viewport_size({'width':980,'height':1500});ready(p);p.evaluate('document.fonts.ready')
 p.locator('#newsletter-name').fill('Ada Example');p.evaluate('document.fonts.ready')
 session=c.new_cdp_session(p);session.send('DOM.enable');session.send('CSS.enable');document=session.send('DOM.getDocument')['root']['nodeId'];fonts={}
 for key,selector in [('display','.hero h1'),('body','.hero-copy > p'),('input','#newsletter-name')]:
  node=session.send('DOM.querySelector',{'nodeId':document,'selector':selector})['nodeId'];fonts[key]=session.send('CSS.getPlatformFontsForNode',{'nodeId':node})['fonts']
 assert any('Domaine' in f['postScriptName'] for f in fonts['display']),fonts
 assert any('PublicSans' in f['postScriptName'] for f in fonts['body']),fonts
 assert any('Poppins' in f['postScriptName'] for f in fonts['input']),fonts
 (OUT/'rendered-font-proof.json').write_text(json.dumps(fonts,indent=2));p.locator('#newsletter-name').clear();reports.append({'case':'actual-custom-font-rendering-not-just-css-declarations','status':'passed','fonts':fonts})
 p.evaluate('scrollTo(0,0)')
 trace=p.evaluate("""async()=>{const b=document.querySelector('.menu-toggle');b.focus();b.click();const t=performance.now(),a=[];await new Promise(resolve=>{function sample(){const el=document.querySelector('.overlay-surface');a.push({t:performance.now()-t,x:el.getBoundingClientRect().x});if(performance.now()-t<650)requestAnimationFrame(sample);else resolve()}requestAnimationFrame(sample)});return a;}""")
 assert min(s['x'] for s in trace)<-400 and abs(trace[-1]['x'])<1 and any(-430<s['x']<-20 for s in trace),trace
 submenu=p.evaluate("""async()=>{const b=document.querySelector('.menu-links > li button'),panel=document.getElementById(b.getAttribute('aria-controls'));b.click();const t=performance.now(),a=[];await new Promise(resolve=>{function sample(){a.push({t:performance.now()-t,height:panel.getBoundingClientRect().height});if(performance.now()-t<500)requestAnimationFrame(sample);else resolve()}requestAnimationFrame(sample)});return a;}""")
 assert any(5<s['height']<250 for s in submenu) and abs(submenu[-1]['height']-262)<1,submenu
 (OUT/'store-drawer-motion.json').write_text(json.dumps({'drawer':trace,'submenu':submenu},indent=2));p.keyboard.press('Escape');expect(p.locator('#overlay')).not_to_be_visible()
 p.locator('[data-review-step="1"]').click();p.wait_for_timeout(550);assert p.locator('[data-review-index="1"]').get_attribute('aria-pressed')=='true'
 translation=p.locator('.reviews-track').evaluate('e=>new DOMMatrix(getComputedStyle(e).transform).m41');assert abs(translation+1240)<1,translation
 reports.append({'case':'500ms-drawer-400ms-inline-menu-and-manual-carousel-advance','status':'passed'})
 assert not errors,errors;c.close()
 # Real sandboxed srcdoc: same restrictions as the Arena file viewer, no same-origin permission.
 offline=browser.new_context(viewport={'width':1050,'height':1200});page=offline.new_page();requests=[];page_errors=[]
 page.on('request',lambda r:requests.append(r.url) if r.url.startswith('http') else None);page.on('pageerror',lambda e:page_errors.append(str(e)))
 page.set_content('<!doctype html><iframe title="Standalone store" sandbox="allow-scripts" style="border:0;width:980px;height:1100px" srcdoc="'+html.escape((ROOT/'six-preview.html').read_text(),quote=True)+'"></iframe>')
 frame=page.frame_locator('iframe');expect(frame.locator('#home-products .product-card')).to_have_count(20);expect(frame.locator('#home-bundles .bundle-card')).to_have_count(8)
 # The real popup also works without sessionStorage; dismiss it before a longer offline journey.
 expect(frame.locator('#overlay[data-kind="newsletter"]')).to_be_visible(timeout=7000)
 frame.locator('.overlay-header [data-close-overlay]').click();expect(frame.locator('#overlay')).not_to_be_visible()
 frame.locator('#home-products [data-product="airpods-4"].card-add').click();expect(frame.locator('#overlay-title')).to_have_text('Your bag (1)');expect(frame.locator('.cart-item')).to_contain_text('AirPods 4')
 frame.locator('.overlay-header [data-close-overlay]').click();expect(frame.locator('#overlay')).not_to_be_visible()
 frame.locator('#home-products [data-product-card="iphone-16"] h3 a').click();expect(frame.locator('#route-view h1')).to_have_text('iPhone 16')
 page.frames[1].evaluate('history.back()');expect(frame.locator('.hero')).to_be_visible()
 frame.locator('.footer-links a[href="#shop"]').click();expect(frame.locator('#route-view .product-card')).to_have_count(20)
 assert not requests and not page_errors,(requests,page_errors)
 page.screenshot(path=str(OUT/'opaque-offline-viewer.jpg'),quality=84);offline.close()
 reports.append({'case':'self-contained-html-in-opaque-network-free-sandbox','status':'passed','externalRequests':requests,'pageErrors':page_errors})
 browser.close()
(OUT/'edge-report.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))
