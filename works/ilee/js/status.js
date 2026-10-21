/* ilee - application status lookup on status.html.

   blueprint.md promises the tenant always sees their status and next step, but
   every application route is ops-only, so a tenant could see nothing about
   their own application (engineering.md Part 2, gap F-6, contradiction C-5). This posts two
   factors to POST /api/v1/status: the reference the desk issued, and a contact
   the applicant already gave. No account, because D-001 has no accounts.

   The API returns the same body for an unknown reference and a wrong contact,
   so the page must not try to tell those apart either.
*/
(function () {
  'use strict';

  var form = document.querySelector('[data-status-form]');
  if (!form) return;

  // The desk's email links here with ?ref=... so the tenant does not retype a
  // uuid from a message. The contact field still has to be typed: the reference
  // alone opens nothing.
  var emailedRef = new URLSearchParams(window.location.search).get('ref');
  if (emailedRef && /^[0-9a-fA-F-]{36}$/.test(emailedRef)) {
    var refField = form.querySelector('#status-reference');
    if (refField) refField.value = emailedRef;
  }

  var referenceField = form.querySelector('#status-reference');
  var contactField = form.querySelector('#status-contact');
  var submit = form.querySelector('.form-submit');
  var submitLabel = submit ? submit.querySelector('.button__label') : null;
  var submitIcon = submit ? submit.querySelector('i.ph') : null;
  var idleIconClass = submitIcon ? submitIcon.className : '';
  var result = document.querySelector('[data-status-result]');
  var errorSlot = document.querySelector('[data-error-for="status-form"]');

  // Order is the real state machine from db/001_init.sql. The rail shows it in
  // sequence and marks what has been reached; the dot carries actual state, so
  // it is information rather than decoration.
  var STEPS = [
    { state: 'started', label: 'Application received' },
    { state: 'docs_submitted', label: 'Documents with the desk' },
    { state: 'underwriting', label: 'Under review' }
  ];

  var DECIDED = {
    approved: { label: 'Approved', pill: 'pill--clear' },
    conditional: { label: 'Approved with conditions', pill: 'pill--clear' },
    declined: { label: 'Not approved', pill: 'pill--reserved' },
    withdrawn: { label: 'Withdrawn', pill: 'pill--reserved' }
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setError(field, message) {
    if (!field) return;
    var slot = form.querySelector('[data-error-for="' + field.id + '"]');
    if (slot) slot.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function looksLikeReference(value) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      (value || '').trim()
    );
  }

  function railFor(state) {
    var index = -1;
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].state === state) index = i;
    }
    var decided = Object.prototype.hasOwnProperty.call(DECIDED, state);
    var out = '<ol class="status-steps">';
    for (var j = 0; j < STEPS.length; j++) {
      var step = STEPS[j];
      var cls = 'status-step';
      // A step is complete only once the application has moved past it. The
      // step it is sitting on is current, not done, so the ring stays a ring.
      if (decided || (index > -1 && j < index)) cls += ' status-step--done';
      if (j === index) cls += ' status-step--current';
      out += '<li class="' + cls + '">' +
        '<span class="status-step__rail"><span class="status-step__dot"></span></span>' +
        '<span class="status-step__label">' + esc(step.label) + '</span>' +
        '</li>';
    }
    // A decision is terminal and complete, so it carries both marks.
    if (decided) {
      out += '<li class="status-step status-step--done status-step--current">' +
        '<span class="status-step__rail"><span class="status-step__dot"></span></span>' +
        '<span class="status-step__label">' + esc(DECIDED[state].label) + '</span>' +
        '</li>';
    }
    out += '</ol>';
    return out;
  }

  function renderFound(body) {
    var decided = DECIDED[body.state];
    var label = decided ? decided.label : 'In progress';
    var pill = decided ? decided.pill : 'pill--progress';

    var html = '<div class="status-panel" role="status">' +
      '<div class="status-panel__head">' +
      '<span class="pill ' + pill + '">' + esc(label) + '</span>' +
      '<span class="status-panel__ref">Reference ' + esc(body.reference) + '</span>' +
      '</div>';

    if (body.nextStep) {
      html += '<p class="status-panel__next">' + esc(body.nextStep) + '</p>';
    }

    html += railFor(body.state);

    html += '<dl class="status-panel__meta">';
    if (body.reasonCategory) {
      html += '<div class="status-meta-row"><dt>Reason</dt><dd>' +
        esc(String(body.reasonCategory).charAt(0).toUpperCase() + String(body.reasonCategory).slice(1)) +
        '</dd></div>';
    }
    if (body.area) {
      html += '<div class="status-meta-row"><dt>Area</dt><dd>' + esc(body.area) + '</dd></div>';
    }
    // The schedule the applicant actually applied for. Promise two is "the full
    // cost before commitment", and an applicant checking their own status is
    // exactly the person who needs to see which schedule is on file. The label
    // comes from the API: the page does not know what "biannual" means, and a
    // schedule name that only exists in a database enum is a schedule a tenant
    // cannot read.
    if (body.scheduleLabel) {
      // The programme name is sent by the API rather than written here, so the
      // D-010 reversal has one place to be undone if the trademark position
      // changes. When publicNaming is off the API sends "installments" and this
      // line reads the same way it did before.
      var programme = body.installmentProgram && body.installmentProgram !== 'installments'
        ? ' \u00b7 ' + body.installmentProgram
        : '';
      html += '<div class="status-meta-row"><dt>Schedule</dt><dd>' +
        esc(body.scheduleLabel + programme) + '</dd></div>';
    }
    // The applicant's own viewing, when the desk has arranged one. The API sends
    // the time and the outcome and never the address: releasing an address is a
    // separate, audited act (GET /api/v1/viewings/:id), and a status lookup that
    // quietly printed it would make that audit meaningless.
    if (body.viewing && body.viewing.scheduledAt) {
      var when = new Date(body.viewing.scheduledAt);
      var viewingText = isNaN(when.getTime())
        ? 'Arranged'
        : when.toLocaleString('en-NG', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
          });
      var outcome = body.viewing.outcome && body.viewing.outcome !== 'scheduled'
        ? ' \u00b7 ' + String(body.viewing.outcome).replace(/_/g, ' ')
        : '';
      html += '<div class="status-meta-row"><dt>Viewing</dt><dd>' +
        esc(viewingText + outcome) + '</dd></div>';
    }
    if (body.updatedAt) {
      var when = new Date(body.updatedAt);
      if (!isNaN(when.getTime())) {
        html += '<div class="status-meta-row"><dt>Last update</dt><dd>' +
          esc(when.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })) +
          '</dd></div>';
      }
    }
    html += '</dl>';

    html += '<div class="status-actions">' +
      '<a class="button button--primary" href="contact.html?topic=Something%20else&context=Application%20status%20question#contact-form">' +
      '<span class="button__wash" aria-hidden="true"></span>' +
      '<span class="button__label">Message the desk</span> ' +
      '<i class="ph ph-arrow-right" aria-hidden="true"></i></a>' +
      '<a class="text-link" href="tel:+2348012345678">' +
      '<i class="ph ph-phone" aria-hidden="true"></i>Call the desk</a>' +
      '</div></div>';

    result.innerHTML = html;
  }

  function renderNotFound() {
    result.innerHTML = '<div class="homes-state homes-state--empty" role="status">' +
      '<i class="ph ph-magnifying-glass homes-state__icon" aria-hidden="true"></i>' +
      '<h3>No application matches those details.</h3>' +
      '<p>Check the reference exactly as the desk sent it, and use the same email address or phone number you gave them. Both have to match.</p>' +
      '<div class="homes-state__actions">' +
      '<a class="text-link" href="contact.html?topic=Something%20else&context=Application%20reference%20help#contact-form">' +
      '<i class="ph ph-arrow-right" aria-hidden="true"></i>Ask for the reference</a>' +
      '</div></div>';
  }

  function renderError() {
    result.innerHTML = '<div class="homes-state homes-state--error" role="status">' +
      '<i class="ph ph-warning homes-state__icon" aria-hidden="true"></i>' +
      '<h3>The lookup did not complete.</h3>' +
      '<p>The desk can read your status directly while this is fixed. Nothing about your application has changed.</p>' +
      '<div class="homes-state__actions">' +
      '<a class="text-link" href="tel:+2348012345678">' +
      '<i class="ph ph-phone" aria-hidden="true"></i>Call the desk</a>' +
      '</div></div>';
  }

  function setPending(pending) {
    if (!submit) return;
    submit.disabled = pending;
    if (submitLabel) submitLabel.textContent = pending ? 'Checking' : 'Check status';
    // The arrow becomes the spinner the icon set already carries. Motion is
    // gated by the reduced-motion rule in css/icons.css.
    if (submitIcon) {
      submitIcon.className = pending ? 'ph ph-circle-notch ph--spin' : idleIconClass;
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var reference = (referenceField.value || '').trim();
    var contact = (contactField.value || '').trim();
    var failed = false;

    if (!looksLikeReference(reference)) {
      setError(referenceField, 'That reference does not look right. It is the code the desk sent you, in five groups.');
      failed = true;
    } else {
      setError(referenceField, '');
    }

    if (contact.length < 5) {
      setError(contactField, 'Use the same email address or phone number you gave the desk.');
      failed = true;
    } else {
      setError(contactField, '');
    }

    if (failed) {
      if (errorSlot) errorSlot.textContent = '';
      result.innerHTML = '';
      return;
    }

    if (errorSlot) errorSlot.textContent = '';
    setPending(true);

    if (!window.fetch) { setPending(false); renderError(); return; }

    fetch('/api/v1/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: reference, contact: contact })
    })
      .then(function (res) {
        if (res.status === 404) return { notFound: true };
        if (!res.ok) return Promise.reject(res.status);
        return res.json();
      })
      .then(function (body) {
        setPending(false);
        if (body.notFound) { renderNotFound(); return; }
        renderFound(body);
      })
      .catch(function () {
        setPending(false);
        renderError();
      });
  });
})();
