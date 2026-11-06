"use strict";
// Only independent local UI navigation is allowed out of a reference article.
const reportSize=()=>{const article=document.getElementById('promotion');if(article)parent.postMessage({type:'sporty-demo-article-size',height:Math.ceil(article.getBoundingClientRect().height)},location.origin)};
new ResizeObserver(reportSize).observe(document.getElementById('promotion'));
addEventListener('load',reportSize);document.fonts.ready.then(reportSize);
document.addEventListener('click',event=>{const target=event.target.closest('a,button');if(!target)return;if(target.tagName==='A'&&target.getAttribute('href')?.startsWith('#')&&target.getAttribute('href')!=='#demo-action')return;event.preventDefault();const destination=target.closest('[data-demo-destination]')?.dataset.demoDestination||'account/login';parent.postMessage({type:'sporty-demo-article-action',destination},location.origin)});
