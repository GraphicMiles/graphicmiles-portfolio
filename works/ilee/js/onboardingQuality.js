// Client-side quality feedback for staff onboarding. The API repeats these
// checks; this file exists to make the rejection understandable before submit.
(function (window) {
  'use strict';

  var PLACEHOLDER_NAME = {
    test: 1, tester: 1, 'test user': 1, user: 1, admin: 1, administrator: 1,
    unknown: 1, 'john doe': 1, 'jane doe': 1, foo: 1, bar: 1, asdf: 1,
    qwerty: 1, abcdef: 1, abc: 1
  };
  var PLACEHOLDER_EMAIL = {
    test: 1, tester: 1, testuser: 1, user: 1, admin: 1, administrator: 1,
    example: 1, foo: 1, bar: 1, noreply: 1, 'no-reply': 1, you: 1, email: 1,
    abc: 1, asdf: 1, qwerty: 1
  };
  var BLOCKED_DOMAINS = {
    'example.com': 1, 'example.org': 1, 'example.net': 1, invalid: 1, localhost: 1,
    'mailinator.com': 1, 'guerrillamail.com': 1, '10minutemail.com': 1,
    'temp-mail.org': 1, 'tempmail.com': 1, 'yopmail.com': 1, 'guerrillamail.net': 1, 'sharklasers.com': 1, 'dispostable.com': 1
  };

  function personName(input) {
    var value = String(input || '').trim().replace(/\s+/g, ' ');
    var lower = value.toLowerCase();
    if (value.length < 3) return { ok: false, message: 'Enter a real name with at least 3 characters.' };
    if (value.length > 120) return { ok: false, message: 'Keep the name under 120 characters.' };
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/.test(value)) return { ok: false, message: 'Use letters, spaces, apostrophes or hyphens only.' };
    if (PLACEHOLDER_NAME[lower]) return { ok: false, message: 'Use your real name, not a placeholder name.' };
    if (/(.)\1\1/i.test(value.replace(/\s/g, ''))) return { ok: false, message: 'That name looks incomplete. Check the spelling.' };
    var letters = (value.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length;
    var vowels = (value.match(/[aeiou]/gi) || []).length;
    var distinct = new Set(value.toLowerCase().replace(/[^a-zà-ÿ]/g, '').split('')).size;
    if (letters >= 8 && vowels / letters < 0.2) return { ok: false, message: 'Use a readable name so the desk can address you correctly.' };
    if (letters >= 8 && distinct <= 3) return { ok: false, message: 'Use a readable name so the desk can address you correctly.' };
    return { ok: true, value: value };
  }

  function email(input) {
    var value = String(input || '').trim().toLowerCase();
    var match = value.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
    if (!match) return { ok: false, message: 'Enter a valid email address.' };
    if (PLACEHOLDER_EMAIL[match[1]] || BLOCKED_DOMAINS[match[2]]) return { ok: false, message: 'Use a working email address, not a placeholder or temporary inbox.' };
    if (/^(.)\1{4,}$/.test(match[1].replace(/[._+-]/g, ''))) return { ok: false, message: 'Use a working email address.' };
    return { ok: true, value: value };
  }

  function password(value) {
    value = String(value || '');
    var common = /^(password|password123|qwerty|qwerty123|letmein|welcome|1234567890)$/i.test(value);
    var checks = {
      length: value.length >= 10,
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9\s]/.test(value)
    };
    var score = Object.keys(checks).reduce(function (sum, key) { return sum + (checks[key] ? 1 : 0); }, 0);
    return { checks: checks, score: score, common: common, ok: checks.length && checks.lower && checks.upper && checks.number && checks.special && !common, label: common ? 'Avoid common passwords' : score <= 2 ? 'Weak' : score === 3 ? 'Getting stronger' : score === 4 ? 'Good' : 'Strong' };
  }

  function mountPassword(input, meter) {
    if (!input || !meter) return function () { return password(''); };
    var bar = meter.querySelector('[data-password-bar]');
    var label = meter.querySelector('[data-password-label]');
    var rules = Array.prototype.slice.call(meter.querySelectorAll('[data-password-rule]'));
    function update() {
      var result = password(input.value);
      meter.dataset.score = String(result.score);
      meter.dataset.strong = result.ok ? 'true' : 'false';
      meter.dataset.common = result.common ? 'true' : 'false';
      if (bar) bar.style.setProperty('--password-score', String(result.score));
      if (label) label.textContent = input.value ? result.label : 'Use a unique password';
      rules.forEach(function (rule) {
        var pass = result.checks[rule.getAttribute('data-password-rule')];
        rule.classList.toggle('is-pass', Boolean(pass));
        rule.classList.toggle('is-fail', Boolean(input.value) && !pass);
      });
      return result;
    }
    input.addEventListener('input', update);
    update();
    return update;
  }

  window.ileeOnboardingQuality = {
    personName: personName,
    email: email,
    password: password,
    mountPassword: mountPassword
  };
})(window);
