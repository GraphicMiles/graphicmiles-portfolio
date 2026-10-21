// Public staff application and one-time setup forms.
(function () {
  'use strict';

  var quality = window.ileeOnboardingQuality;

  function feedback(id, message, error) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
    el.className = 'access-feedback' + (error ? ' is-error' : ' is-ok');
  }

  function busy(form, value) {
    var button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = value;
      if (value) {
        button.setAttribute('data-original-label', button.textContent);
        button.textContent = 'Working…';
      } else {
        button.textContent = button.getAttribute('data-original-label') || button.textContent;
      }
    }
  }

  function setNote(input, note, result, emptyText) {
    if (!input || !note) return;
    input.setAttribute('aria-invalid', result && !result.ok ? 'true' : 'false');
    note.textContent = result && !result.ok ? result.message : (result && result.ok ? 'Looks good.' : emptyText);
    note.className = 'field-note' + (result && !result.ok ? ' is-error' : result && result.ok ? ' is-ok' : '');
  }

  function mountPasswordForm(form) {
    if (!form || !quality) return function () { return { ok: false }; };
    var input = form.querySelector('[data-password-field]');
    var confirm = form.querySelector('[data-confirm-password]');
    var meter = form.querySelector('[data-password-meter]');
    var matchNote = form.querySelector('[data-match-note]');
    var updatePassword = quality.mountPassword(input, meter);
    function updateMatch() {
      if (!matchNote) return;
      if (!confirm.value) {
        matchNote.textContent = '';
        matchNote.className = 'match-note';
      } else if (input.value === confirm.value) {
        matchNote.textContent = 'Passwords match.';
        matchNote.className = 'match-note is-ok';
      } else {
        matchNote.textContent = 'Passwords do not match yet.';
        matchNote.className = 'match-note is-error';
      }
    }
    if (confirm) confirm.addEventListener('input', updateMatch);
    if (input) input.addEventListener('input', updateMatch);
    updateMatch();
    return function () {
      var result = updatePassword();
      updateMatch();
      return result;
    };
  }

  function enterDesk(body, feedbackId, form) {
    if (!body || !body.token || !body.staff) {
      feedback(feedbackId, 'Account created. Return to the desk to sign in.', false);
      return;
    }
    try {
      sessionStorage.setItem('ilee.ops.session', JSON.stringify({
        token: body.token,
        expiresAt: body.expiresAt,
        staff: body.staff
      }));
    } catch (err) {
      feedback(feedbackId, 'Account created, but this browser blocked the automatic sign-in. Open the desk to sign in.', true);
      return;
    }
    if (form) form.reset();
    feedback(feedbackId, 'Account created. Opening the desk…', false);
    window.location.replace('/ilee/ops/?welcome=1');
  }

  var apply = document.getElementById('staff-application-form');
  if (apply) {
    var nameInput = apply.elements.name;
    var emailInput = apply.elements.email;
    var nameNote = apply.querySelector('[data-name-note]');
    var emailNote = apply.querySelector('[data-email-note]');

    function checkIdentity() {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      setNote(nameInput, nameNote, name ? quality.personName(name) : null, 'Use the name your team knows you by.');
      setNote(emailInput, emailNote, email ? quality.email(email) : null, 'Use an address you can check for the review.');
    }
    if (quality) {
      nameInput.addEventListener('input', checkIdentity);
      emailInput.addEventListener('input', checkIdentity);
      nameInput.addEventListener('blur', checkIdentity);
      emailInput.addEventListener('blur', checkIdentity);
    }

    apply.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = String(nameInput.value || '').trim();
      var email = String(emailInput.value || '').trim();
      var reason = String(apply.elements.reason.value || '').trim();
      var nameResult = quality ? quality.personName(name) : { ok: name.length >= 2 };
      var emailResult = quality ? quality.email(email) : { ok: Boolean(email) };
      checkIdentity();
      if (!nameResult.ok || !emailResult.ok || reason.length < 10) {
        feedback('application-feedback', !nameResult.ok ? nameResult.message : !emailResult.ok ? emailResult.message : 'Tell us a little more about why you need access.', true);
        return;
      }
      busy(apply, true);
      fetch('/api/v1/staff-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          requestedRole: apply.elements.requestedRole.value,
          reason: reason,
          website: apply.elements.website.value
        })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok && response.status !== 202) throw new Error(body.message || 'The application could not be sent.');
          return body;
        });
      }).then(function (body) {
        apply.reset();
        checkIdentity();
        feedback('application-feedback', body.message || 'Your request was received. An administrator will review it.', false);
      }).catch(function (error) {
        feedback('application-feedback', error.message || 'The application could not be sent. Try again later.', true);
      }).then(function () { busy(apply, false); });
    });
  }

  var setup = document.getElementById('staff-setup-form');
  if (setup) {
    var updateSetupPassword = mountPasswordForm(setup);
    var invite = new URLSearchParams(window.location.search).get('invite') || '';
    if (!invite) feedback('setup-feedback', 'This page needs a setup link from an ilee administrator.', true);

    setup.addEventListener('submit', function (event) {
      event.preventDefault();
      var password = String(setup.elements.password.value || '');
      var confirmPassword = String(setup.elements.confirmPassword.value || '');
      var passwordResult = updateSetupPassword();
      if (!invite) return feedback('setup-feedback', 'This setup link is missing or invalid.', true);
      if (!passwordResult.ok) return feedback('setup-feedback', passwordResult.common ? 'Choose a less common password.' : 'Use all of the password requirements shown above.', true);
      if (password !== confirmPassword) return feedback('setup-feedback', 'The passwords do not match.', true);

      busy(setup, true);
      fetch('/api/v1/staff-invites/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite: invite, password: password })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok) throw new Error(body.message || 'The setup link could not be used.');
          return body;
        });
      }).then(function (body) {
        try { window.history.replaceState({}, document.title, window.location.pathname); } catch (err) { /* old browser */ }
        enterDesk(body, 'setup-feedback', setup);
      }).catch(function (error) {
        feedback('setup-feedback', error.message || 'The setup link could not be used.', true);
      }).then(function () { busy(setup, false); });
    });
  }
})();
