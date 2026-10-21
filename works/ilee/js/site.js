/* ilee - navigation state, scroll reveals, form validation.
   Motion strategy: IntersectionObserver + CSS transforms only.
   No window scroll listeners anywhere on the page.
*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header state: the hero leaving the viewport switches the header to its
  // scrolled treatment. Observed, not polled.
  var header = document.querySelector('[data-header]');
  // Linear-style bar state: solid once the page leaves its very top.
  // Observed through an 8px sentinel, never polled.
  var barSentinel = document.getElementById('bar-sentinel');
  if (barSentinel && header && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(barSentinel);
  }

  // Mobile menu: Linear-style dialog panel. The fade is CSS (180ms), the
  // burger morph is CSS; this only flips state. Escape, tapping a link, or
  // crossing 900px closes it and unlocks scroll.
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu && header) {
    var hideFallback = null;
    var openMenu = function () {
      if (hideFallback) { clearTimeout(hideFallback); hideFallback = null; }
      mobileMenu.hidden = false;
      mobileMenu.classList.remove('is-closing');
      mobileMenu.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation menu');
      header.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      var first = mobileMenu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    };
    var closeMenu = function (refocus) {
      if (mobileMenu.hidden) return;
      mobileMenu.classList.remove('is-open');
      mobileMenu.classList.add('is-closing');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      header.classList.remove('menu-open');
      document.body.style.overflow = '';
      var finish = function () {
        if (!mobileMenu.classList.contains('is-closing')) return;
        mobileMenu.hidden = true;
        mobileMenu.classList.remove('is-closing');
      };
      mobileMenu.addEventListener('animationend', finish, { once: true });
      hideFallback = setTimeout(finish, 300);
      if (refocus) menuToggle.focus({ preventScroll: true });
    };
    menuToggle.addEventListener('click', function () {
      if (mobileMenu.hidden) { openMenu(); } else { closeMenu(true); }
    });
    mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
    });
    var desktopMq = window.matchMedia('(min-width: 900px)');
    var onMq = function (event) { if (event.matches) closeMenu(false); };
    if (desktopMq.addEventListener) { desktopMq.addEventListener('change', onMq); }
    else if (desktopMq.addListener) { desktopMq.addListener(onMq); }
  }

  // Scroll reveals with a gentle stagger per group.
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
    } else {
      // Stagger siblings that enter together (workflow steps, pathway rows).
      var siblingIndex = new Map();
      revealEls.forEach(function (el) {
        var parent = el.parentElement;
        if (!parent) return;
        var count = siblingIndex.get(parent) || 0;
        siblingIndex.set(parent, count + 1);
        if (count > 0) el.style.setProperty('--rd', (count * 0.08).toFixed(2) + 's');
      });
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  // FAQ accordion: answers start closed and use a grid-row transition so the
  // panel can reveal at its natural height without a hard-coded max-height.
  var faqTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-faq-trigger]'));
  faqTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.faq-item');
      var answerId = trigger.getAttribute('aria-controls');
      var answer = answerId ? document.getElementById(answerId) : null;
      var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(willOpen));
      if (item) item.classList.toggle('is-open', willOpen);
      if (answer) answer.setAttribute('aria-hidden', String(!willOpen));
    });
  });

  // Submit a lead inside the web app. A failed request stays on the page with
  // an actionable error; it never launches the visitor's email client.
  function submitLead(payload) {
    var button = payload.__button;
    var note = payload.__note;
    delete payload.__button;
    delete payload.__note;

    var original = button ? button.innerHTML : '';
    var showFailure = function () {
      if (button) {
        button.disabled = false;
        button.innerHTML = original;
      }
      if (note) {
        note.textContent = 'We could not connect to the rental desk. Nothing was sent. Check your connection and try again.';
        note.classList.add('form-note--error');
        note.setAttribute('role', 'alert');
      }
    };

    if (!window.fetch) { showFailure(); return; }
    if (note) note.classList.remove('form-note--error');
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }

    fetch('/api/v1/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.ok ? res.json() : res.json().catch(function () { return Promise.reject(res.status); }).then(function () { return Promise.reject(res.status); });
      })
      .then(function (body) {
        if (note) {
          note.textContent = body.nextStep || 'Your details are with the rental desk. We will contact you about the next step.';
          note.classList.remove('form-note--error');
          note.setAttribute('role', 'status');
        }
        if (button) { button.textContent = 'Sent to the desk'; }
      })
      .catch(showFailure);
  }

  // Partner form: client-side validation, inline errors, then a POST to the
  // API.
  var form = document.querySelector('[data-agent-form]');
  if (form) {
    var nameInput = document.getElementById('agent-name');
    var phoneInput = document.getElementById('agent-phone');
    var emailInput = document.getElementById('agent-email');
    var marketInput = document.getElementById('agent-market');
    var areaInput = document.getElementById('agent-area');
    var homeTypeInput = document.getElementById('agent-hometype');
    var consentInput = document.getElementById('agent-consent');

    function setError(input, message) {
      var slot = document.querySelector('[data-error-for="' + input.id + '"]');
      if (slot) slot.textContent = message || '';
      if (message) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    }

    function validate() {
      var valid = true;
      if (!nameInput.value.trim()) {
        setError(nameInput, 'Add your name so the partnership desk knows who to reply to.');
        valid = false;
      } else {
        setError(nameInput, '');
      }
      var phone = phoneInput.value.trim();
      if (phone) {
        var digits = phone.replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 15) {
          setError(phoneInput, 'That phone number looks short or long. Check the digits.');
          valid = false;
        } else {
          setError(phoneInput, '');
        }
      } else {
        setError(phoneInput, '');
      }
      var email = emailInput.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(emailInput, 'That email is missing a domain, or has a typo.');
        valid = false;
      } else {
        setError(emailInput, '');
      }
      if (!areaInput.value.trim()) {
        setError(areaInput, 'Add the area so the desk can route this to the right list.');
        valid = false;
      } else {
        setError(areaInput, '');
      }
      if (!consentInput.checked) {
        setError(consentInput, 'Tick the box so we can store and use your enquiry.');
        valid = false;
      } else {
        setError(consentInput, '');
      }
      return valid;
    }

    consentInput.addEventListener('change', function () {
      if (consentInput.getAttribute('aria-invalid')) validate();
    });

    [nameInput, phoneInput, emailInput, areaInput].forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid')) validate();
      });
    });

    form.addEventListener('submit', function (event) {
      if (!validate()) {
        event.preventDefault();
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      event.preventDefault();
      submitLead({
        role: 'landlord',
        // area is a short, filterable field (80 chars). Free text belongs in
        // note so realistic property details remain valid.
        area: areaInput.value.trim() || 'Not stated',
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        propertyType: homeTypeInput.value.trim(),
        note: marketInput.value.trim(),
        source: 'index_supply_form',
        consent: true,
        __button: form.querySelector('.form-submit'),
        __note: form.querySelector('.form-note')
      });
    });
  }

  // Contact form: same validation language as the partner form, with a
  // topic line so the desk can route the enquiry on arrival.
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    var cName = document.getElementById('contact-name');
    var cPhone = document.getElementById('contact-phone');
    var cEmail = document.getElementById('contact-email');
    var cTopic = document.getElementById('contact-topic');
    var cMessage = document.getElementById('contact-message');
    var cConsent = document.getElementById('contact-consent');
    var contactParams = new URLSearchParams(window.location.search);
    var requestedTopic = contactParams.get('topic');
    var context = contactParams.get('context');
    if (requestedTopic) {
      for (var optionIndex = 0; optionIndex < cTopic.options.length; optionIndex++) {
        if (cTopic.options[optionIndex].text === requestedTopic) {
          cTopic.selectedIndex = optionIndex;
          break;
        }
      }
    }
    if (context && !cMessage.value.trim()) cMessage.value = context;

    function setContactError(input, message) {
      var slot = document.querySelector('[data-error-for="' + input.id + '"]');
      if (slot) slot.textContent = message || '';
      if (message) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    }

    function validateContact() {
      var valid = true;
      if (!cName.value.trim()) {
        setContactError(cName, 'Add your name so the desk knows who to reply to.');
        valid = false;
      } else {
        setContactError(cName, '');
      }
      var phone = cPhone.value.trim();
      if (phone) {
        var digits = phone.replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 15) {
          setContactError(cPhone, 'That phone number looks short or long. Check the digits.');
          valid = false;
        } else {
          setContactError(cPhone, '');
        }
      } else {
        setContactError(cPhone, '');
      }
      var email = cEmail.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setContactError(cEmail, 'That email is missing a domain, or has a typo.');
        valid = false;
      } else {
        setContactError(cEmail, '');
      }
      if (!cConsent.checked) {
        setContactError(cConsent, 'Tick the box so we can store and use your enquiry.');
        valid = false;
      } else {
        setContactError(cConsent, '');
      }
      return valid;
    }

    cConsent.addEventListener('change', function () {
      if (cConsent.getAttribute('aria-invalid')) validateContact();
    });

    [cName, cPhone, cEmail].forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid')) validateContact();
      });
    });

    contactForm.addEventListener('submit', function (event) {
      if (!validateContact()) {
        event.preventDefault();
        var firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      event.preventDefault();
      // The topic decides the role. Filing a landlord as a tenant sends them
      // into the wrong ops queue.
      var TOPIC_ROLE = {
        'Looking for a rental home': 'tenant',
        'Listing a home': 'landlord',
        'Renting in installments': 'tenant',
        'Agent or caretaker partnership': 'agent'
      };
      var topicText = cTopic.options[cTopic.selectedIndex].text;

      submitLead({
        role: TOPIC_ROLE[topicText] || 'tenant',
        area: 'Not stated',
        name: cName.value.trim(),
        email: cEmail.value.trim(),
        phone: cPhone.value.trim(),
        note: topicText + (cMessage.value.trim() ? ' - ' + cMessage.value.trim() : ''),
        source: 'contact_form',
        consent: true,
        __button: contactForm.querySelector('.form-submit'),
        __note: contactForm.querySelector('.form-note')
      });
    });
  }

}());
