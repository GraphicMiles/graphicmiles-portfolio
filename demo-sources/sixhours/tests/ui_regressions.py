"""Regression cases for the reproduced clipping, stock, modal and focus failures.
Run after npm run build with the local preview on 4173. No real commerce services.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'verification/fixes-01';OUT.mkdir(exist_ok=True)
BASE='http://127.0.0.1:4173'
reports=[];errors=[];external=[];writes=[]


def context(browser,width=980,height=900,seed=None,fallback=False):
 c=browser.new_context(viewport={'width':width,'height':height},timezone_id='Africa/Lagos')
 c.add_init_script("try{sessionStorage.setItem('sixhours:signup-dismissed','1')}catch{}")
 if seed:c.add_init_script("if(location.origin==='"+BASE+"')localStorage.setItem('six-preview:v1',"+json.dumps(json.dumps(seed))+")")
 if fallback:c.add_init_script('HTMLElement.prototype.showPopover=undefined')
 c.on('page',lambda p:p.on('pageerror',lambda e:errors.append(str(e))))
 c.on('request',lambda r:external.append(r.url) if r.url.startswith('http') and not r.url.startswith(BASE) else None)
 c.on('request',lambda r:writes.append([r.method,r.url]) if r.method not in ['GET','HEAD'] else None)
 return c


def ready(p,route=''):
 p.goto(BASE+'/'+route,wait_until='networkidle');p.wait_for_function("document.documentElement.dataset.ready==='true'");p.evaluate('document.fonts.ready')


def decoded(p):
 p.evaluate("async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))}")
 assert p.evaluate('[...document.images].every(i=>i.naturalWidth>0)')


def pick(p,selector,label):
 p.locator(selector).click();p.get_by_role('option',name=label,exact=True).click()


def close(p):
 p.keyboard.press('Escape');expect(p.locator('#overlay')).not_to_be_visible()


def axe(p,label):
 p.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
 result=p.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))")
 (OUT/f'axe-{label}.json').write_text(json.dumps(result,indent=2));assert not result,result


def responsive(browser):
 c=context(browser,320,760,{'cart':[],'location':{'city':'abuja','area':'wuse'}});p=c.new_page();ready(p);decoded(p)
 matrix=[]
 for width in [320,360,390,650,768,800,820,900,901,980,1024,1440]:
  p.set_viewport_size({'width':width,'height':900});p.wait_for_timeout(60)
  result=p.evaluate('''()=>{
   const badLabels=[...document.querySelectorAll('.card-add')].flatMap(button=>{const r=document.createRange();r.selectNodeContents(button);const t=r.getBoundingClientRect(),b=button.getBoundingClientRect();return t.top<b.top-.5||t.bottom>b.bottom+.5||t.left<b.left-.5||t.right>b.right+.5?[{text:button.textContent,button:b.toJSON(),textBounds:t.toJSON()}]:[]});
   const tiles=[...document.querySelectorAll('.category-tile')].map(tile=>{const art=tile.querySelector('.category-art').getBoundingClientRect();return{heading:tile.querySelector('h2').getBoundingClientRect().right,link:tile.querySelector('.category-link').getBoundingClientRect().right,art:art.left}});
   const h=document.querySelector('.campaign h2'),style=getComputedStyle(h);
   return{width:innerWidth,documentWidth:document.documentElement.scrollWidth,badLabels,tiles,campaignLines:h.getBoundingClientRect().height/parseFloat(style.lineHeight)}
  }''')
  assert result['documentWidth']<=width,result
  assert not result['badLabels'],result
  assert all(max(t['heading'],t['link'])<=t['art']+.5 for t in result['tiles']),result
  assert width<768 or abs(result['campaignLines']-2)<.02,result
  matrix.append(result)
  if width in [320,390,768,980]:
   p.evaluate('scrollTo(0,0)');p.screenshot(path=str(OUT/f'after-top-{width}.jpg'),quality=90)
   p.locator('.category-section').scroll_into_view_if_needed();p.screenshot(path=str(OUT/f'after-categories-{width}.jpg'),quality=90)
 p.set_viewport_size({'width':320,'height':760});p.locator('#home-products [data-product="ipad-air"].card-add').scroll_into_view_if_needed();p.screenshot(path=str(OUT/'after-unavailable-320.jpg'),quality=90)
 for width in [320,390,470]:
  p.set_viewport_size({'width':width,'height':760});p.evaluate('scrollTo(0,0)');p.locator('.menu-toggle').click();p.wait_for_timeout(550)
  logo=p.locator('.overlay-header h2 img').bounding_box();dismiss=p.locator('[data-close-overlay]').bounding_box()
  assert logo['x']+logo['width']<=dismiss['x']-8,(logo,dismiss)
  if width==320:p.screenshot(path=str(OUT/'after-menu-320.jpg'),quality=88)
  close(p)
 # Unavailable purchase labels must also leave the product's quantity/add controls equally high.
 ready(p,'#product/ipad-air')
 for width in [320,390,650,768,820,980,1440]:
  p.set_viewport_size({'width':width,'height':800})
  heights=p.locator('.product-purchase-row').evaluate('e=>[...e.children].map(x=>x.getBoundingClientRect().height)')
  assert heights==[56,56],(width,heights)
 (OUT/'responsive-detail-matrix.json').write_text(json.dumps(matrix,indent=2));c.close()
 reports.append({'case':'labels-and-category-art-do-not-overlap-at-12-widths; narrow-menu-close-is-clear','status':'passed'})


def availability(browser):
 seed={'cart':[{'productId':'iphone-16','variantId':'128gb','quantity':4}],'location':{'city':'abuja','area':'wuse'}}
 c=context(browser,980,900,seed);p=c.new_page();ready(p,'#product/iphone-16')
 expect(p.locator('[data-product-step="1"]')).to_be_disabled();expect(p.locator('[data-product-stock]')).to_contain_text('1 more')
 p.locator('.variant-chip').filter(has=p.locator('input[value="256gb"]')).click();expect(p.locator('[data-product-step="1"]')).to_be_disabled()
 p.locator('[data-product-add]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (5)')
 assert all(p.locator('[data-action="cart-plus"]').nth(i).is_disabled() for i in range(2))
 close(p);expect(p.locator('[data-product-add]')).to_be_disabled();expect(p.locator('[data-product-add]')).to_have_text('Bag at limit')
 expect(p.locator('.product-config input[value="256gb"]')).to_be_focused()
 # Both product variants and the component-backed set share this cap, without a rejected click.
 p.evaluate("location.hash='#bundle/everyday-essentials'");expect(p.locator('[data-bundle-add]')).to_be_disabled();expect(p.locator('[data-bundle-status]')).to_contain_text('iPhone 16')
 p.locator('.bag-button').click();p.locator('[data-action="cart-minus"]').first.click();close(p)
 expect(p.locator('[data-bundle-add]')).to_be_enabled();p.locator('[data-bundle-add]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (6)')
 c.close();reports.append({'case':'remaining-stock-includes-other-variants-and-set-components; disabled-opener-focus-is-restored','status':'passed'})


def city_updates_and_decrements(browser):
 c=context(browser,980,900,{'cart':[],'location':{'city':'lagos','area':'yaba'}});p=c.new_page();ready(p,'#product/ipad-mini')
 related=p.locator('.related-section [data-product="ipad-air"].card-add');expect(related).to_be_enabled()
 p.evaluate("window.retainedRelated=document.querySelector('.related-section .product-card img')")
 p.locator('.announcement button').click();pick(p,'#delivery-city','Abuja');pick(p,'#delivery-area','Wuse');p.locator('.delivery-form [type="submit"]').click();p.locator('[data-use-area]').click();expect(p.locator('#overlay')).not_to_be_visible()
 expect(related).to_be_disabled();assert p.evaluate("window.retainedRelated===document.querySelector('.related-section .product-card img')")
 expect(p.locator('#home-products [data-product="ipad-air"].card-add')).to_be_disabled();c.close()
 c=context(browser,980,900,{'cart':[{'productId':'iphone-16','variantId':'128gb','quantity':8}],'location':{'city':'abuja','area':'wuse'}});p=c.new_page();ready(p);p.locator('.bag-button').click()
 expect(p.locator('[data-action="cart-plus"]')).to_be_disabled();expect(p.locator('[data-action="begin-checkout"]')).to_be_disabled()
 for count in [7,6,5]:
  p.locator('[data-action="cart-minus"]').click();expect(p.locator('#overlay-title')).to_have_text(f'Your bag ({count})');expect(p.locator('[data-action="cart-minus"]')).to_be_focused()
 expect(p.locator('[data-action="begin-checkout"]')).to_be_enabled();c.close()
 reports.append({'case':'city-change-updates-related-cards-without-replacing-images; overstock-can-decrease-to-valid','status':'passed'})


def removal_focus(browser):
 cart=[{'productId':'airpods-4','variantId':'anc','quantity':1},{'productId':'jbl-flip-6','variantId':'blue','quantity':1}]
 c=context(browser,390,760,{'cart':cart});p=c.new_page();ready(p);p.locator('.bag-button').click()
 p.locator('[data-action="cart-remove"]').first.focus();p.keyboard.press('Enter');expect(p.locator('[data-action="cart-remove"]')).to_be_focused()
 p.keyboard.press('Enter');expect(p.locator('.empty-bag .button')).to_be_focused();axe(p,'empty-bag')
 close(p);expect(p.locator('.bag-button')).to_be_focused();c.close()
 c=context(browser,980,900,{'cart':[{'productId':'iphone-16','variantId':'128gb','quantity':4}],'location':{'city':'abuja','area':'wuse'}});p=c.new_page();ready(p);p.locator('.bag-button').click();p.locator('[data-action="cart-plus"]').click()
 expect(p.locator('[data-action="cart-plus"]')).to_be_disabled();expect(p.locator('[data-action="cart-minus"]')).to_be_focused();c.close()
 reports.append({'case':'removing-current-or-final-line-and-reaching-plus-limit-keeps-focus-in-bag','status':'passed'})


def panel_switch(browser):
 seed={'cart':[{'productId':'airpods-4','variantId':'anc','quantity':1},{'productId':'jbl-flip-6','variantId':'blue','quantity':1},{'productId':'magic-keyboard','variantId':'standard','quantity':1}]}
 c=context(browser,1440,760,seed);p=c.new_page();ready(p);card=p.locator('#home-products [data-product-card="iphone-16"]');card.hover();card.locator('.quick-view').click();p.wait_for_timeout(550)
 trace=p.evaluate('''async()=>{const body=document.querySelector('#overlay-content');body.scrollTop=body.scrollHeight;const previous=body.scrollTop;document.querySelector('[data-product-add]').click();const t=performance.now(),frames=[];await new Promise(resolve=>{function sample(){const r=document.querySelector('.overlay-surface').getBoundingClientRect();frames.push({t:performance.now()-t,x:r.x,y:r.y,scroll:body.scrollTop});if(performance.now()-t<550)requestAnimationFrame(sample);else resolve()}requestAnimationFrame(sample)});return{previous,frames}}''')
 assert trace['previous']>0,trace
 assert all(abs(f['y'])<1 and f['x']>=969 and f['scroll']==0 for f in trace['frames']),trace
 assert abs(trace['frames'][-1]['x']-970)<1,trace
 decoded(p);p.screenshot(path=str(OUT/'after-panel-switch.jpg'),quality=88)
 (OUT/'panel-switch-motion.json').write_text(json.dumps(trace,indent=2));close(p)
 # Close in the same task in which initial focus was scheduled. No stale rAF may focus the input.
 race=p.evaluate('''async()=>{document.querySelector('.header-actions [data-action="open-search"]').click();document.querySelector('[data-close-overlay]').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return document.activeElement.id==='drawer-search'}''')
 assert not race;expect(p.locator('#overlay')).not_to_be_visible()
 p.locator('.header-actions [data-action="open-search"]').click();expect(p.locator('#drawer-search')).to_be_focused()
 p.keyboard.press('Escape');p.keyboard.press('Control+k');expect(p.locator('#drawer-search')).to_be_focused();p.wait_for_timeout(600);expect(p.locator('#overlay')).to_be_visible();close(p)
 c.close();reports.append({'case':'centered-view-to-drawer-enters-from-correct-edge-at-scroll-zero; rapid-close-reopen-is-safe','status':'passed'})


def dropdowns(browser):
 for fallback in [False,True]:
  for height in [620,375]:
   c=context(browser,980,height,fallback=fallback);p=c.new_page();ready(p);p.locator('.announcement button').click();pick(p,'#delivery-city','Lagos')
   trigger=p.locator('#delivery-area');trigger.click();before=p.locator('#overlay-content').evaluate('e=>e.scrollTop')
   listing=p.locator('#delivery-area-list');rect=listing.bounding_box()
   assert rect and rect['y']>=0 and rect['y']+rect['height']<=height+.5,rect
   trigger.press('End');trigger.press('ArrowUp');trigger.press('Home');trigger.press('End')
   assert p.locator('#overlay-content').evaluate('e=>e.scrollTop')==before
   assert listing.evaluate('e=>e.scrollTop')>0
   if height==620 and not fallback:
    p.screenshot(path=str(OUT/'after-area-popover.jpg'),quality=90);axe(p,'area-popover')
   trigger.press('Escape');expect(p.locator('#overlay')).to_be_visible();expect(listing).not_to_be_visible()
   pick(p,'#delivery-area','Yaba');p.locator('.delivery-form [type="submit"]').click()
   result=p.locator('.delivery-result');expect(result).to_be_focused();box=result.bounding_box();body=p.locator('#overlay-content').bounding_box()
   assert body['y']<=box['y']<body['y']+body['height']-60,(body,box)
   if height==620 and not fallback:p.screenshot(path=str(OUT/'after-delivery-result.jpg'),quality=90)
   p.locator('[data-use-area]').click();expect(p.locator('#overlay')).not_to_be_visible();c.close()
 # An inline collection select near the viewport edge must not jump the document on keyboard navigation.
 c=context(browser,320,560);p=c.new_page();ready(p,'#shop');trigger=p.get_by_role('combobox',name='Sort products');trigger.scroll_into_view_if_needed();trigger.focus();before=p.evaluate('scrollY');trigger.press('End')
 listing=p.locator('[role="listbox"]:visible');rect=listing.bounding_box();assert rect['x']>=0 and rect['x']+rect['width']<=320 and rect['y']>=0 and rect['y']+rect['height']<=560+.5,rect
 assert p.evaluate('scrollY')==before
 trigger.press('Enter');expect(p.locator('#route-view .product-card').first).to_have_attribute('data-product-card','airpods-4');c.close()
 reports.append({'case':'popover-flips-and-clamps-at-620px-and-375px-heights; keyboard-does-not-scroll-panel; delivery-result-visible; portal-fallback','status':'passed'})


def carousel_and_forms(browser):
 c=context(browser,980,900);p=c.new_page();ready(p);dot=p.locator('[data-review-index="1"]');dot.click();p.wait_for_timeout(550);dot.focus()
 p.evaluate("window.retainedDot=document.activeElement;window.retainedReview=document.querySelector('.reviews-track').firstElementChild")
 for width,height in [(980,820),(390,760),(820,760),(1440,900)]:
  p.set_viewport_size({'width':width,'height':height});p.wait_for_timeout(80);expect(dot).to_be_focused();expect(dot).to_have_attribute('aria-pressed','true')
  assert p.evaluate("window.retainedDot===document.activeElement&&window.retainedReview===document.querySelector('.reviews-track').firstElementChild")
  assert p.locator('.review-card[aria-hidden="false"]').count()==(1 if width<=650 else 2 if width<=800 else 3)
 for _ in range(7):p.locator('[data-review-step="1"]').click();p.wait_for_timeout(520)
 expect(p.locator('[data-review-index="2"]')).to_have_attribute('aria-pressed','true')
 p.locator('#newsletter-name').fill('Ada');p.locator('#newsletter-email').fill('ada@example.com');p.locator('.newsletter-submit').click();expect(p.locator('#newsletter-feedback')).to_contain_text('Nothing was sent')
 p.locator('#newsletter-email').fill('invalid');expect(p.locator('#newsletter-feedback')).to_be_empty();p.locator('.newsletter-submit').click();expect(p.locator('#newsletter-email')).to_have_attribute('aria-invalid','true');c.close()
 reports.append({'case':'carousel-retains-DOM-selected-slide-and-focus-across-height-and-breakpoint-resizes; stale-form-success-clears','status':'passed'})


def navigation_history(browser):
 c=context(browser,390,800);p=c.new_page();ready(p);decoded(p)
 item=p.locator('#home-products [data-product-card="apple-pencil-pro"] h3 a');item.scroll_into_view_if_needed();original=p.evaluate('scrollY')
 item.click();expect(p.locator('#route-view h1')).to_have_text('Apple Pencil Pro');expect(p.locator('#route-view h1')).to_be_focused()
 p.go_back();expect(p.locator('.hero')).to_be_visible();expect(item).to_be_focused();assert abs(p.evaluate('scrollY')-original)<1
 p.go_forward();expect(p.locator('#route-view h1')).to_have_text('Apple Pencil Pro')
 # A filtered entry keeps its history identity when collection controls replace the URL.
 p.locator('.related-section .inline-link').click();expect(p.locator('#route-view .product-card')).to_have_count(20)
 pick(p,'[data-sort-select] .select-trigger','Price: low to high');p.locator('[data-filter-toggle]').click();pick(p,'[data-price-select] .select-trigger','Up to ₦100,000');p.locator('[data-filter-toggle]').click()
 product=p.locator('#route-view [data-product-card="belkin-powerbank"] h3 a');product.scroll_into_view_if_needed();scroll=p.evaluate('scrollY');hash=p.evaluate('location.hash')
 product.click();expect(p.locator('#route-view h1')).to_have_text('Belkin Magnetic Power Bank');p.go_back();expect(p.locator('#route-view .product-card')).to_have_count(3);expect(product).to_be_focused()
 assert p.evaluate('location.hash')==hash and abs(p.evaluate('scrollY')-scroll)<1
 # Footer links are outside main, but their focus/scroll must restore too.
 footer=p.locator('.footer-links a[href="#promise"]');footer.scroll_into_view_if_needed();footer_scroll=p.evaluate('scrollY');footer.click();expect(p.locator('.promise-page-intro')).to_be_visible();p.go_back();expect(footer).to_be_focused();assert abs(p.evaluate('scrollY')-footer_scroll)<1
 (OUT/'navigation-history.json').write_text(json.dumps({'homeReturnY':original,'filteredCollectionReturnY':scroll,'filteredHash':hash,'footerReturnY':footer_scroll,'status':'passed'},indent=2))
 c.close();reports.append({'case':'back-forward-restores-collection-position-focus-and-filters; footer-focus-restores','status':'passed'})


def galleries(browser):
 for product,multiple in [('galaxy-a17',False),('iphone-16',True)]:
  c=context(browser,320,600);p=c.new_page();ready(p,'#product/'+product);p.locator('[data-gallery-open]').click();expect(p.locator('#overlay')).to_have_attribute('data-kind','gallery')
  expect(p.locator('[data-gallery-step]')).to_have_count(2 if multiple else 0)
  p.keyboard.press('ArrowRight');expect(p.locator('.gallery-counter')).to_have_text('2 / 2' if multiple else '1 / 1')
  if not multiple:axe(p,'single-image-gallery')
  close(p);expect(p.locator('[data-gallery-open]')).to_be_focused();c.close()
 reports.append({'case':'single-photo-gallery-has-no-dead-arrows; multi-photo-keyboard-and-focus-return-work','status':'passed'})


def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(args=['--no-sandbox'])
  try:
   for test in [responsive,availability,city_updates_and_decrements,removal_focus,panel_switch,dropdowns,carousel_and_forms,navigation_history,galleries]:
    test(browser);print(reports[-1]['case'],flush=True)
  except Exception:
   for c in browser.contexts:
    for p in c.pages:
     try:p.screenshot(path=str(OUT/'regression-failure.jpg'),quality=88)
     except Exception:pass
   raise
  finally:browser.close()
 assert not errors and not external and not writes,(errors,external,writes)
 reports.append({'case':'local-only-regressions','status':'passed','pageErrors':errors,'externalRequests':external,'nonReadRequests':writes})
 (OUT/'regression-report.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))
if __name__=='__main__':main()
