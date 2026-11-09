const DISMISSED_KEY = 'sixhours:signup-dismissed';

/** Both forms validate locally. There is deliberately no subscription request or CAPTCHA. */
function mountLocalForm(form, feedback, onValid = () => {}) {
  const submit = event => {
    event.preventDefault();
    const name = form.elements.namedItem('name');
    const email = form.elements.namedItem('email');
    const nameValid = name.value.trim().length >= 2;
    const emailValid = email.value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    name.setAttribute('aria-invalid', String(!nameValid));
    email.setAttribute('aria-invalid', String(!emailValid));
    feedback.classList.toggle('is-error', !nameValid || !emailValid);
    if (!nameValid || !emailValid) {
      feedback.textContent = [!nameValid && 'Enter a name with at least two characters.', !emailValid && 'Enter a valid email address.'].filter(Boolean).join(' ');
      (!nameValid ? name : email).focus();
      return;
    }
    feedback.textContent = 'Form checks completed locally. Nothing was sent and no subscription was created.';
    onValid();
  };
  const input = event => { event.target.removeAttribute('aria-invalid'); feedback.textContent = ''; feedback.classList.remove('is-error'); };
  form.addEventListener('submit', submit); form.addEventListener('input', input);
  return () => { form.removeEventListener('submit', submit); form.removeEventListener('input', input); };
}

export function createNewsletterFeature({ overlay }) {
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1'; } catch { /* Memory-only mode remains functional. */ }
  let loadTimer; let idleTimer;
  const dismiss = () => {
    dismissed = true; clearTimeout(loadTimer); clearTimeout(idleTimer);
    try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch { /* No storage is required. */ }
  };
  const footerForm = document.querySelector('[data-newsletter-form]');
  mountLocalForm(footerForm, document.querySelector('#newsletter-feedback'), dismiss);
  function showPopup() {
    if (dismissed || overlay.isOpen || document.visibilityState !== 'visible' || document.body.dataset.route !== 'home' || document.activeElement?.matches('input, textarea')) return;
    overlay.open({ title: 'The Sixhours local form preview', kind: 'newsletter', content: `<div class="signup-card"><div class="signup-copy"><h3>Good tech.<br>Less waiting.</h3><p>A little closer to the next everyday favourite.</p><form class="signup-form" novalidate><label class="sr-only" for="signup-name">First name</label><input id="signup-name" name="name" type="text" autocomplete="given-name" maxlength="80" placeholder="First Name" aria-describedby="signup-note signup-feedback"><label class="sr-only" for="signup-email">Email address</label><input id="signup-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="Enter your email" aria-describedby="signup-note signup-feedback"><p class="signup-note" id="signup-note">Local preview. Nothing is sent and no subscription is created.</p><button class="button button-dark full-width" type="submit">Try the Form</button><p class="signup-feedback" id="signup-feedback" role="status"></p></form></div><img src="images/editorial/audio.jpg" alt="An illustrative listening moment with headphones and an open book" width="896" height="1152"></div>`, onMount: root => mountLocalForm(root.querySelector('form'), root.querySelector('[role="status"]'), dismiss), onClose: dismiss });
  }
  let lastActivity = 0;
  const activity = () => {
    if (dismissed || Date.now() - lastActivity < 500) return;
    lastActivity = Date.now(); clearTimeout(idleTimer); idleTimer = setTimeout(showPopup, 90000);
  };
  if (!dismissed) {
    loadTimer = setTimeout(showPopup, 3000); activity();
    for (const event of ['pointerdown', 'pointermove', 'keydown', 'scroll']) window.addEventListener(event, activity, { passive: true });
  }
  return { showPopup };
}
