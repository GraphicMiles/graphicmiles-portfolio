/* ilee - the data-subject rights form on privacy.html.

   Posts to /api/v1/rights. A privacy notice that offers rights only by email
   offers them to the people least likely to need them, and the audit that led
   to this build found exactly that: the notice described rights the product had
   no route for. Now the notice and the API agree.

   The response is 202 with the same shape whether or not we hold anything about
   the requester, on purpose: confirming that a phone number is in our records
   would turn a public form into a lookup. This file therefore never says "we
   found you" or "we did not find you", and does not try to infer either from
   the response.
*/
(function () {
  'use strict';

  var form = document.querySelector('[data-rights-form]');
  if (!form) return;

  var status = document.querySelector('[data-rights-status]');
  var submitButton = document.querySelector('[data-rights-submit]');
  var kind = document.getElementById('rights-kind');
  var contact = document.getElementById('rights-contact');
  var reference = document.getElementById('rights-reference');
  var detail = document.getElementById('rights-detail');
  var consent = document.getElementById('rights-consent');
  var honeypot = document.getElementById('rights-website');

  var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function setError(input, message) {
    if (!input) return;
    var slot = document.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function setStatus(message, kindName) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.remove('form-note--error', 'form-note--ok');
    if (kindName) status.classList.add('form-note--' + kindName);
  }

  function setBusy(busy) {
    if (!submitButton) return;
    submitButton.disabled = busy;
    submitButton.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (!submitButton.dataset.originalHtml) submitButton.dataset.originalHtml = submitButton.innerHTML;
    submitButton.innerHTML = busy ? 'Sending...' : submitButton.dataset.originalHtml;
  }

  function validate() {
    var ok = true;
    if (!kind.value) { setError(kind, 'Choose what you are asking for.'); ok = false; } else setError(kind, '');

    var value = contact.value.trim();
    if (value.length < 5) {
      setError(contact, 'Add the phone number or email you used with us, so we can find the right records.');
      ok = false;
    } else {
      setError(contact, '');
    }

    // Optional, but if it is there it has to be a real reference: the route
    // matches on it to complete a withdrawal immediately, and a typo would send
    // a request down the manual path without telling the requester why.
    var ref = reference.value.trim();
    if (ref && !UUID.test(ref)) {
      setError(reference, 'That does not look like a reference we issued. It is a long string of letters and numbers with dashes. Leave it empty if you are not sure.');
      ok = false;
    } else setError(reference, '');

    if (!consent.checked) { setError(consent, 'Confirm the request is yours.'); ok = false; } else setError(consent, '');
    return ok;
  }

  function submit(event) {
    event.preventDefault();
    if (!validate()) {
      setStatus('Some fields need another look.', 'error');
      var first = form.querySelector('[aria-invalid="true"]');
      if (first && first.focus) first.focus();
      return;
    }
    if (!window.fetch) {
      setStatus('This browser cannot send the form securely. Please email hello@ilee.ng.', 'error');
      return;
    }

    setBusy(true);
    setStatus('Sending...');

    var body = {
      kind: kind.value,
      contact: contact.value.trim(),
      detail: detail.value.trim(),
      // The schema wants the literal true: consent satisfied by the word "no"
      // is not consent.
      consent: consent.checked === true,
      // Posted deliberately, empty for a person.
      website: honeypot ? honeypot.value : ''
    };
    var ref = reference.value.trim();
    if (ref) body.reference = ref;

    window.fetch('/api/v1/rights', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (parsed) { return { res: res, body: parsed }; });
      })
      .then(function (result) {
        setBusy(false);
        var payload = result.body || {};
        if (!result.res.ok) {
          if (result.res.status === 429) {
            setStatus(payload.message || 'Too many requests from this connection. Please try again shortly.', 'error');
            return;
          }
          if (payload.error === 'validation_failed' && payload.issues && payload.issues.length) {
            setStatus(payload.issues.map(function (i) { return i.message; }).join(' '), 'error');
            return;
          }
          if (result.res.status >= 500) {
            setStatus('The request did not reach the desk just now. Please try again, or email hello@ilee.ng.', 'error');
            return;
          }
          setStatus(payload.message || 'That request was refused. Please check the form and try again.', 'error');
          return;
        }

        // status is 'completed' only for a withdrawal that matched a consent
        // record and quoted its reference. Everything else is 'received'.
        // Neither is a statement about whether we hold the person's data.
        var lines = [];
        if (payload.reference) lines.push('Your reference is ' + payload.reference + '.');
        lines.push(payload.nextStep || 'The desk has your request and will reply to the details you gave.');
        if (payload.status === 'completed') {
          lines.push('Nothing further is needed from you.');
        } else {
          lines.push('Keep the reference; it is how we find this request again.');
        }
        setStatus(lines.join(' '), 'ok');
        form.querySelectorAll('input, select, textarea, button').forEach(function (el) { el.disabled = true; });
        if (status) status.setAttribute('tabindex', '-1');
      })
      .catch(function () {
        setBusy(false);
        setStatus('The request did not reach the desk. Check the connection and try again, or email hello@ilee.ng.', 'error');
      });
  }

  form.addEventListener('submit', submit);
  form.addEventListener('input', function (event) {
    if (event.target && event.target.getAttribute && event.target.getAttribute('aria-invalid')) validate();
  });
})();
