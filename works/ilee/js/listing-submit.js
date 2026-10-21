/* ilee - the public listing submission form on list-your-home.html.

   Posts to /api/v1/listings/submit, which is mounted BEFORE the guarded
   /api/v1/listings router precisely so this stays a public write. There is no
   account and no session: D-001 survives the addition of supply intake.

   This file mirrors publicListingSchema in src/lib/validate.js. It does not
   replace it. The server is the authority on every rule here, and the client
   copy exists so a visitor learns that an area is outside the pilot before they
   have typed a whole form rather than after.

   Two rules worth naming:

   1. Never invent a reference. The honeypot branch answers 201 with
      reference:null on purpose, so a bot gets the same shape as a person and
      cannot learn it was caught. A page that displayed "your reference is null"
      would hand that back, so an absent reference renders as a plain
      acknowledgement.

   2. Never store what the form did not ask for. The fields posted are exactly
      the fields the schema declares. There is no place here to add a BVN, NIN,
      selfie or bank statement, and the API refuses them if someone posts one
      by hand - the guard is recursive, so nesting it under another key does not
      get past it either.
*/
(function () {
  'use strict';

  var form = document.querySelector('[data-listing-form]');
  if (!form) return;

  var status = document.querySelector('[data-listing-status]');
  var submitButton = document.querySelector('[data-listing-submit]');
  var areaSelect = document.querySelector('[data-launch-areas]');
  var priceLabel = document.querySelector('[data-listing-price-label]');
  var priceHint = document.querySelector('[data-listing-price-hint]');
  var categoryGroup = document.querySelector('[data-listing-category]');

  // Schema key -> input id. The server reports issues by schema key, and a
  // message that cannot be attached to the field it is about is a message a
  // visitor has to hunt for.
  var FIELD_IDS = {
    submitterName: 'listing-submitter-name',
    submitterRole: 'listing-submitter-role',
    submitterPhone: 'listing-submitter-phone',
    submitterEmail: 'listing-submitter-email',
    ownerName: 'listing-owner-name',
    ownerPhone: 'listing-owner-phone',
    agentName: 'listing-agent-name',
    area: 'listing-area',
    address: 'listing-address',
    homeType: 'listing-home-type',
    category: 'listing-category',
    priceNaira: 'listing-price',
    terms: 'listing-terms',
    acceptsInstallments: 'listing-installments',
    consent: 'listing-consent'
  };

  function setError(input, message) {
    if (!input) return;
    var slot = document.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(function (slot) { slot.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(function (input) { input.removeAttribute('aria-invalid'); });
  }

  function field(key) { return document.getElementById(FIELD_IDS[key]); }

  function selectedCategory() {
    var checked = categoryGroup ? categoryGroup.querySelector('input[name="category"]:checked') : null;
    return checked ? checked.value : 'rent';
  }

  /* The money question changes meaning with the category, and the label has to
     follow. An asking price described as an annual rent is the kind of error
     that costs a buyer their deposit. */
  function applyCategory() {
    var buying = selectedCategory() === 'buy';
    if (priceLabel) priceLabel.textContent = buying ? 'Asking price (\u20a6)' : 'Annual rent (\u20a6)';
    if (priceHint) {
      priceHint.textContent = buying
        ? 'Naira, no commas. The full purchase price, not a deposit.'
        : 'Naira, no commas. This is what a tenant pays for a year.';
    }
    var installmentsNote = document.getElementById('listing-installments-note');
    if (installmentsNote) {
      installmentsNote.textContent = buying
        ? 'Tick this only if you would genuinely take the price in agreed parts. ilee never holds or moves money, and nothing here obliges you to accept a schedule.'
        : 'Tick this only if you would genuinely take the rent in agreed parts. ilee never holds or moves money, and nothing here obliges you to accept a schedule.';
    }
  }

  /* Client-side mirror of publicListingSchema. Kept deliberately close to the
     server wording so the two never disagree about what a visitor did wrong. */
  function validate() {
    var ok = true;
    var name = field('submitterName');
    var role = field('submitterRole');
    var phone = field('submitterPhone');
    var email = field('submitterEmail');
    var owner = field('ownerName');
    var area = field('area');
    var homeType = field('homeType');
    var price = field('priceNaira');
    var consent = field('consent');

    if (!name.value.trim()) { setError(name, 'Add your name so the desk knows who to call.'); ok = false; }
    else setError(name, '');

    if (!role.value) { setError(role, 'Tell us whether you are the owner, an agent or a caretaker.'); ok = false; }
    else setError(role, '');

    // The schema requires one or the other, and reports the failure against
    // submitterPhone. Without a way to reach the submitter there is nothing to
    // verify, so this is refused at the door rather than recorded and lost.
    if (!phone.value.trim() && !email.value.trim()) {
      setError(phone, 'Add a phone number or an email so the desk can verify this home.');
      ok = false;
    } else {
      setError(phone, '');
      if (phone.value.trim() && !/^\+?[\d\s()-]{7,20}$/.test(phone.value.trim())) {
        setError(phone, 'That phone number looks short or long. Check the digits.');
        ok = false;
      }
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setError(email, 'That email is missing a domain, or has a typo.');
        ok = false;
      } else setError(email, '');
    }

    if (!owner.value.trim()) { setError(owner, 'Add the owner\u2019s name. The desk has to confirm who can offer this home.'); ok = false; }
    else setError(owner, '');

    if (!area.value) { setError(area, 'Choose the area the home is in.'); ok = false; }
    else setError(area, '');

    if (!homeType.value.trim()) { setError(homeType, 'Add the home type, for example duplex or two-bedroom flat.'); ok = false; }
    else setError(homeType, '');

    var digits = price.value.trim().replace(/[,\s]/g, '');
    if (!digits) { setError(price, 'Add the ' + (selectedCategory() === 'buy' ? 'asking price' : 'annual rent') + '.'); ok = false; }
    else if (!/^\d+$/.test(digits) || Number(digits) <= 0) {
      setError(price, 'Use digits only, with no commas - for example ' + (selectedCategory() === 'buy' ? '85000000' : '3000000') + '.');
      ok = false;
    } else setError(price, '');

    if (!consent.checked) { setError(consent, 'Tick the box so we can store these details and verify the home.'); ok = false; }
    else setError(consent, '');

    return ok;
  }

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.remove('form-note--error', 'form-note--ok');
    if (kind) status.classList.add('form-note--' + kind);
  }

  function setBusy(busy) {
    if (!submitButton) return;
    submitButton.disabled = busy;
    submitButton.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (!submitButton.dataset.originalHtml) submitButton.dataset.originalHtml = submitButton.innerHTML;
    submitButton.innerHTML = busy ? 'Sending...' : submitButton.dataset.originalHtml;
  }

  /* Turn the server's issue list into per-field messages. Anything the map does
     not know is appended to the status line rather than dropped: a refusal the
     visitor cannot see is a form that silently does not work. */
  function showIssues(issues) {
    var leftovers = [];
    (issues || []).forEach(function (issue) {
      var input = issue && issue.field ? document.getElementById(FIELD_IDS[issue.field]) : null;
      if (input) setError(input, issue.message);
      else leftovers.push((issue && issue.message) || 'Something in the form needs another look.');
    });
    if (leftovers.length) setStatus(leftovers.join(' '), 'error');
  }

  function payload() {
    var data = {
      submitterName: field('submitterName').value.trim(),
      submitterRole: field('submitterRole').value,
      submitterPhone: field('submitterPhone').value.trim(),
      submitterEmail: field('submitterEmail').value.trim(),
      ownerName: field('ownerName').value.trim(),
      ownerPhone: field('ownerPhone').value.trim(),
      agentName: field('agentName').value.trim(),
      area: field('area').value,
      address: field('address').value.trim(),
      homeType: field('homeType').value.trim(),
      category: selectedCategory(),
      priceNaira: field('priceNaira').value.trim().replace(/[,\s]/g, ''),
      terms: field('terms').value.trim(),
      acceptsInstallments: field('acceptsInstallments').checked,
      // The schema wants the literal true, not a checkbox string: consent that
      // can be satisfied by the word "no" is not consent.
      consent: field('consent').checked === true,
      // Posted deliberately. Empty for a person; a bot fills it and the route
      // stores nothing.
      website: document.getElementById('listing-website').value
    };
    return data;
  }

  function succeed(body) {
    clearErrors();
    // reference:null is the honeypot answer. Show an acknowledgement and stop;
    // inventing a reference here would be a lie to a person and a tell to a bot.
    if (!body || !body.reference) {
      setStatus((body && body.nextStep) || 'Thank you. Your details are with the desk.', 'ok');
      form.reset();
      applyCategory();
      return;
    }
    var lines = [];
    lines.push('Received. Your reference is ' + body.reference + '.');
    lines.push(body.nextStep || 'The desk will be in touch.');
    if (body.launchArea) lines.push('Pilot area: ' + body.launchArea + '.');
    setStatus(lines.join(' '), 'ok');
    // Leave the form filled and disabled rather than clearing it: the visitor
    // may want to read back what they sent, and a second submission from the
    // same address would hit the rate limiter anyway.
    form.querySelectorAll('input, select, textarea, button').forEach(function (el) { el.disabled = true; });
    if (status) status.setAttribute('tabindex', '-1');
  }

  function submit(event) {
    event.preventDefault();
    clearErrors();
    if (!validate()) {
      setStatus('Some fields need another look.', 'error');
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
      return;
    }
    if (!window.fetch) {
      setStatus('This browser cannot send the form securely. Please email the desk at hello@ilee.ng.', 'error');
      return;
    }

    setBusy(true);
    setStatus('Sending...');

    window.fetch('/api/v1/listings/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload())
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { res: res, body: body }; });
      })
      .then(function (result) {
        setBusy(false);
        var body = result.body || {};
        if (result.res.ok) { succeed(body); return; }

        if (body.error === 'validation_failed') {
          showIssues(body.issues);
          setStatus('Some fields need another look.', 'error');
          var firstInvalid = form.querySelector('[aria-invalid="true"]');
          if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
          return;
        }

        // The area is outside the pilot. Nothing was written, and the enquiry
        // form is the honest place for a home ilee does not serve yet, so the
        // response carries that link and this page uses it.
        if (body.error === 'area_outside_launch') {
          setError(field('area'), body.message || 'That area is outside the pilot.');
          setStatus(body.message || 'That area is outside the pilot.', 'error');
          if (body.enquiryForm && status) {
            var link = document.createElement('a');
            link.href = body.enquiryForm;
            link.className = 'text-link';
            link.textContent = 'Send it as an enquiry instead';
            status.appendChild(document.createTextNode(' '));
            status.appendChild(link);
          }
          return;
        }

        if (result.res.status === 429) {
          setStatus(body.message || 'Too many submissions from this connection. Please try again shortly.', 'error');
          return;
        }
        if (result.res.status >= 500) {
          setStatus('The desk could not record that just now. Nothing has been lost if you try again, or email hello@ilee.ng.', 'error');
          return;
        }
        setStatus(body.message || 'That submission was refused. Please check the form and try again.', 'error');
      })
      .catch(function () {
        setBusy(false);
        setStatus('The submission did not reach the desk. Check the connection and try again, or email hello@ilee.ng.', 'error');
      });
  }

  /* Fill the area select from /api/v1/meta rather than hardcoding it. The route
     refuses anything outside config.launchAreas, so a stale list here would let
     a visitor type a home we cannot verify and only find out on submit. */
  function loadAreas() {
    if (!areaSelect || !window.fetch) return;
    window.fetch('/api/v1/meta', { headers: { accept: 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (body) {
        var areas = (body && body.launchAreas) || [];
        if (!areas.length) throw new Error('no launch areas');
        areaSelect.innerHTML = '<option value="">Choose an area</option>' + areas.map(function (name) {
          return '<option value="' + name.replace(/"/g, '&quot;') + '">' + name + '</option>';
        }).join('');
        // Required, or the visible listbox keeps the "Loading pilot areas..."
        // option it was built with at parse time while the real select sits
        // display:none underneath it.
        if (window.ileeCustomSelect) window.ileeCustomSelect.refresh(form);
      })
      .catch(function () {
        // Degrade to a text input rather than a dead select: a visitor outside
        // the pilot still gets a clear refusal from the server, and a visitor
        // inside it can still submit.
        var note = document.createElement('span');
        note.className = 'form-hint';
        note.textContent = 'The pilot areas could not be loaded. Type your area and the desk will confirm it.';
        areaSelect.insertAdjacentElement('afterend', note);
        areaSelect.outerHTML = '<input id="listing-area" name="area" type="text" required maxlength="80" placeholder="Lekki or Ikeja">';
        if (window.ileeCustomSelect) window.ileeCustomSelect.refresh(form);
      });
  }

  form.addEventListener('submit', submit);
  if (categoryGroup) categoryGroup.addEventListener('change', applyCategory);
  form.addEventListener('input', function (event) {
    if (event.target && event.target.getAttribute && event.target.getAttribute('aria-invalid')) validate();
  });
  form.addEventListener('change', function (event) {
    if (event.target && event.target.getAttribute && event.target.getAttribute('aria-invalid')) validate();
  });

  applyCategory();
  loadAreas();
})();
