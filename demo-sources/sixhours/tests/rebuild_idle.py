"""Actual 95-second visible-tab idle test of the rebuilt store, not the reference."""
import asyncio, hashlib, json, time
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'verification/rebuild'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':980,'height':1800})
  page=await context.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  start=time.monotonic();await page.goto('http://127.0.0.1:4173/',wait_until='networkidle')
  await page.locator('#overlay[data-kind="newsletter"]').wait_for(state='visible',timeout=7000)
  appeared=time.monotonic()-start
  await page.wait_for_timeout(550)
  await page.screenshot(path=str(OUT/'signup-popup-980.jpg'),type='jpeg',quality=88)
  await page.locator('[data-close-overlay]').click();await page.locator('#overlay').wait_for(state='hidden')
  await page.wait_for_timeout(600)
  await page.locator('.hero-background').evaluate('i=>i.decode()')
  before=hashlib.sha256(await page.locator('.hero').screenshot()).hexdigest()
  track=await page.locator('.reviews-track').evaluate('e=>getComputedStyle(e).transform')
  visibility=await page.evaluate('document.visibilityState')
  started=time.monotonic();print(f'Popup observed after {appeared:.3f}s, dismissed; beginning visible-tab idle verification.',flush=True)
  await page.wait_for_timeout(95200)
  elapsed=time.monotonic()-started
  after=hashlib.sha256(await page.locator('.hero').screenshot()).hexdigest()
  result={'elapsedSeconds':elapsed,'popupObservedAfterSeconds':appeared,'visibilityBefore':visibility,'visibilityAfter':await page.evaluate('document.visibilityState'),'heroPixelsIdentical':before==after,'manualCarouselUnchanged':track==await page.locator('.reviews-track').evaluate('e=>getComputedStyle(e).transform'),'popupClosed':not await page.locator('#overlay').is_visible(),'sessionDismissed':await page.evaluate("sessionStorage.getItem('sixhours:signup-dismissed')==='1'"),'activeAnimations':await page.evaluate("document.getAnimations().filter(a=>a.playState==='running').length"),'pageErrors':errors}
  (OUT/'store-idle-verified.json').write_text(json.dumps(result,indent=2))
  assert elapsed>=95 and result['heroPixelsIdentical'] and result['manualCarouselUnchanged'] and result['popupClosed'] and result['sessionDismissed'] and result['activeAnimations']==0 and not errors,result
  print(json.dumps(result,indent=2),flush=True);await browser.close()
asyncio.run(main())
