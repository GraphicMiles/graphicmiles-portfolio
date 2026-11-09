"""Behavioral acceptance checks for the rebuilt HTML presentation. No real services."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
from datetime import datetime, timezone
import json, traceback
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'verification/rebuild'; OUT.mkdir(exist_ok=True)
BASE='http://127.0.0.1:4173'
reports=[]; errors=[]; external=[]; writes=[]

def context(browser,width=1440,seed=None,mobile=False):
 c=browser.new_context(viewport={'width':width,'height':1000},timezone_id='Africa/Lagos',has_touch=mobile,is_mobile=mobile)
 c.add_init_script("try{sessionStorage.setItem('sixhours:signup-dismissed','1')}catch{}")
 if seed:c.add_init_script("if(location.origin==='"+BASE+"')localStorage.setItem('six-preview:v1',"+json.dumps(json.dumps(seed))+")")
 c.on('page',lambda p:p.on('pageerror',lambda e:errors.append(str(e))))
 c.on('request',lambda r:external.append(r.url) if r.url.startswith('http') and not r.url.startswith(BASE) else None)
 c.on('request',lambda r:writes.append([r.method,r.url]) if r.method not in ['GET','HEAD'] else None)
 return c

def ready(page,hash=''):
 page.goto(BASE+'/'+hash,wait_until='networkidle'); page.wait_for_function("document.documentElement.dataset.ready==='true'");page.evaluate('document.fonts.ready')

def pick(page,selector,label):
 button=page.locator(selector);button.click();button.locator('..').get_by_role('option',name=label,exact=True).click()

def close(page):
 page.keyboard.press('Escape');expect(page.locator('#overlay')).not_to_be_visible()

def audit(page,label):
 page.add_script_tag(path=str(ROOT/'node_modules/axe-core/axe.min.js'))
 violations=page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))")
 (OUT/f'axe-{label}.json').write_text(json.dumps(violations,indent=2))
 assert not violations,violations

def commerce(browser):
 c=context(browser);p=c.new_page();p.clock.set_fixed_time(datetime(2026,11,9,10,30,tzinfo=timezone.utc));ready(p)
 expect(p.locator('#home-products .product-card')).to_have_count(20);expect(p.locator('#home-bundles .bundle-card')).to_have_count(8)
 card=p.locator('#home-products .product-card').first;card.hover();p.wait_for_timeout(450)
 assert card.locator('.product-alternate').evaluate('e=>getComputedStyle(e).opacity')=='1'
 assert card.locator('.card-add').evaluate('e=>getComputedStyle(e).opacity')=='1'
 assert card.locator('.product-photo').evaluate('e=>getComputedStyle(e).transform')=='none'
 p.evaluate('scrollTo(0,0)');p.locator('.header-actions [data-action="open-search"]').click();expect(p.locator('#drawer-search')).to_be_focused()
 p.locator('#drawer-search').fill('no-such-gadget');expect(p.locator('.search-results .empty-state')).to_be_visible()
 p.locator('[data-clear-search]').click();p.locator('#drawer-search').fill('AirPods');expect(p.locator('.search-result')).to_have_count(2)
 p.locator('#drawer-search').press('Enter');expect(p.locator('#route-view .product-card')).to_have_count(2)
 p.evaluate("location.hash='#shop'");expect(p.locator('#route-view .product-card')).to_have_count(20)
 sort=p.get_by_role('combobox',name='Sort products');sort.focus();sort.press('ArrowDown');sort.press('ArrowDown');sort.press('Enter')
 expect(p.locator('#route-view .product-card').first).to_have_attribute('data-product-card','apple-adapter')
 p.locator('[data-filter-toggle]').click();expect(p.locator('.collection-filter-panel')).to_be_visible()
 pick(p,'[data-price-select] .select-trigger','Up to ₦100,000');expect(p.locator('#route-view .product-card')).to_have_count(3)
 p.locator('[data-shop-category="phones"]').click();expect(p.locator('#route-view .empty-state')).to_be_visible()
 p.locator('[data-reset-shop]').click();expect(p.locator('#route-view .product-card')).to_have_count(20)
 p.locator('#route-view [data-product-card="iphone-16"] h3 a').click();expect(p.locator('#route-view h1')).to_have_text('iPhone 16')
 assert p.locator('.product-config h1').evaluate('e=>getComputedStyle(e).fontSize')=='28px'
 p.locator('.variant-chip').filter(has=p.locator('input[value="256gb"]')).click();expect(p.locator('[data-price]')).to_contain_text('1,250,000')
 p.locator('[data-product-step="1"]').click();expect(p.locator('[data-product-quantity]')).to_have_text('2')
 first=p.locator('.product-main-image img').get_attribute('src');p.locator('[data-gallery-index="1"]').click();expect(p.locator('.product-main-image img')).not_to_have_attribute('src',first)
 p.locator('[data-gallery-open]').click();expect(p.locator('#overlay')).to_have_attribute('data-kind','gallery');p.keyboard.press('ArrowRight');close(p);expect(p.locator('[data-gallery-open]')).to_be_focused()
 p.locator('[data-product-add]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (2)');expect(p.locator('.cart-summary')).to_contain_text('2,500,000')
 p.locator('[data-action="cart-plus"]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (3)');p.locator('[data-action="cart-minus"]').click()
 p.reload(wait_until='networkidle');expect(p.locator('[data-bag-count]')).to_have_text('2');p.locator('.bag-button').click()
 p.locator('#overlay [data-action="open-delivery"]').click();p.locator('.delivery-form button[type="submit"]').click();expect(p.locator('[data-delivery-error]')).to_contain_text('Choose your city')
 pick(p,'#delivery-city','Lagos');pick(p,'#delivery-area','Yaba');p.locator('.delivery-form button[type="submit"]').click();expect(p.locator('.delivery-result')).to_contain_text('3,500')
 p.locator('[data-use-area]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (2)')
 p.locator('[data-action="begin-checkout"]').click();expect(p.locator('.checkout-form')).to_be_visible();p.locator('[data-review-order]').click();expect(p.locator('.error-summary')).to_be_focused()
 p.locator('[data-sample-details]').click();p.locator('[data-review-order]').click();expect(p.locator('.review-window')).to_contain_text('Within 6 hours')
 p.screenshot(path=str(OUT/'checkout-review.jpg'),full_page=True,quality=84)
 p.clock.set_fixed_time(datetime(2026,11,9,14,0,tzinfo=timezone.utc));p.locator('[data-confirm-demo]').click();expect(p.locator('.checkout-notice')).to_contain_text('The order window has changed');expect(p.locator('.confirmation-page')).to_have_count(0)
 p.locator('[data-confirm-demo]').click();expect(p.locator('.confirmation-page')).to_be_visible();expect(p.locator('.confirmation-heading')).to_contain_text('sixhours experience');expect(p.locator('.confirmation-topline')).to_contain_text('Next window: tomorrow')
 saved=p.evaluate("JSON.parse(localStorage.getItem('six-preview:v1'))");assert saved['cart']==[] and saved['lastDemo']['demo'] is True
 assert not any(word in json.dumps(saved) for word in ['ada@example.com','08012345678','12 Example Street'])
 audit(p,'confirmation');c.close()
 reports.append({'case':'search-filter-sort-gallery-cart-delivery-and-cutoff-checkout','status':'passed'})

def sets(browser):
 seed={'cart':[{'productId':'apple-adapter','variantId':'20w','quantity':9}],'location':{'city':'lagos','area':'yaba'}}
 c=context(browser,seed=seed);p=c.new_page();ready(p,'#bundle/everyday-essentials')
 expect(p.locator('[data-bundle-add]')).to_be_disabled();expect(p.locator('[data-bundle-status]')).to_contain_text('up to 9');expect(p.locator('[data-bag-count]')).to_have_text('9')
 saved=p.evaluate("JSON.parse(localStorage.getItem('six-preview:v1')).cart");assert len(saved)==1 and saved[0]['productId']=='apple-adapter'
 p.locator('.bag-button').click();p.locator('[data-action="cart-remove"]').click();expect(p.locator('.empty-bag')).to_be_visible();close(p)
 p.locator('[data-bundle-add]').click();expect(p.locator('#overlay-title')).to_have_text('Your bag (2)');expect(p.locator('.cart-item')).to_have_count(2)
 close(p);p.evaluate("location.hash='#bundles'");expect(p.locator('#route-view .bundle-card')).to_have_count(8)
 c.close()
 c=context(browser,seed={'cart':[],'location':{'city':'abuja','area':'wuse'}});p=c.new_page();ready(p,'#bundle/creative-kit');expect(p.locator('[data-bundle-add]')).to_be_disabled()
 p.locator('.announcement button').click();pick(p,'#delivery-city','Lagos');pick(p,'#delivery-area','Yaba');p.locator('.delivery-form button[type="submit"]').click();p.locator('[data-use-area]').click();expect(p.locator('[data-bundle-add]')).to_be_enabled();c.close()
 reports.append({'case':'eight-sets-atomic-add-and-shared-city-stock','status':'passed'})

def navigation_and_forms(browser):
 c=context(browser,980);p=c.new_page();ready(p)
 p.locator('.menu-toggle').click();expect(p.locator('#overlay')).to_have_attribute('data-kind','menu');p.wait_for_timeout(550)
 assert round(p.locator('.overlay-surface').bounding_box()['width'])==470
 parent=p.locator('.menu-links > li').first.locator('button').first;parent.click();p.wait_for_timeout(450);expect(parent).to_have_attribute('aria-expanded','true')
 assert abs(p.locator('.menu-links > li').first.locator('[data-menu-group]').first.bounding_box()['height']-262)<1
 nested=p.locator('.menu-sublist').first.locator('[data-menu-toggle]').first;nested.click();p.wait_for_timeout(450)
 p.locator('.menu-sublist a').filter(has_text='Samsung').click();expect(p.locator('#route-view .product-card')).to_have_count(1);expect(p.locator('#overlay')).not_to_be_visible()
 p.evaluate("location.hash='#home'");expect(p.locator('.hero')).to_be_visible()
 p.locator('.menu-toggle').click();p.wait_for_timeout(550);p.mouse.click(970,180);expect(p.locator('#overlay')).not_to_be_visible();expect(p.locator('.menu-toggle')).to_be_focused()
 p.locator('.help-launcher').click();expect(p.locator('.help-links')).to_be_visible();p.locator('.help-links [data-action="open-privacy"]').click();expect(p.locator('.policy-body')).to_contain_text('No checkout service is connected');close(p)
 p.locator('.newsletter-submit').click();expect(p.locator('#newsletter-name')).to_be_focused();expect(p.locator('#newsletter-feedback')).to_contain_text('at least two')
 p.locator('#newsletter-name').fill('Ada Example');p.locator('#newsletter-email').fill('bad');p.locator('.newsletter-submit').click();expect(p.locator('#newsletter-email')).to_be_focused()
 p.locator('#newsletter-email').fill('ada@example.com');p.locator('.newsletter-submit').click();expect(p.locator('#newsletter-feedback')).to_contain_text('no subscription was created')
 expect(p.locator('.faq-section details[open]')).to_have_count(2);p.locator('.faq-section details').first.locator('summary').click();expect(p.locator('.faq-section details[open]')).to_have_count(1)
 c.close();reports.append({'case':'nested-navigation-focus-help-information-and-honest-local-newsletter','status':'passed'})

def accessibility(browser):
 c=context(browser,980);p=c.new_page();ready(p);audit(p,'home')
 p.locator('.menu-toggle').click();p.wait_for_timeout(550);audit(p,'menu');close(p)
 p.locator('.header-actions [data-action="open-search"]').click();audit(p,'search');close(p)
 p.locator('.announcement button').click();audit(p,'delivery');close(p)
 p.evaluate("location.hash='#product/iphone-16'");expect(p.locator('.product-config')).to_be_visible();audit(p,'product')
 c.close();reports.append({'case':'automated-axe-checks-home-menu-search-delivery-product-and-confirmation','status':'passed'})

with sync_playwright() as playwright:
 browser=playwright.chromium.launch(args=['--no-sandbox'])
 try:
  for test in [commerce,sets,navigation_and_forms,accessibility]:test(browser)
  assert not errors and not external and not writes,(errors,external,writes)
  reports.append({'case':'local-only-runtime','status':'passed','pageErrors':errors,'externalRequests':external,'nonReadRequests':writes})
 except Exception as exc:
  for c in browser.contexts:
   for p in c.pages:
    try:p.screenshot(path=str(OUT/'behavior-failure.jpg'),full_page=True,quality=80)
    except:pass
  reports.append({'status':'failed','message':str(exc),'traceback':traceback.format_exc()})
  (OUT/'browser-report.json').write_text(json.dumps(reports,indent=2));raise
 finally:browser.close()
(OUT/'browser-report.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))
