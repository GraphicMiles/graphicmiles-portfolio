// Two-step administrator invitation: mailbox OTP, then password setup.
(function () {
  'use strict';

  var invite = new URLSearchParams(window.location.search).get('invite') || '';
  var verify = document.getElementById('admin-verify-form');
  var redeem = document.getElementById('admin-redeem-form');
  var otpValue = document.getElementById('admin-otp-value');
  var otpCells = Array.prototype.slice.call(document.querySelectorAll('[data-otp-cell]'));
  var quality = window.ileeOnboardingQuality;
  var verified = false;

  function feedback(id, message, error) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = message || '';
    el.className = 'access-feedback' + (error ? ' is-error' : ' is-ok');
  }

  function busy(form, value) {
    var button = form && form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = value;
    if (value) {
      button.setAttribute('data-original-label', button.textContent);
      button.textContent = 'Working…';
    } else {
      button.textContent = button.getAttribute('data-original-label') || button.textContent;
    }
  }

  function syncOtp() {
    var code = otpCells.map(function (cell) { return cell.value; }).join('');
    if (otpValue) otpValue.value = code;
    return code;
  }

  function fillOtp(start, text) {
    var digits = String(text || '').replace(/\D/g, '').slice(0, otpCells.length - start).split('');
    if (!digits.length && otpCells[start]) otpCells[start].value = '';
    digits.forEach(function (digit, index) {
      if (otpCells[start + index]) otpCells[start + index].value = digit;
    });
    syncOtp();
    var next = Math.min(start + digits.length, otpCells.length - 1);
    if (digits.length && otpCells[next]) otpCells[next].focus();
  }

  otpCells.forEach(function (cell, index) {
    cell.addEventListener('input', function () {
      var raw = cell.value;
      if (!/^\d$/.test(raw)) {
        fillOtp(index, raw);
        return;
      }
      syncOtp();
      if (index < otpCells.length - 1) otpCells[index + 1].focus();
    });
    cell.addEventListener('keydown', function (event) {
      if (event.key === 'Backspace' && !cell.value && index > 0) {
        event.preventDefault();
        otpCells[index - 1].value = '';
        otpCells[index - 1].focus();
        syncOtp();
      } else if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        otpCells[index - 1].focus();
      } else if (event.key === 'ArrowRight' && index < otpCells.length - 1) {
        event.preventDefault();
        otpCells[index + 1].focus();
      }
    });
    cell.addEventListener('paste', function (event) {
      event.preventDefault();
      fillOtp(index, (event.clipboardData || window.clipboardData).getData('text'));
    });
  });

  function enterDesk(body) {
    if (!body || !body.token || !body.staff) {
      feedback('admin-redeem-feedback', 'Administrator account created. Return to the desk to sign in.', false);
      return;
    }
    try {
      sessionStorage.setItem('ilee.ops.session', JSON.stringify({
        token: body.token,
        expiresAt: body.expiresAt,
        staff: body.staff
      }));
    } catch (err) {
      feedback('admin-redeem-feedback', 'Account created, but this browser blocked the automatic sign-in. Open the desk to sign in.', true);
      return;
    }
    feedback('admin-redeem-feedback', 'Administrator account created. Opening the desk…', false);
    window.location.replace('/ilee/ops/?welcome=1');
  }

  var passwordInput = redeem && redeem.querySelector('[data-password-field]');
  var confirmInput = redeem && redeem.querySelector('[data-confirm-password]');
  var passwordUpdate = quality ? quality.mountPassword(passwordInput, redeem && redeem.querySelector('[data-password-meter]')) : function () { return { ok: false }; };
  var matchNote = redeem && redeem.querySelector('[data-match-note]');
  function updateMatch() {
    if (!matchNote || !passwordInput || !confirmInput) return;
    if (!confirmInput.value) {
      matchNote.textContent = '';
      matchNote.className = 'match-note';
    } else if (passwordInput.value === confirmInput.value) {
      matchNote.textContent = 'Passwords match.';
      matchNote.className = 'match-note is-ok';
    } else {
      matchNote.textContent = 'Passwords do not match yet.';
      matchNote.className = 'match-note is-error';
    }
  }
  if (passwordInput) passwordInput.addEventListener('input', updateMatch);
  if (confirmInput) confirmInput.addEventListener('input', updateMatch);
  updateMatch();

  if (!invite) feedback('admin-verify-feedback', 'This page needs an invitation link from an ilee administrator.', true);

  verify.addEventListener('submit', function (event) {
    event.preventDefault();
    var otp = syncOtp().trim();
    if (!invite) return feedback('admin-verify-feedback', 'This invitation link is missing or invalid.', true);
    if (!/^\d{6}$/.test(otp)) return feedback('admin-verify-feedback', 'Enter all six digits from the email.', true);
    busy(verify, true);
    fetch('/api/v1/staff-admin-invites/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite: invite, otp: otp })
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) throw new Error(body.message || 'The email could not be verified.');
        return body;
      });
    }).then(function (body) {
      verified = true;
      verify.hidden = true;
      redeem.hidden = false;
      var progress = document.querySelector('.access-progress');
      if (progress) {
        var progressCount = progress.querySelector('span');
        var progressLabel = progress.querySelector('strong');
        if (progressCount) progressCount.textContent = 'Step 2 of 3';
        if (progressLabel) progressLabel.textContent = 'Password setup';
      }
      feedback('admin-redeem-feedback', body.message || 'Email verified. Choose a password below.', false);
      if (passwordInput) passwordInput.focus();
    }).catch(function (error) {
      feedback('admin-verify-feedback', error.message || 'The email could not be verified.', true);
    }).then(function () { busy(verify, false); });
  });

  redeem.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = String(redeem.elements.password.value || '');
    var confirmPassword = String(redeem.elements.confirmPassword.value || '');
    var passwordResult = passwordUpdate();
    if (!verified) return feedback('admin-redeem-feedback', 'Verify the email code first.', true);
    if (!passwordResult.ok) return feedback('admin-redeem-feedback', passwordResult.common ? 'Choose a less common password.' : 'Use all of the password requirements shown above.', true);
    if (password !== confirmPassword) return feedback('admin-redeem-feedback', 'The passwords do not match.', true);
    busy(redeem, true);
    fetch('/api/v1/staff-admin-invites/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite: invite, password: password })
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) throw new Error(body.message || 'The administrator account could not be created.');
        return body;
      });
    }).then(function (body) {
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (err) { /* old browser */ }
      enterDesk(body);
    }).catch(function (error) {
      feedback('admin-redeem-feedback', error.message || 'The administrator account could not be created.', true);
    }).then(function () { busy(redeem, false); });
  });
})();
