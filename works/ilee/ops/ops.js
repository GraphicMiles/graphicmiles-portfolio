/* ilee rental desk.
 *
 * The desk reads the queues and now exposes the Phase 1 writes as deliberate,
 * small forms: listing intake, verification tasks and results, state changes,
 * applications, and terminal decisions. The server remains the authority for
 * validation, state transitions, evidence requirements and audit attribution.
 *
 * Each member of staff signs in with their own account. The session token is
 * held in sessionStorage, not localStorage, so closing the tab ends it, and the
 * server stores only a hash of it - see src/lib/staff.js. The name shown in the
 * topbar, and written to the audit log with every action, comes from the server,
 * not from anything typed here.
 */
(function () {
  'use strict';

  var KEY = 'ilee.ops.session';
  var gate = document.getElementById('gate');
  var app = document.getElementById('app');
  var session = null;
  var cache = { leads: [], tasks: [], listings: [], apps: [], staffApplications: [] };
  var welcomed = new URLSearchParams(window.location.search).get('welcome') === '1';

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* A missing identity node must never kill the whole desk render. */
  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function ago(iso) {
    if (!iso) return '';
    var secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'just now';
    var mins = Math.floor(secs / 60);
    if (mins < 60) return mins + (mins === 1 ? ' min ago' : ' mins ago');
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + (days === 1 ? ' day ago' : ' days ago');
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  function naira(kobo) {
    if (kobo == null) return '-';
    return '\u20a6' + Math.round(kobo / 100).toLocaleString('en-NG');
  }

  var WORDS = {
    draft: 'Draft', submitted: 'Submitted', identity_verified: 'ID verified',
    inspected: 'Inspected', title_verified: 'Title verified', live: 'Live',
    reserved: 'Reserved', let: 'Let', archived: 'Archived', suspended: 'Suspended',
    started: 'Started', docs_submitted: 'Docs in', underwriting: 'Underwriting',
    approved: 'Approved', conditional: 'Conditional', declined: 'Declined',
    withdrawn: 'Withdrawn', account_created: 'Account created',
    new: 'New', contacted: 'Contacted', qualified: 'Qualified', closed: 'Closed',
    identity: 'Identity', inspection: 'Inspection', title: 'Title',
    pending: 'Pending', pass: 'Passed', fail: 'Failed',
    // Viewings. A raw "no_show" on a desk row is readable by the person who
    // wrote the enum and nobody else.
    scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled',
    no_show: 'No show', rescheduled: 'Rescheduled',
    // Rights requests, named the way the privacy notice names them.
    received: 'Received', in_progress: 'In progress', rejected: 'Rejected',
    withdrawal: 'Withdraw consent', access: 'Access request',
    erasure: 'Erasure request', correction: 'Correction request',
    // Identity outcomes.
    verified: 'Verified', unable_to_verify: 'Unable to verify'
  };
  function words(s) { return WORDS[s] || s || '-'; }

  /* A datetime-local input yields "2026-09-24T10:00" - local, no seconds, no
     offset. viewingSchema wants z.string().datetime({ offset: true }), so the
     value has to be rebuilt with the desk's own offset attached. Sending the
     raw input would 400 every viewing the desk tried to arrange, and sending a
     UTC "Z" string would silently move the appointment by an hour for anyone
     not on UTC. */
  function toIso(value) {
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d.getTime())) return value;
    var pad = function (n) { n = Math.abs(n); return (n < 10 ? '0' : '') + n; };
    var offset = -d.getTimezoneOffset();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
      (offset >= 0 ? '+' : '-') + pad(Math.floor(offset / 60)) + ':' + pad(offset % 60);
  }

  var STAFF_ROLE_WORDS = {
    ops: 'Operations', inspector: 'Inspector', analyst: 'Analyst', finance: 'Finance', admin: 'Administrator'
  };
  function staffRole(role) { return STAFF_ROLE_WORDS[role] || role || '-'; }

  function pillClass(state) {
    if (['live', 'approved', 'pass', 'qualified', 'verified', 'completed'].indexOf(state) > -1) return 'pill--live';
    if (['new', 'started', 'submitted', 'received'].indexOf(state) > -1) return 'pill--new';
    // no_show and rejected are the two states a desk should notice at a glance.
    if (['declined', 'fail', 'suspended', 'rejected', 'no_show', 'unable_to_verify'].indexOf(state) > -1) return 'pill--stop';
    if (['archived', 'closed', 'let', 'withdrawn', 'cancelled'].indexOf(state) > -1) return 'pill--neutral';
    return 'pill--progress';
  }

  function pill(state) {
    return '<span class="pill ' + pillClass(state) + '">' + esc(words(state)) + '</span>';
  }

  function api(path, options) {
    var opts = options || {};
    var activeSession = session;
    if (!activeSession) return Promise.reject(new Error('No staff session.'));
    return fetch('/api/v1' + path, {
      method: opts.method || 'GET',
      headers: Object.assign(
        { 'Authorization': 'Bearer ' + session.token },
        opts.body ? { 'Content-Type': 'application/json' } : {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (session !== activeSession) throw new Error('Session changed.');
        if (r.status === 401) {
          signOut('Your session ended. Sign in again.');
          throw new Error('unauthorized');
        }
        if (!r.ok) {
          var error = new Error(body.message || body.error || ('Request failed (' + r.status + ')'));
          error.status = r.status;
          error.body = body;
          throw error;
        }
        return body;
      });
    });
  }

  function skeleton(n) {
    var out = '<div class="skeleton">';
    for (var i = 0; i < (n || 3); i++) out += '<div class="sk-row"></div>';
    return out + '</div>';
  }

  function empty(title, sub, action) {
    return '<div class="empty"><p class="empty-title">' + esc(title) +
           '</p><p class="empty-sub">' + esc(sub) + '</p>' +
           (action ? '<button class="btn btn--primary btn--sm" type="button" data-open-form="' +
             esc(action.form) + '">' + esc(action.label) + '</button>' : '') + '</div>';
  }

  function failed(what) {
    return '<div class="failed"><p class="empty-title">Could not load ' + esc(what) + '</p>' +
           '<p class="empty-sub">The API did not answer. Check the desk is running, then try again.</p>' +
           '<button class="btn btn--primary btn--sm" type="button" data-retry-queue>Try again</button></div>';
  }

  function wireClamps(root) {
    if (!root || !root.querySelectorAll) return;
    var els = root.querySelectorAll('.js-clamp:not(.js-clamp--wired)');
    Array.prototype.forEach.call(els, function (el) {
      if (!el.clientHeight && !el.scrollHeight) return; /* hidden panel: wired on tab switch */
      el.classList.add('js-clamp--wired');
      if (el.scrollHeight > el.clientHeight + 2) {
        var btn = document.createElement('button');
        btn.className = 'btn btn--text btn--sm clamp-toggle';
        btn.type = 'button';
        btn.setAttribute('data-clamp', '');
        btn.textContent = 'More';
        el.parentNode.insertBefore(btn, el.nextSibling);
      } else {
        el.classList.remove('clamped');
      }
    });
  }

  function actionIconFor(title) {
    var t = String(title || '').toLowerCase();
    if (t.indexOf('listing') > -1 || t.indexOf('photograph') > -1) return 'ph-buildings';
    if (t.indexOf('verification') > -1 || t.indexOf('check') > -1) return 'ph-shield-check';
    if (t.indexOf('viewing') > -1) return 'ph-clock';
    if (t.indexOf('admin') > -1 || t.indexOf('staff') > -1 || t.indexOf('user') > -1) return 'ph-key';
    if (t.indexOf('vetting') > -1 || t.indexOf('application') > -1 || t.indexOf('rights') > -1) return 'ph-file-text';
    return 'ph-arrow-right';
  }

  function actionCard(title, sub, body) {
    return '<div class="action-card" data-description="' + esc(sub) + '">' +
      '<button type="button" class="tool" data-action-launch><i class="ph ' + actionIconFor(title) + '" aria-hidden="true"></i><strong class="action-card__title">' + esc(title) + '</strong><i class="ph ph-caret-right" aria-hidden="true"></i></button>' +
      '<div class="action-body" hidden>' + body + '</div></div>';
  }

  function field(label, name, type, attrs) {
    return '<label class="form-field"><span>' + esc(label) + '</span><input type="' + (type || 'text') +
      '" name="' + esc(name) + '" ' + (attrs || '') + '></label>';
  }

  function selectField(label, name, options, attrs) {
    return '<label class="form-field"><span>' + esc(label) + '</span><select name="' + esc(name) + '" ' +
      (attrs || '') + '>' + options + '</select></label>';
  }

  function actionFeedback(form, message, error) {
    var slot = form.querySelector('[data-feedback]');
    if (!slot) return;
    slot.textContent = message || '';
    slot.className = 'action-feedback' + (error ? ' is-error' : ' is-ok');
  }

  function showNotice(message, error) {
    window.ileeDeskView.notice(message, error);
    var notice = document.getElementById('desk-notice');
    if (!notice) return;
    if (notice._hideTimer) window.clearTimeout(notice._hideTimer);
    notice.textContent = message || '';
    notice.className = 'desk-notice' + (error ? ' is-error' : ' is-ok');
    if (!message) {
      notice.classList.remove('is-visible');
      notice.hidden = true;
      return;
    }
    notice.hidden = false;
    window.requestAnimationFrame(function () { notice.classList.add('is-visible'); });
    notice._hideTimer = window.setTimeout(function () {
      notice.classList.remove('is-visible');
      window.setTimeout(function () { notice.hidden = true; }, 240);
    }, 6000);
  }

  function showVerifiedBadge() {
    var badge = document.getElementById('verified-toast');
    if (!badge) return;
    var check = badge.querySelector('path');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (badge._hideTimer) window.clearTimeout(badge._hideTimer);
    badge.hidden = false;
    badge.classList.remove('is-visible');
    if (check) check.style.strokeDashoffset = '20';

    window.requestAnimationFrame(function () {
      badge.classList.add('is-visible');
      if (window.anime && !reduce) {
        window.anime.remove(badge);
        window.anime.remove(check);
        window.anime({
          targets: badge,
          opacity: [0, 1],
          translateY: ['-12px', '0px'],
          scale: [0.96, 1],
          duration: 520,
          easing: 'easeOutCubic'
        });
        if (check) window.anime({
          targets: check,
          strokeDashoffset: [20, 0],
          duration: 460,
          delay: 160,
          easing: 'easeOutCubic'
        });
      } else if (check) {
        check.style.strokeDashoffset = '0';
      }
    });

    badge._hideTimer = window.setTimeout(function () {
      badge.classList.remove('is-visible');
      window.setTimeout(function () { badge.hidden = true; }, 340);
    }, 5200);
  }

  function text(form, name) {
    return String(form.elements[name] && form.elements[name].value || '').trim();
  }

  function withBusy(form, work) {
    var button = form.querySelector('button[type="submit"]');
    var original = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Saving…'; }
    actionFeedback(form, '', false);
    return Promise.resolve().then(work).then(function (message) {
      actionFeedback(form, message || 'Saved.', false);
      showNotice(message || 'Saved.', false);
      if (window.ileeDebug) window.ileeDebug.log('ops action succeeded: ' + form.getAttribute('data-action'));
      form.reset();
      window.ileeDeskView.completeForm(form);
      loadAll();
    }).catch(function (error) {
      var message = error && error.message ? error.message : 'The request failed.';
      actionFeedback(form, message, true);
      showNotice(message, true);
      if (window.ileeDebug) window.ileeDebug.error('ops action failed: ' + form.getAttribute('data-action'), {
        status: error && error.status,
        message: message,
        response: error && error.body
      });
    }).then(function () {
      if (button) { button.disabled = false; button.textContent = original; }
    });
  }

  function advanceAfterTask(task) {
    var target = {
      identity: 'identity_verified',
      inspection: 'inspected',
      title: 'title_verified'
    }[task && task.type];
    if (!task || task.result !== 'pass' || !target || !task.listing_id) return Promise.resolve(null);
    return api('/listings/' + encodeURIComponent(task.listing_id) + '/transition', {
      method: 'POST',
      body: { to: target, reason: 'Automatic workflow advance after the ' + task.type + ' check passed.' }
    }).catch(function () {
      // A task can be completed out of order or after another staff member
      // advanced the listing. The pass remains valid; the next refresh explains
      // the remaining workflow rather than turning a successful check red.
      return null;
    });
  }

  function readEvidence(files) {
    var chosen = Array.prototype.slice.call(files || []);
    if (chosen.length > 12) return Promise.reject(new Error('Choose no more than 12 evidence files.'));
    var total = chosen.reduce(function (sum, file) { return sum + file.size; }, 0);
    // Keep the JSON request comfortably below Express's 15 MB cap.
    if (total > 9 * 1024 * 1024) return Promise.reject(new Error('Evidence files must total less than 9 MB.'));
    return Promise.all(chosen.map(function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(new Error('Could not read ' + file.name + '.')); };
        reader.readAsDataURL(file);
      });
    }));
  }

  /* ---------- sign in ---------- */

  function setError(input, message) {
    var slot = document.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  var gateForm = document.getElementById('gate-form');
  var userInput = document.getElementById('ops-user');
  var tokenInput = document.getElementById('ops-token');
  var gateSubmit = document.getElementById('gate-submit');
  var pwToggle = document.getElementById('gate-pw-toggle');

  if (pwToggle && tokenInput) {
    pwToggle.addEventListener('click', function () {
      var isPassword = tokenInput.getAttribute('type') === 'password';
      tokenInput.setAttribute('type', isPassword ? 'text' : 'password');
      pwToggle.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      pwToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      var iconShow = pwToggle.querySelector('.gate-pw-icon--show');
      var iconHide = pwToggle.querySelector('.gate-pw-icon--hide');
      if (iconShow && iconHide) {
        iconShow.hidden = isPassword;
        iconHide.hidden = !isPassword;
      }
    });
  }

  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = userInput.value.trim();
    var ok = true;
    if (!email) { setError(userInput, 'Your work email is required.'); ok = false; }
    else setError(userInput, '');
    if (!tokenInput.value) { setError(tokenInput, 'Your password is required.'); ok = false; }
    else setError(tokenInput, '');
    if (!ok) return;

    gateSubmit.disabled = true;
    gateSubmit.textContent = 'Signing in…';

    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: tokenInput.value })
    }).then(function (r) {
      return r.json().then(function (body) { return { status: r.status, body: body }; });
    }).then(function (out) {
      gateSubmit.disabled = false;
      gateSubmit.textContent = 'Sign in';

      if (out.status === 401) {
        setError(tokenInput, 'That email and password do not match.');
        tokenInput.value = '';
        return;
      }
      if (out.status === 403) {
        setError(tokenInput, out.body.message || 'This account has been disabled.');
        return;
      }
      if (out.status === 429) {
        setError(tokenInput, out.body.message || 'Too many attempts. Try again shortly.');
        return;
      }
      if (out.status !== 200 || !out.body.token) {
        setError(tokenInput, 'The desk answered with an error (' + out.status + '). Try again.');
        return;
      }

      session = { token: out.body.token, staff: out.body.staff, expiresAt: out.body.expiresAt };
      try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (err) { /* private mode */ }
      tokenInput.value = '';
      openDesk();
    }).catch(function () {
      setError(tokenInput, 'Could not reach the API. Is the server running?');
      gateSubmit.disabled = false;
      gateSubmit.textContent = 'Sign in';
    });
  });

  function signOut(message) {
    window.ileeDeskView.reset();
    session = null;
    try { sessionStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    app.hidden = true;
    gate.hidden = false;
    gateSubmit.disabled = false;
    gateSubmit.textContent = 'Sign in';
    tokenInput.value = '';
    if (message) setError(tokenInput, message);
  }

  var signoutButton = document.getElementById('signout');
  if (signoutButton) signoutButton.addEventListener('click', function () {
    if (!session) return signOut('');
    api('/auth/logout', { method: 'POST' })
      .catch(function () { /* still sign out */ })
      .then(function () { signOut(''); });
  });
  document.getElementById('refresh').addEventListener('click', loadAll);

  /* ---------- tabs and form actions ---------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.dataset.tab === 'staff' && (!session || session.staff.role !== 'admin')) return;
      window.ileeDeskView.active(tab.dataset.tab);
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);

        var target = document.getElementById('panel-' + t.dataset.tab);
        if (on) {
          target.hidden = false;
          target.classList.remove('panel--enter');
          void target.offsetWidth;
          target.classList.add('panel--enter');
          wireClamps(target);
        } else {
          target.hidden = true;
        }
      });
    });
  });

  app.addEventListener('click', function (event) {
    var retry = event.target.closest('[data-retry-queue]');
    if (retry) { loadAll(); return; }
    var opener = event.target.closest('[data-open-form]');
    if (opener) {
      var form = app.querySelector('form[data-action="' + opener.getAttribute('data-open-form') + '"]');
      window.ileeDeskView.openForm(form);
      return;
    }
    var shower = event.target.closest('[data-show-all]');
    if (shower) {
      var q = shower.getAttribute('data-show-all');
      var expand = shower.getAttribute('data-expanded') !== '1';
      var renders = {
        leads: function () { panel('leads').innerHTML = renderLeads(cache.leads, expand); },
        tasks: function () { panel('tasks').innerHTML = renderTasks(cache.tasks, expand); },
        listings: function () { panel('listings').innerHTML = renderListings(cache.listings, expand); },
        apps: function () { panel('apps').innerHTML = renderApps(cache.apps, expand); },
        viewings: function () { panel('viewings').innerHTML = renderViewings(cache.viewings, cache.viewingScope || 'upcoming', expand); },
        rights: function () { panel('rights').innerHTML = renderRights(cache.rights, expand); },
        staff: function () { panel('staff').innerHTML = renderStaffApplications(cache.staffApplications, expand); }
      };
      if (renders[q]) { renders[q](); wireClamps(panel(q)); }
      return;
    }
    var clamper = event.target.closest('[data-clamp]');
    if (clamper) {
      var target = clamper.previousElementSibling;
      if (target && target.classList.contains('js-clamp')) {
        var nowClamped = target.classList.toggle('clamped');
        clamper.textContent = nowClamped ? 'More' : 'Less';
      }
      return;
    }
    var button = event.target.closest('[data-fill-field]');
    if (!button) return;
    var target = document.getElementById(button.getAttribute('data-fill-field')) ||
      app.querySelector('[name="' + button.getAttribute('data-fill-field') + '"]');
    if (target) {
      target.value = button.getAttribute('data-fill-value') || '';
      window.ileeDeskView.openForm(target.closest('form'));
      target.focus();
    }
  });

  app.addEventListener('click', function (event) {
    var button = event.target.closest('[data-staff-decision]');
    if (!button) return;
    var id = button.getAttribute('data-staff-id');
    var decision = button.getAttribute('data-staff-decision');
    if (!id || button.disabled) return;
    button.disabled = true;
    var body = {};
    if (decision === 'approve') {
      var role = app.querySelector('[data-staff-role="' + id + '"]');
      body.role = role ? role.value : 'ops';
    }
    if (decision === 'reject') {
      var reason = app.querySelector('[data-staff-reason="' + id + '"]');
      body.reason = reason ? reason.value.trim() : '';
    }
    api('/staff-applications/' + encodeURIComponent(id) + '/' + decision, {
      method: 'POST', body: body
    }).then(function (result) {
      if (decision === 'approve' || decision === 'reissue') {
        if (result.emailSent) {
          showNotice('Approved. The one-time setup link was emailed to the applicant.', false);
        } else {
          showNotice('Approved, but the setup email was not sent. Check email delivery before reissuing the link.', true);
        }
      } else {
        showNotice('Application rejected.', false);
      }
      window.ileeDeskView.closeDialog();
      loadStaffApplications();
    }).catch(function (error) {
      showNotice(error.message || 'The staff application action failed.', true);
      if (window.ileeDebug) window.ileeDebug.error('staff application action failed', { action: decision, status: error.status, response: error.body });
      button.disabled = false;
    });
  });

  app.addEventListener('click', function (event) {
    var button = event.target.closest('[data-publish-listing]');
    if (!button || button.disabled) return;
    var id = button.getAttribute('data-publish-listing');
    button.disabled = true;
    api('/listings/' + encodeURIComponent(id) + '/transition', {
      method: 'POST',
      body: { to: 'live', reason: 'Published after the required verification checks passed.' }
    }).then(function () {
      window.ileeDeskView.closeDialog();
      showNotice('Listing published. It is now available to the public homes page.', false);
      loadAll();
    }).catch(function (error) {
      showNotice(error.message || 'The listing could not be published.', true);
      if (window.ileeDebug) window.ileeDebug.error('listing publish failed', { status: error.status, response: error.body });
      button.disabled = false;
    });
  });

  app.addEventListener('toggle', function (event) {
    if (event.target.tagName === 'DETAILS') {
      var toggle = event.target.querySelector('.action-toggle span');
      if (toggle) toggle.textContent = event.target.open ? 'Close' : 'Open';
    }
  }, true);

  app.addEventListener('click', function (event) {
    var scopeButton = event.target.closest('[data-viewings-scope]');
    if (!scopeButton) return;
    loadViewings(scopeButton.getAttribute('data-viewings-scope'));
  });

  app.addEventListener('submit', function (event) {
    var form = event.target.closest('form[data-action]');
    if (!form) return;
    event.preventDefault();
    var action = form.getAttribute('data-action');

    if (action === 'invite-admin') {
      var inviteName = text(form, 'adminName');
      var inviteEmail = text(form, 'adminEmail');
      var inviteQuality = window.ileeOnboardingQuality;
      if (inviteQuality) {
        var inviteNameCheck = inviteQuality.personName(inviteName);
        var inviteEmailCheck = inviteQuality.email(inviteEmail);
        if (!inviteNameCheck.ok || !inviteEmailCheck.ok) {
          return actionFeedback(form, (!inviteNameCheck.ok ? inviteNameCheck : inviteEmailCheck).message, true);
        }
      }
      return withBusy(form, function () {
        return api('/staff-admin-invites', { method: 'POST', body: {
          name: inviteName, email: inviteEmail
        }}).then(function () { return 'Invitation email sent. The recipient must enter the OTP before choosing a password.'; });
      });
    }

    if (action === 'create-listing') {
      return withBusy(form, function () {
        return api('/listings', { method: 'POST', body: {
          ownerName: text(form, 'ownerName'), ownerPhone: text(form, 'ownerPhone'),
          agentName: text(form, 'agentName'), area: text(form, 'area'),
          address: text(form, 'address'), homeType: text(form, 'homeType'),
          rentAnnualNaira: text(form, 'rentAnnualNaira'), terms: text(form, 'terms'),
          acceptsInstallments: Boolean(form.elements.acceptsInstallments.checked)
        }}).then(function (body) { return 'Listing created: ' + body.id; });
      });
    }

    if (action === 'prepare-verification') {
      return withBusy(form, function () {
        return api('/listings/' + encodeURIComponent(text(form, 'listingId')) + '/prepare-verification', {
          method: 'POST', body: {}
        }).then(function (body) { return body.message || 'Verification packet ready.'; });
      });
    }

    if (action === 'transition-listing') {
      return withBusy(form, function () {
        return api('/listings/' + encodeURIComponent(text(form, 'listingId')) + '/transition', {
          method: 'POST', body: { to: text(form, 'to'), reason: text(form, 'reason') }
        }).then(function (body) { return 'Listing is now ' + words(body.state) + '.'; });
      });
    }

    if (action === 'create-task') {
      return withBusy(form, function () {
        return api('/tasks', { method: 'POST', body: {
          listingId: text(form, 'listingId'), type: text(form, 'type'),
          assignee: text(form, 'assignee'), slaHours: Number(text(form, 'slaHours') || 48)
        }}).then(function (body) { return 'Verification task created: ' + body.id; });
      });
    }

    if (action === 'result-task') {
      var result = text(form, 'result');
      return withBusy(form, function () {
        return readEvidence(form.elements.evidence.files).then(function (evidence) {
          if (result === 'pass' && !evidence.length) {
            throw new Error('A passing verification needs at least one evidence file.');
          }
          return api('/tasks/' + encodeURIComponent(text(form, 'taskId')) + '/result', {
            method: 'POST', body: {
              result: result, reasonCode: text(form, 'reasonCode'), evidence: evidence
            }
          });
        }).then(function (body) {
          return advanceAfterTask(body).then(function (advanced) {
            return 'Task recorded as ' + words(body.result) +
              (advanced ? '. Listing advanced to ' + words(advanced.state) + '.' : '.');
          });
        });
      });
    }

    if (action === 'create-application') {
      return withBusy(form, function () {
        var email = text(form, 'tenantEmail');
        var phone = text(form, 'tenantPhone');
        var leadId = text(form, 'leadId');
        if (!email && !phone) throw new Error('Enter the tenant email or phone used for status lookup.');
        var body = {
          listingId: text(form, 'listingId'), tenantName: text(form, 'tenantName'),
          tenantPhone: phone, tenantEmail: email, schedule: text(form, 'schedule')
        };
        // applicationSchema accepts an omitted leadId, not an empty string.
        if (leadId) body.leadId = leadId;
        return api('/applications', { method: 'POST', body: body })
          .then(function (created) { return 'Application created. Reference: ' + created.id; });
      });
    }

    if (action === 'decide-application') {
      return withBusy(form, function () {
        var reason = text(form, 'reasonCode');
        if (!reason) throw new Error('A reason category is required for every decision.');
        return api('/applications/' + encodeURIComponent(text(form, 'applicationId')) + '/decision', {
          method: 'POST', body: {
            outcome: text(form, 'outcome'), reasonCode: reason, nextStep: text(form, 'nextStep')
          }
        }).then(function (body) { return 'Application recorded as ' + words(body.state) + '.'; });
      });
    }

    /* ---------- SRS Phase 1 desk actions ---------- */

    // Manual credit vetting. The route refuses an approval without these inputs
    // (underwriting_inputs_required is a database trigger as well), so the desk
    // records them here first and decides afterwards.
    if (action === 'underwriting-inputs') {
      return withBusy(form, function () {
        var income = text(form, 'declaredIncomeNaira');
        var employment = text(form, 'employmentStatus');
        var body = { note: text(form, 'note') };
        // Omitted rather than sent empty: the schema accepts '' but sending a
        // value the desk did not type would overwrite one already on file.
        if (income) body.declaredIncomeNaira = income;
        if (employment) body.employmentStatus = employment;
        return api('/applications/' + encodeURIComponent(text(form, 'applicationId')) + '/underwriting', {
          method: 'PATCH', body: body
        }).then(function (res) {
          // The route answers with the updated application plus an affordability
          // block. There is no "inputs still required" list on the success path -
          // that refusal arrives as a 400 on the DECISION, so the useful thing to
          // show here is the ratio the desk just made calculable.
          var aff = res && res.affordability;
          if (!aff) return 'Vetting inputs recorded.';
          var bps = aff.priceToIncomeBps;
          return 'Vetting inputs recorded. Price against declared annual income: ' +
            (bps === null || bps === undefined
              ? 'not calculable without a declared income.'
              : (Number(bps) / 100).toFixed(1) + '%.') +
            (aff.note ? ' ' + aff.note : '');
        });
      });
    }

    // The identity seam. Records the OUTCOME of a human check, never an
    // identifier: refuseIdentityData guards this write as well, so a BVN or NIN
    // typed into the note is rejected rather than stored.
    if (action === 'identity-outcome') {
      return withBusy(form, function () {
        var body = {
          outcome: text(form, 'outcome'),
          reasonCode: text(form, 'reasonCode'),
          performedBy: text(form, 'performedBy')
        };
        var applicationId = text(form, 'applicationId');
        var leadId = text(form, 'leadId');
        var providerRef = text(form, 'providerRef');
        if (applicationId) body.applicationId = applicationId;
        if (leadId) body.leadId = leadId;
        // A provider reference with no provider would claim a check an external
        // system performed, so the route requires both or neither.
        if (providerRef) { body.providerRef = providerRef; body.provider = text(form, 'provider'); }
        return api('/identity', { method: 'POST', body: body })
          .then(function (created) { return 'Identity outcome recorded: ' + words(created.outcome) + '.'; });
      });
    }

    // Listing photographs. Upload is gated on a passed inspection of the same
    // listing, so evidence cannot be attached to a home nobody has walked.
    if (action === 'upload-listing-media') {
      return withBusy(form, function () {
        return readEvidence(form.elements.photos.files).then(function (images) {
          if (!images.length) throw new Error('Choose at least one photograph taken during the inspection.');
          return api('/listing-media', { method: 'POST', body: {
            listingId: text(form, 'listingId'),
            sourceTaskId: text(form, 'sourceTaskId'),
            room: text(form, 'room'),
            images: images
          }});
        }).then(function (body) {
          var created = body.media || body.created || [];
          return 'Uploaded ' + (created.length || (body.ids || []).length || 'the') +
            ' photograph(s). They are private until published.';
        });
      });
    }

    if (action === 'publish-listing-media') {
      return withBusy(form, function () {
        return api('/listing-media/' + encodeURIComponent(text(form, 'mediaId')) + '/publish', {
          method: 'POST', body: {}
        }).then(function () { return 'Photograph published. It can now appear on the homes page.'; });
      });
    }

    if (action === 'unpublish-listing-media') {
      return withBusy(form, function () {
        return api('/listing-media/' + encodeURIComponent(text(form, 'mediaId')) + '/unpublish', {
          method: 'POST', body: {}
        }).then(function () { return 'Photograph unpublished. Its signed links stop working immediately.'; });
      });
    }

    if (action === 'delete-listing-media') {
      return withBusy(form, function () {
        return api('/listing-media/' + encodeURIComponent(text(form, 'mediaId')), { method: 'DELETE' })
          .then(function () { return 'Photograph deleted and the stored asset destroyed.'; });
      });
    }

    if (action === 'create-viewing') {
      return withBusy(form, function () {
        var body = {
          listingId: text(form, 'listingId'),
          scheduledAt: toIso(text(form, 'scheduledAt')),
          attendeeName: text(form, 'attendeeName'),
          attendeePhone: text(form, 'attendeePhone'),
          note: text(form, 'note')
        };
        var applicationId = text(form, 'applicationId');
        var leadId = text(form, 'leadId');
        if (applicationId) body.applicationId = applicationId;
        if (leadId) body.leadId = leadId;
        return api('/viewings', { method: 'POST', body: body })
          .then(function (created) { return 'Viewing arranged: ' + created.id; });
      });
    }

    if (action === 'viewing-outcome') {
      return withBusy(form, function () {
        var outcome = text(form, 'outcome');
        var body = {
          outcome: outcome,
          note: text(form, 'note'),
          // Recording this is the point of the field: releasing an address is
          // the one act on a viewing that has to be attributable afterwards.
          addressReleased: form.elements.addressReleased.checked
        };
        if (outcome === 'rescheduled') body.rescheduledTo = toIso(text(form, 'rescheduledTo'));
        return api('/viewings/' + encodeURIComponent(text(form, 'viewingId')) + '/outcome', {
          method: 'POST', body: body
        }).then(function (res) { return 'Viewing recorded as ' + words((res && res.outcome) || outcome) + '.'; });
      });
    }

    if (action === 'resolve-rights') {
      return withBusy(form, function () {
        var state = text(form, 'state');
        var resolution = text(form, 'resolution');
        if (state !== 'in_progress' && !resolution) {
          throw new Error('A completed or rejected request needs a resolution note.');
        }
        return api('/rights-requests/' + encodeURIComponent(text(form, 'requestId')) + '/resolve', {
          method: 'POST', body: { state: state, resolution: resolution }
        }).then(function (body) {
          // Completing an erasure redacts in place and withdraws consent; the
          // route reports how much, which is what the desk needs to see to know
          // the request was actually acted on rather than just closed.
          var redacted = body && body.redacted ? body.redacted.length : 0;
          var withdrawn = body && body.withdrawn ? body.withdrawn : 0;
          return 'Request ' + words((body && body.state) || state) +
            (redacted || withdrawn
              ? ' (' + redacted + ' field(s) redacted, ' + withdrawn + ' consent(s) withdrawn).'
              : '.');
        });
      });
    }
  });

  /* ---------- action forms ---------- */

  function listingPrepareForm() {
    return actionCard('Start the verification workflow', 'One action submits the listing and creates its missing checks.',
      '<form data-action="prepare-verification">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required id="prepare-listing-id" placeholder="Use the listing row button below"') +
        '</div>' +
        '<p class="form-help"><i class="ph ph-info" aria-hidden="true"></i><span>This creates identity, inspection and title tasks. It never passes a check or publishes the home for you.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Prepare checks</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function listingCreateForm() {
    return actionCard('Add a listing', 'Record supply from a landlord or agent call.',
      '<form data-action="create-listing">' +
        '<div class="form-grid">' +
          field('Owner name', 'ownerName', 'text', 'required maxlength="120" placeholder="e.g. Adebayo Ogunlesi"') +
          field('Owner phone', 'ownerPhone', 'text', 'maxlength="20" placeholder="+234 800 000 0000"') +
          field('Agent name', 'agentName', 'text', 'maxlength="120" placeholder="e.g. Lekki Prime Estates"') +
          field('Area', 'area', 'text', 'required maxlength="80" placeholder="e.g. Ikoyi, Lagos"') +
          field('Address (staff only)', 'address', 'text', 'maxlength="240" placeholder="e.g. 14 Glover Road, Ikoyi"') +
          field('Home type', 'homeType', 'text', 'required maxlength="80" placeholder="e.g. 3-bedroom apartment"') +
          field('Annual rent in naira', 'rentAnnualNaira', 'text', 'required inputmode="decimal" placeholder="4500000"') +
          '<label class="form-field check-field"><span>Installments</span><span><input type="checkbox" name="acceptsInstallments"> Landlord accepts a schedule</span></label>' +
          '<label class="form-field form-field--wide"><span>Terms or full cost notes</span><textarea name="terms" maxlength="2000" rows="3" placeholder="Service charge, caution deposit, agency & legal terms..."></textarea></label>' +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Create listing</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function listingTransitionForm() {
    return actionCard('Manual listing state change', 'Use for suspension, archiving, or an exceptional state change; normal checks advance the workflow automatically.',
      '<form data-action="transition-listing">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required id="transition-listing-id" placeholder="full UUID"') +
          selectField('Move to', 'to', '<option value="submitted">Submitted</option><option value="identity_verified">ID verified</option><option value="inspected">Inspected</option><option value="title_verified">Title verified</option><option value="live">Live</option><option value="reserved">Reserved</option><option value="let">Let</option><option value="suspended">Suspended</option><option value="archived">Archived</option>') +
          '<label class="form-field form-field--wide"><span>Reason or note</span><textarea name="reason" maxlength="400" rows="2" placeholder="Explain the rationale for this manual transition..."></textarea></label>' +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save transition</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function taskCreateForm() {
    return actionCard('Add a missing verification check', 'Use only for a replacement or a check added later.',
      '<form data-action="create-task">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required placeholder="full UUID"') +
          selectField('Check type', 'type', '<option value="identity">Identity</option><option value="inspection">Inspection</option><option value="title">Title</option>') +
          field('Assignee', 'assignee', 'text', 'maxlength="80" placeholder="name or team"') +
          field('SLA hours', 'slaHours', 'number', 'min="1" max="720" value="48"') +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Create task</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function taskResultForm() {
    return actionCard('Complete a verification check', 'A pass requires evidence; the listing advances automatically when the next gate is earned.',
      '<form data-action="result-task">' +
        '<div class="form-grid">' +
          field('Task ID', 'taskId', 'text', 'required id="result-task-id" placeholder="full UUID"') +
          selectField('Result', 'result', '<option value="pass">Pass</option><option value="fail">Fail</option>') +
          field('Reason category', 'reasonCode', 'text', 'maxlength="60" placeholder="e.g. not_accessible"') +
          '<label class="form-field form-field--wide"><span>Evidence photo(s)</span><input type="file" name="evidence" accept="image/*" multiple><small>Up to 12 files, 9 MB total. Do not upload identity or financial documents.</small></label>' +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save task result</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function applicationCreateForm() {
    return actionCard('Record an application', 'Use only for a live or reserved listing.',
      '<form data-action="create-application">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required placeholder="full UUID"') +
          field('Existing lead ID', 'leadId', 'text', 'placeholder="optional UUID"') +
          field('Tenant name', 'tenantName', 'text', 'required maxlength="120" placeholder="e.g. Chioma Okafor"') +
          field('Tenant phone', 'tenantPhone', 'text', 'maxlength="20" placeholder="+234 800 000 0000"') +
          field('Tenant email', 'tenantEmail', 'email', 'maxlength="180" placeholder="chioma@example.com"') +
          selectField('Schedule', 'schedule', '<option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option>') +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Create application</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function applicationDecisionForm() {
    return actionCard('Record an application decision', 'Terminal decision; the tenant receives the reason category and next step.',
      '<form data-action="decide-application">' +
        '<div class="form-grid">' +
          field('Application ID', 'applicationId', 'text', 'required id="decision-app-id" placeholder="full UUID"') +
          selectField('Outcome', 'outcome', '<option value="approved">Approved</option><option value="conditional">Conditional</option><option value="declined">Declined</option>') +
          field('Reason category', 'reasonCode', 'text', 'required maxlength="60" placeholder="e.g. affordability"') +
          '<label class="form-field form-field--wide"><span>Next step for tenant</span><textarea name="nextStep" maxlength="400" rows="2" placeholder="What should they do next?"></textarea></label>' +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save decision</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  /* ---------- renderers ---------- */

  function renderLeads(list, scope) {
    return window.ileeDeskView.queue('leads', list, { cards: '' });
  }

  function renderTasks(list, scope) {
    return window.ileeDeskView.queue('tasks', list, { cards: taskCreateForm() + taskResultForm() });
  }

  function renderListings(list, scope) {
    return window.ileeDeskView.queue('listings', list, { cards: listingPrepareForm() + listingCreateForm() + listingTransitionForm() + listingMediaUploadForm() + listingMediaManageForm() });
  }

  function renderApps(list, scope) {
    return window.ileeDeskView.queue('apps', list, { cards: applicationCreateForm() + underwritingInputsForm() + identityOutcomeForm() + applicationDecisionForm() });
  }

  function adminInviteForm() {
    return actionCard('Invite another administrator', 'The invitee must prove control of their email with a one-time code, then choose a password.',
      '<form data-action="invite-admin">' +
        '<div class="form-grid">' +
          field('Name', 'adminName', 'text', 'required maxlength="120"') +
          field('Email', 'adminEmail', 'email', 'required maxlength="200"') +
        '</div><button class="btn btn--primary" type="submit">Send administrator invite</button>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function renderStaffApplications(list, scope) {
    return window.ileeDeskView.queue('staff', list, { cards: adminInviteForm() });
  }

  /* ---------- load ---------- */

  /* ---------- SRS Phase 1 desk forms ---------- */

  function underwritingInputsForm() {
    return actionCard('Record vetting inputs', 'Manual credit vetting. An approval is refused until the inputs a decision rests on are on file.',
      '<form data-action="underwriting-inputs">' +
        '<div class="form-grid">' +
          field('Application ID', 'applicationId', 'text', 'required id="underwriting-app-id" placeholder="full UUID"') +
          field('Declared monthly income in naira', 'declaredIncomeNaira', 'text', 'inputmode="decimal" placeholder="450000"') +
          selectField('Employment status', 'employmentStatus',
            '<option value="">Not stated</option><option value="employed">Employed</option>' +
            '<option value="self_employed">Self employed</option><option value="business_owner">Business owner</option>' +
            '<option value="contract">Contract</option><option value="student">Student</option>' +
            '<option value="retired">Retired</option><option value="other">Other</option>') +
          '<label class="form-field form-field--wide"><span>Vetting note</span><textarea name="note" maxlength="2000" rows="3" placeholder="What was checked, against what, and by whom"></textarea></label>' +
        '</div>' +
        '<p class="form-help"><i class="ph ph-warning" aria-hidden="true"></i><span>Record what the applicant declared and what the desk checked. Do not paste a bank statement, an account number or an identity number into the note: the API refuses those fields.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save vetting inputs</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function identityOutcomeForm() {
    return actionCard('Record an identity check outcome', 'A person confirmed who someone is. The outcome is stored, never an identifier.',
      '<form data-action="identity-outcome">' +
        '<div class="form-grid">' +
          field('Application ID', 'applicationId', 'text', 'id="identity-app-id" placeholder="one of application or lead"') +
          field('Lead ID', 'leadId', 'text', 'placeholder="one of application or lead"') +
          selectField('Outcome', 'outcome',
            '<option value="verified">Verified</option>' +
            '<option value="unable_to_verify">Unable to verify</option>' +
            '<option value="rejected">Rejected</option>') +
          field('Reason category', 'reasonCode', 'text', 'maxlength="60" placeholder="e.g. documents_unavailable"') +
          field('Performed by', 'performedBy', 'text', 'maxlength="120" placeholder="who did the check"') +
          field('Provider reference', 'providerRef', 'text', 'maxlength="120" placeholder="only with a provider"') +
          field('Provider', 'provider', 'text', 'maxlength="80" placeholder="required if a reference is given"') +
        '</div>' +
        '<p class="form-help"><i class="ph ph-info" aria-hidden="true"></i><span>No identity provider is integrated in Phase 1, so providerRef and provider stay empty. The route refuses one without the other, because a reference with no provider would claim a check no system performed.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save identity outcome</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function listingMediaUploadForm() {
    return actionCard('Upload listing photographs', 'Gated on a passed inspection of the same listing. Photographs are private until published.',
      '<form data-action="upload-listing-media">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required placeholder="full UUID"') +
          field('Source inspection task ID', 'sourceTaskId', 'text', 'required placeholder="the passed inspection task"') +
          field('Room', 'room', 'text', 'maxlength="60" placeholder="Living room, kitchen, gate"') +
          '<label class="form-field form-field--wide"><span>Photographs</span><input type="file" name="photos" accept="image/*" multiple><small>Up to 12 files, 9 MB total. EXIF and GPS are stripped on upload.</small></label>' +
        '</div>' +
        '<p class="form-help"><i class="ph ph-lock-key" aria-hidden="true"></i><span>Only photographs taken during an inspection that passed can be attached to a home. That gate is in the route and in the database, not in this form.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Upload photographs</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function listingMediaManageForm() {
    return actionCard('Publish, unpublish or delete a photograph', 'Publishing needs the listing at tier 2 or above. Unpublishing stops the signed links at once.',
      '<form data-action="publish-listing-media">' +
        '<div class="form-grid">' + field('Media ID', 'mediaId', 'text', 'required placeholder="full UUID"') + '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Publish</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>' +
      '<form data-action="unpublish-listing-media">' +
        '<div class="form-grid">' + field('Media ID', 'mediaId', 'text', 'required placeholder="full UUID"') + '</div>' +
        '<div class="form-actions"><button class="btn btn--secondary" type="submit">Unpublish</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>' +
      '<form data-action="delete-listing-media">' +
        '<div class="form-grid">' + field('Media ID', 'mediaId', 'text', 'required placeholder="full UUID"') + '</div>' +
        '<div class="form-actions"><button class="btn btn--ghost" type="submit">Delete and destroy the asset</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function viewingCreateForm() {
    return actionCard('Arrange a viewing', 'The desk arranges viewings; the tenant never sees an address until one is agreed.',
      '<form data-action="create-viewing">' +
        '<div class="form-grid">' +
          field('Listing ID', 'listingId', 'text', 'required placeholder="full UUID"') +
          field('Application ID', 'applicationId', 'text', 'placeholder="optional"') +
          field('Lead ID', 'leadId', 'text', 'placeholder="optional"') +
          field('When', 'scheduledAt', 'datetime-local', 'required') +
          field('Attendee name', 'attendeeName', 'text', 'maxlength="120" placeholder="e.g. Babatunde Lawal"') +
          field('Attendee phone', 'attendeePhone', 'text', 'maxlength="20" placeholder="+234 800 000 0000"') +
          '<label class="form-field form-field--wide"><span>Note</span><textarea name="note" maxlength="1000" rows="2" placeholder="Access instructions for the inspector or agent, not for the tenant"></textarea></label>' +
        '</div>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Arrange viewing</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function viewingOutcomeForm() {
    return actionCard('Record a viewing outcome', 'Rescheduling clears a previous outcome. Releasing an address here is audited.',
      '<form data-action="viewing-outcome">' +
        '<div class="form-grid">' +
          field('Viewing ID', 'viewingId', 'text', 'required id="viewing-outcome-id" placeholder="full UUID"') +
          selectField('Outcome', 'outcome',
            '<option value="completed">Completed</option><option value="cancelled">Cancelled</option>' +
            '<option value="no_show">No show</option><option value="rescheduled">Rescheduled</option>') +
          field('Rescheduled to', 'rescheduledTo', 'datetime-local') +
          '<label class="form-field check-field"><span>Address</span><span><input type="checkbox" name="addressReleased"> The exact address was released to the attendee</span></label>' +
          '<label class="form-field form-field--wide"><span>Note</span><textarea name="note" maxlength="1000" rows="2" placeholder="Details about how the viewing went or rescheduling rationale..."></textarea></label>' +
        '</div>' +
        '<p class="form-help"><i class="ph ph-shield-check" aria-hidden="true"></i><span>Tick the address box only when the attendee was actually told where the home is. That tick is the record of the release.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save outcome</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function rightsResolveForm() {
    return actionCard('Resolve a rights request', 'Access, correction and erasure need a person. Completing an erasure redacts and withdraws consent.',
      '<form data-action="resolve-rights">' +
        '<div class="form-grid">' +
          field('Request ID', 'requestId', 'text', 'required id="resolve-rights-id" placeholder="full UUID"') +
          selectField('State', 'state',
            '<option value="in_progress">In progress</option>' +
            '<option value="completed">Completed</option>' +
            '<option value="rejected">Rejected</option>') +
          '<label class="form-field form-field--wide"><span>Resolution note</span><textarea name="resolution" maxlength="1000" rows="3" placeholder="What was done, and what the requester was told. Required to complete or reject."></textarea></label>' +
        '</div>' +
        '<p class="form-help"><i class="ph ph-shield-check" aria-hidden="true"></i><span>Erasure redacts the name and removes contact details; the row and the append-only audit log stay, so a verification that happened remains verifiable.</span></p>' +
        '<div class="form-actions"><button class="btn btn--primary" type="submit">Save resolution</button></div>' +
        '<p class="action-feedback" data-feedback></p></form>'
    );
  }

  function renderViewings(list, scope) {
    return window.ileeDeskView.queue('viewings', list, { cards: viewingCreateForm() + viewingOutcomeForm(), scope: scope });
  }

  function renderRights(list, scope) {
    return window.ileeDeskView.queue('rights', list, { cards: rightsResolveForm() });
  }

  function loadViewings(scope) {
    var want = scope || cache.viewingScope || 'upcoming';
    cache.viewingScope = want;
    window.ileeDeskView.state('viewings', 'loading');
    panel('viewings').innerHTML = skeleton(2);
    api('/viewings?scope=' + encodeURIComponent(want)).then(function (d) {
      cache.viewings = d.viewings || [];
      panel('viewings').innerHTML = renderViewings(cache.viewings, want);
      wireClamps(panel('viewings'));
    }).catch(function () {
      window.ileeDeskView.state('viewings', 'error');
      panel('viewings').innerHTML = failed('viewings');
    });
  }

  function loadRights() {
    window.ileeDeskView.state('rights', 'loading');
    panel('rights').innerHTML = skeleton(2);
    api('/rights-requests').then(function (d) {
      cache.rights = d.requests || [];
      panel('rights').innerHTML = renderRights(cache.rights);
      wireClamps(panel('rights'));
      var open = cache.rights.filter(function (r) {
        return r.state === 'received' || r.state === 'in_progress';
      }).length;
      var counter = document.getElementById('c-rights');
      if (counter) counter.textContent = open;
    }).catch(function () {
      window.ileeDeskView.state('rights', 'error');
      panel('rights').innerHTML = failed('rights requests');
      var counter = document.getElementById('c-rights');
      if (counter) counter.textContent = '!';
    });
  }

  function panel(id) { return document.getElementById('panel-' + id); }

  function loadStaffApplications() {
    if (!session || !session.staff || session.staff.role !== 'admin') return;
    window.ileeDeskView.state('staff', 'loading');
    panel('staff').innerHTML = skeleton(2);
    api('/staff-applications').then(function (d) {
      cache.staffApplications = d.applications || [];
      panel('staff').innerHTML = renderStaffApplications(cache.staffApplications);
      wireClamps(panel('staff'));
    }).catch(function () {
      window.ileeDeskView.state('staff', 'error');
      panel('staff').innerHTML = failed('staff applications');
    });
  }

  function updateAccountWorkload() {
    var activeLeads = (cache.leads || []).filter(function (lead) { return lead.status === 'new'; }).length;
    var openTasks = (cache.tasks || []).length;
    var workingListings = (cache.listings || []).filter(function (listing) { return listing.state !== 'archived'; }).length;
    var activeApplications = (cache.apps || []).length;
    var total = activeLeads + openTasks + workingListings + activeApplications;
    var target = document.getElementById('account-queue-total');
    if (target) target.textContent = total + (total === 1 ? ' active record' : ' active records');
  }

  function loadAll() {
    if (!session) return;
    window.ileeDeskView.closeDialog();
    window.ileeDeskView.setStaff(session.staff);
    var now = new Date();
    var staff = session.staff || {};
    var name = staff.name || 'Staff';
    var firstName = name.trim().split(/\s+/)[0] || 'Staff';
    var greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
    var initials = name.trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase() || 'IS';

    setText('whoami', name);
    setText('whoami-initial', initials);
    setText('account-initial', initials);
    setText('account-name', name);
    setText('account-role', staffRole(staff.role));
    setText('account-session-time', now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }));
    var copyEmailButton = document.getElementById('account-copy-email');
    if (copyEmailButton) {
      copyEmailButton.setAttribute('data-copy-email', staff.email || '');
      copyEmailButton.disabled = !staff.email;
    }
    setText('sidebar-initial', initials);
    setText('desk-greeting', greeting + ', ' + firstName + (/[.!?]$/.test(firstName) ? '' : '.'));
    setText('desk-date', now.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' }));
    setText('desk-updated', 'Refreshed ' + now.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }));
    setText('sidebar-name', name);
    setText('sidebar-role', staffRole(staff.role));

    window.ileeDeskView.state('leads', 'loading');
    panel('leads').innerHTML = skeleton(3);
    window.ileeDeskView.state('tasks', 'loading');
    panel('tasks').innerHTML = skeleton(2);
    window.ileeDeskView.state('listings', 'loading');
    panel('listings').innerHTML = skeleton(2);
    window.ileeDeskView.state('apps', 'loading');
    panel('apps').innerHTML = skeleton(2);
    window.ileeDeskView.state('viewings', 'loading');
    panel('viewings').innerHTML = skeleton(2);
    window.ileeDeskView.state('rights', 'loading');
    panel('rights').innerHTML = skeleton(2);
    if (session.staff && session.staff.role === 'admin') {
      window.ileeDeskView.state('staff', 'loading');
    panel('staff').innerHTML = skeleton(2);
      loadStaffApplications();
    }

    api('/leads').then(function (d) {
      cache.leads = d.leads || [];
      panel('leads').innerHTML = renderLeads(cache.leads);
      wireClamps(panel('leads'));
      var fresh = cache.leads.filter(function (l) { return l.status === 'new'; }).length;
      document.getElementById('c-leads').textContent = fresh;
      updateAccountWorkload();
    }).catch(function () {
      window.ileeDeskView.state('leads', 'error');
      panel('leads').innerHTML = failed('leads');
      document.getElementById('c-leads').textContent = '!';
    });

    api('/tasks').then(function (d) {
      cache.tasks = d.tasks || [];
      panel('tasks').innerHTML = renderTasks(cache.tasks);
      wireClamps(panel('tasks'));
      document.getElementById('c-tasks').textContent = cache.tasks.filter(function (t) { return !t.result; }).length;
      var over = cache.tasks.filter(function (t) { return t.overdue && !t.result; }).length;
      setText('c-overdue', over);
      var overdueCard = document.querySelector('#c-overdue');
      if (overdueCard && overdueCard.parentNode) overdueCard.parentNode.classList.toggle('is-alert', over > 0);
      updateAccountWorkload();
    }).catch(function () {
      window.ileeDeskView.state('tasks', 'error');
      panel('tasks').innerHTML = failed('verification checks');
      document.getElementById('c-tasks').textContent = '!';
      setText('c-overdue', '!');
    });

    api('/listings').then(function (d) {
      cache.listings = d.listings || [];
      panel('listings').innerHTML = renderListings(cache.listings);
      wireClamps(panel('listings'));
      document.getElementById('c-live').textContent =
        cache.listings.filter(function (l) { return l.state === 'live'; }).length;
      updateAccountWorkload();
    }).catch(function () {
      window.ileeDeskView.state('listings', 'error');
      panel('listings').innerHTML = failed('listings');
      document.getElementById('c-live').textContent = '!';
    });

    api('/applications').then(function (d) {
      cache.apps = d.applications || [];
      panel('apps').innerHTML = renderApps(cache.apps);
      wireClamps(panel('apps'));
      document.getElementById('c-apps').textContent = cache.apps.length;
      updateAccountWorkload();
    }).catch(function () {
      window.ileeDeskView.state('apps', 'error');
      panel('apps').innerHTML = failed('applications');
      document.getElementById('c-apps').textContent = '!';
    });

    loadViewings(cache.viewingScope || 'upcoming');
    loadRights();

    fetch('/api/v1/meta').then(function (r) { return r.json(); }).then(function (m) {
      var off = [];
      if (m.configured && !m.configured.media) off.push('evidence upload (Cloudinary not configured)');
      if (m.configured && !m.configured.email) off.push('tenant email (Resend not configured)');
      if (m.configured && !m.configured.deskAlerts) off.push('new-lead desk alerts (OPS_NOTIFY_EMAIL not configured)');
      var banner = document.getElementById('banner');
      if (off.length) {
        banner.textContent = 'Switched off: ' + off.join(' · ') +
          (m.configured && !m.configured.media ? '. Listings cannot pass verification without evidence upload.' : '.');
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }
    }).catch(function () { /* the banner is optional */ });
  }

  function openDesk() {
    gate.hidden = true;
    app.hidden = false;
    app.classList.remove('is-entering');
    void app.offsetWidth;
    app.classList.add('is-entering');
    if (session && !session.verifiedShown) {
      session.verifiedShown = true;
      try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
      showVerifiedBadge();
    }
    var staffTab = document.getElementById('staff-tab');
    if (staffTab) {
      staffTab.hidden = !(session.staff && session.staff.role === 'admin');
      if (staffTab.hidden && staffTab.classList.contains('is-active')) {
        var firstTab = document.querySelector('.tab:not([hidden])');
        if (firstTab) firstTab.click();
      }
    }
    loadAll();
    if (welcomed) {
      showNotice('Welcome to the desk. Your account is ready.', false);
      welcomed = false;
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (err) { /* old browser */ }
    }
  }

  /* ---------- boot ---------- */

  try {
    var saved = sessionStorage.getItem(KEY);
    if (saved) {
      session = JSON.parse(saved);
      if (session && session.token) {
        fetch('/api/v1/auth/me', { headers: { 'Authorization': 'Bearer ' + session.token } })
          .then(function (r) {
            if (!r.ok) throw new Error('stale');
            return r.json();
          })
          .then(function (me) {
            session.staff = me.staff;
            try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
            openDesk();
          })
          .catch(function () { signOut('Your session ended. Sign in again.'); });
      }
    }
  } catch (err) { /* fall through to the gate */ }
})();
