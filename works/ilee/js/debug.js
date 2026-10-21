/**
 * Debug overlay - every page, public site and ops desk.
 *
 * Captures console output, uncaught errors, promise rejections, CSP
 * violations, failed resource loads, every fetch/XHR round trip, and coarse
 * user activity. One keystroke shows the log; one button copies it.
 *
 * Three decisions worth knowing about:
 *
 * 1. Capture starts when this file executes and never stops, even while the
 *    panel is closed. That is the whole point: something breaks, you open the
 *    panel afterwards, and the history is already there. The buffer is capped
 *    at MAX_ENTRIES and held in memory only - nothing is persisted or sent.
 *
 * 2. Everything is redacted on the way in, not on the way out. The ops desk
 *    sends 'Authorization: Bearer <OPS_TOKEN>' on every request and the lead
 *    forms carry names, emails and phone numbers. A log that quietly collects
 *    those is a liability, and a copied log gets pasted into chats and issue
 *    trackers. Secrets never enter the buffer, so they cannot leave it.
 *
 * 3. The panel is hidden by default in production and has to be asked for:
 *    ?debug=1, or Ctrl/Cmd+Shift+D. On localhost it opens on its own. A
 *    visitor reading a listings page should never meet a developer tool.
 *
 * No dependencies, no build step, ES5 to match the rest of js/.
 */
(function () {
  'use strict';

  if (window.ileeDebug) return;            // never install twice
  var doc = document;

  /* ------------------------------------------------------------------ *
   * config
   * ------------------------------------------------------------------ */

  var MAX_ENTRIES = 600;        // ring buffer ceiling
  var MAX_BODY = 2000;          // chars of any request/response body kept
  var MAX_STRING = 400;         // chars of any single logged string
  var STORE_KEY = 'ilee.debug';

  var T0 = (window.performance && performance.now) ? performance.now() : Date.now();

  /* ------------------------------------------------------------------ *
   * redaction
   *
   * Two passes. Key-aware for structured data, pattern-based for free text,
   * because a token can just as easily arrive inside an error message.
   * ------------------------------------------------------------------ */

  // Values that must never be readable, at any depth.
  var SECRET_KEY = /^(authorization|auth|token|invite|otp|code|pin|setup_url|setupurl|setup_token|ops_token|opstoken|password|passwd|secret|api_key|apikey|x-ops-token|service_role|service_role_key|supabase_service_role_key|cookie|set-cookie)$/i;

  // Identity. Kept partially visible: enough to tell two records apart,
  // not enough to be a contact list.
  var IDENTITY_KEY = /^(email|phone|name|ownername|owner_phone|ownerphone|tenantemail|tenant_email|tenantname|tenant_name|tenantphone|tenant_phone|agentname|agent_name|address|to|from)$/i;

  // Big opaque blobs: log the size, never the payload.
  var BLOB_KEY = /^(evidence|image|file|data|base64|photo)$/i;

  var RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  var RE_PHONE = /(?:\+?234|0)[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}\b/g;
  var RE_BEARER = /(Bearer\s+)[A-Za-z0-9._\-]+/gi;
  var RE_JWT = /eyJ[A-Za-z0-9._\-]{20,}/g;                 // supabase anon/service keys
  var RE_SBTOKEN = /\b(sbp|sb_secret|sb_publishable)_[A-Za-z0-9._\-]{8,}/g;
  var RE_GHTOKEN = /\bgh[pousr]_[A-Za-z0-9]{20,}/g;

  function maskEmail(s) {
    var at = s.indexOf('@');
    if (at < 1) return '***';
    return s.charAt(0) + '***' + s.slice(at);
  }

  function maskDigits(s) {
    var d = String(s).replace(/\D/g, '');
    if (d.length < 5) return '***';
    return d.slice(0, 3) + '*'.repeat(Math.max(0, d.length - 6)) + d.slice(-3);
  }

  function maskName(s) {
    return String(s).trim().split(/\s+/).map(function (part) {
      return part ? part.charAt(0) + '\u2024'.repeat(Math.min(part.length - 1, 5)) : part;
    }).join(' ');
  }

  // Free text: strip anything that looks like a credential or a contact.
  function scrubText(s) {
    if (typeof s !== 'string') return s;
    return s
      .replace(RE_BEARER, '$1***')
      .replace(RE_JWT, '***jwt***')
      .replace(RE_SBTOKEN, '***supabase-token***')
      .replace(RE_GHTOKEN, '***github-token***')
      .replace(RE_EMAIL, function (m) { return maskEmail(m); })
      .replace(RE_PHONE, function (m) { return maskDigits(m); });
  }

  function clip(s, max) {
    s = String(s);
    var lim = max || MAX_STRING;
    return s.length > lim ? s.slice(0, lim) + '\u2026 [' + s.length + ' chars]' : s;
  }

  function redactKeyed(key, value) {
    if (SECRET_KEY.test(key)) return '***redacted***';
    if (BLOB_KEY.test(key) && typeof value === 'string' && value.length > 64) {
      return '[' + value.length + ' chars omitted]';
    }
    if (IDENTITY_KEY.test(key) && typeof value === 'string') {
      if (value.indexOf('@') > 0) return maskEmail(value);
      if (/^\+?[\d\s-]{7,}$/.test(value)) return maskDigits(value);
      return maskName(value);
    }
    return redact(value);
  }

  // Depth- and breadth-bounded: a logger must not be the thing that hangs
  // the page on a cyclic or enormous object.
  function redact(value, depth, seen) {
    depth = depth || 0;
    seen = seen || [];
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return clip(scrubText(value));
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'function') return '[function ' + (value.name || 'anonymous') + ']';
    if (depth > 4) return '[depth limit]';
    if (seen.indexOf(value) !== -1) return '[circular]';
    seen = seen.concat([value]);

    if (value instanceof Error) {
      return { name: value.name, message: clip(scrubText(value.message)), stack: clip(scrubText(value.stack || ''), 1200) };
    }
    if (typeof Element !== 'undefined' && value instanceof Element) {
      return '<' + value.tagName.toLowerCase() + (value.id ? '#' + value.id : '') + '>';
    }
    if (Object.prototype.toString.call(value) === '[object Array]') {
      var arr = value.slice(0, 20).map(function (v) { return redact(v, depth + 1, seen); });
      if (value.length > 20) arr.push('\u2026 +' + (value.length - 20) + ' more');
      return arr;
    }
    if (typeof value === 'object') {
      var out = {}, n = 0;
      for (var k in value) {
        if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
        if (++n > 40) { out['\u2026'] = 'more keys omitted'; break; }
        try { out[k] = redactKeyed(k, value[k]); } catch (e) { out[k] = '[unreadable]'; }
      }
      return out;
    }
    return String(value);
  }

  function stringify(value) {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value, null, 2); } catch (e) { return String(value); }
  }

  /* ------------------------------------------------------------------ *
   * buffer
   * ------------------------------------------------------------------ */

  var entries = [];
  var counts = { all: 0, error: 0, network: 0, console: 0, activity: 0 };
  var seq = 0;
  var writing = false;          // reentrancy guard: the panel must not log itself

  function now() {
    return ((window.performance && performance.now) ? performance.now() : Date.now()) - T0;
  }

  function push(kind, level, label, detail) {
    if (writing) return null;
    var entry = {
      id: ++seq,
      t: now(),
      clock: new Date().toISOString(),
      kind: kind,                       // console | error | network | activity | system
      level: level,                     // log | info | warn | error | ok
      label: clip(scrubText(String(label)), 300),
      detail: detail == null ? '' : clip(scrubText(stringify(detail)), 8000)
    };
    entries.push(entry);
    if (entries.length > MAX_ENTRIES) entries.shift();
    counts.all++;
    if (counts[kind] !== undefined) counts[kind]++;
    if (level === 'error' && kind !== 'error') counts.error++;
    render(entry);
    return entry;
  }

  /* ------------------------------------------------------------------ *
   * capture: console
   * ------------------------------------------------------------------ */

  var native = {};
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (name) {
    native[name] = console[name] ? console[name].bind(console) : function () {};
    console[name] = function () {
      var args = Array.prototype.slice.call(arguments);
      try {
        var parts = args.map(function (a) { return typeof a === 'string' ? scrubText(a) : stringify(redact(a)); });
        var label = parts.join(' ');
        push('console', name === 'debug' ? 'log' : name, label.split('\n')[0], parts.length > 1 || label.indexOf('\n') > -1 ? label : '');
      } catch (e) { /* logging must never break the caller */ }
      return native[name].apply(console, args);
    };
  });

  /* ------------------------------------------------------------------ *
   * capture: errors
   * ------------------------------------------------------------------ */

  window.addEventListener('error', function (e) {
    // Two different events share this name. A resource that failed to load
    // has a target element; a script error has a message.
    var el = e.target;
    if (el && el !== window && el.tagName) {
      push('error', 'error',
        'failed to load ' + el.tagName.toLowerCase(),
        { src: el.src || el.href || '(none)', tag: el.outerHTML ? clip(el.outerHTML, 200) : '' });
      return;
    }
    push('error', 'error', e.message || 'uncaught error', {
      source: (e.filename || '?') + ':' + (e.lineno || 0) + ':' + (e.colno || 0),
      stack: e.error && e.error.stack ? clip(scrubText(e.error.stack), 1200) : '(no stack)'
    });
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    push('error', 'error',
      'unhandled rejection: ' + ((r && r.message) || String(r)),
      r && r.stack ? { stack: clip(scrubText(r.stack), 1200) } : redact(r));
  });

  // Worth its own line: the CSP here is strict and a violation is silent
  // in the UI but fatal to whatever was blocked.
  window.addEventListener('securitypolicyviolation', function (e) {
    push('error', 'error', 'CSP blocked ' + (e.violatedDirective || 'resource'), {
      blocked: e.blockedURI, directive: e.violatedDirective, policy: clip(e.originalPolicy || '', 300)
    });
  });

  /* ------------------------------------------------------------------ *
   * capture: fetch
   *
   * The wrapper is transparent. It never swallows a rejection, never
   * consumes the body (clone first), and returns exactly what the caller
   * expects. A debug tool that changes behaviour is worse than none.
   * ------------------------------------------------------------------ */

  if (window.fetch) {
    var nativeFetch = window.fetch;
    window.fetch = function (input, init) {
      var started = now();
      var method = 'GET', url = '', reqBody = null, reqHeaders = null;
      try {
        if (typeof Request !== 'undefined' && input instanceof Request) {
          method = input.method; url = input.url;
        } else {
          url = String(input);
        }
        if (init) {
          if (init.method) method = init.method;
          if (init.headers) reqHeaders = redact(headersToObject(init.headers));
          if (init.body && typeof init.body === 'string') reqBody = safeParse(init.body);
        }
      } catch (e) { /* observation only */ }

      var short = shortUrl(url);
      return nativeFetch.apply(this, arguments).then(function (res) {
        var ms = Math.round(now() - started);
        var entry = push('network', res.ok ? 'ok' : 'error',
          method.toUpperCase() + ' ' + short + ' \u2192 ' + res.status + ' (' + ms + 'ms)', null);

        // Read the body off a clone so the caller still gets an unread stream.
        // This is the part that turns an opaque 500 into a cause.
        try {
          var type = res.headers.get('content-type') || '';
          if (entry && /json|text|xml/.test(type)) {
            res.clone().text().then(function (text) {
              attach(entry, {
                request: { method: method.toUpperCase(), url: url, headers: reqHeaders, body: reqBody },
                response: { status: res.status, statusText: res.statusText, type: type, body: safeParse(text.slice(0, MAX_BODY)) }
              });
            })['catch'](function () {});
          } else if (entry) {
            attach(entry, { request: { method: method.toUpperCase(), url: url, headers: reqHeaders, body: reqBody },
                            response: { status: res.status, type: type || '(none)' } });
          }
        } catch (e) { /* ignore */ }
        return res;
      })['catch'](function (err) {
        var ms = Math.round(now() - started);
        push('network', 'error', method.toUpperCase() + ' ' + short + ' \u2192 failed (' + ms + 'ms)', {
          error: err && err.message ? err.message : String(err),
          hint: 'network error, CORS, or the API is unreachable',
          request: { url: url, headers: reqHeaders, body: reqBody }
        });
        throw err;                     // rethrow: the caller owns this failure
      });
    };
  }

  function headersToObject(h) {
    var out = {};
    try {
      if (typeof Headers !== 'undefined' && h instanceof Headers) {
        h.forEach(function (v, k) { out[k] = v; });
      } else if (Object.prototype.toString.call(h) === '[object Array]') {
        h.forEach(function (pair) { out[pair[0]] = pair[1]; });
      } else if (h && typeof h === 'object') {
        for (var k in h) if (Object.prototype.hasOwnProperty.call(h, k)) out[k] = h[k];
      }
    } catch (e) { /* ignore */ }
    return out;
  }

  function safeParse(text) {
    if (typeof text !== 'string') return text;
    var trimmed = text.trim();
    if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
      try { return redact(JSON.parse(trimmed)); } catch (e) { /* fall through */ }
    }
    return clip(scrubText(text), MAX_BODY);
  }

  function safeUrl(url) {
    try {
      var u = new URL(url, location.href);
      ['invite', 'setupToken', 'setup_token', 'token'].forEach(function (key) { u.searchParams.delete(key); });
      return u.toString();
    } catch (e) { return String(url); }
  }

  function shortUrl(url) {
    try {
      var u = new URL(safeUrl(url), location.href);
      return (u.origin === location.origin ? '' : u.origin) + u.pathname + (u.search || '');
    } catch (e) { return String(url); }
  }

  function attach(entry, detail) {
    if (!entry) return;
    entry.detail = clip(scrubText(stringify(detail)), 8000);
    if (openState && lastRendered[entry.id]) updateRow(entry);
  }

  /* ------------------------------------------------------------------ *
   * capture: XMLHttpRequest
   * ------------------------------------------------------------------ */

  if (window.XMLHttpRequest) {
    var XP = XMLHttpRequest.prototype;
    var xopen = XP.open, xsend = XP.send, xhead = XP.setRequestHeader;
    XP.open = function (method, url) {
      this.__dbg = { method: method, url: url, headers: {}, started: 0 };
      return xopen.apply(this, arguments);
    };
    XP.setRequestHeader = function (k, v) {
      if (this.__dbg) this.__dbg.headers[k] = v;
      return xhead.apply(this, arguments);
    };
    XP.send = function (body) {
      var d = this.__dbg, self = this;
      if (d) {
        d.started = now();
        this.addEventListener('loadend', function () {
          var ms = Math.round(now() - d.started);
          var failed = self.status === 0 || self.status >= 400;
          push('network', failed ? 'error' : 'ok',
            'XHR ' + d.method.toUpperCase() + ' ' + shortUrl(d.url) + ' \u2192 ' + (self.status || 'failed') + ' (' + ms + 'ms)',
            { request: { headers: redact(d.headers), body: typeof body === 'string' ? safeParse(body) : '[non-text body]' },
              response: { status: self.status, body: safeParse(String(self.responseText || '').slice(0, MAX_BODY)) } });
        });
      }
      return xsend.apply(this, arguments);
    };
  }

  /* ------------------------------------------------------------------ *
   * capture: activity
   *
   * Coarse on purpose. Enough to reconstruct what the person did before the
   * error; not a keylogger. Field values are never recorded.
   * ------------------------------------------------------------------ */

  doc.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button,[role="button"],summary,input[type="submit"]') : null;
    if (!el) return;
    var text = (el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    push('activity', 'log', 'click \u00b7 ' + el.tagName.toLowerCase() + (text ? ' "' + text + '"' : ''),
      el.href ? { href: el.getAttribute('href') } : null);
  }, true);

  doc.addEventListener('submit', function (e) {
    var f = e.target;
    var fields = [];
    try {
      for (var i = 0; i < f.elements.length; i++) {
        var el = f.elements[i];
        if (!el.name) continue;
        // names and filled/empty only - never the value
        fields.push(el.name + (el.type === 'checkbox' ? (el.checked ? '=checked' : '=unchecked')
                                                      : (el.value ? '=filled' : '=empty')));
      }
    } catch (err) { /* ignore */ }
    push('activity', 'log', 'submit \u00b7 ' + (f.getAttribute('id') || f.getAttribute('name') || f.tagName.toLowerCase()),
      { action: f.getAttribute('action') || '(none)', method: f.getAttribute('method') || 'get', fields: fields });
  }, true);

  // Change events show the path through a form without becoming a keylogger.
  // File inputs record only that a file was selected, never its name or bytes.
  doc.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || !el.name || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    var value = el.type === 'checkbox'
      ? (el.checked ? 'checked' : 'unchecked')
      : el.type === 'file'
        ? ((el.files && el.files.length) ? el.files.length + ' file(s)' : 'empty')
        : (el.value ? 'filled' : 'empty');
    push('activity', 'log', 'change \u00b7 ' + el.name + '=' + value, {
      form: el.form && (el.form.id || el.form.getAttribute('name')) || '(none)',
      type: el.type || el.tagName.toLowerCase()
    });
  }, true);

  window.addEventListener('online', function () { push('activity', 'ok', 'network online'); });
  window.addEventListener('offline', function () { push('activity', 'error', 'network offline'); });
  doc.addEventListener('visibilitychange', function () { push('activity', 'log', 'page ' + (doc.hidden ? 'hidden' : 'visible')); });
  window.addEventListener('popstate', function () { push('activity', 'log', 'navigate \\u00b7 ' + shortUrl(location.href)); });
  window.addEventListener('hashchange', function () { push('activity', 'log', 'hash \u00b7 ' + location.hash); });

  window.addEventListener('load', function () {
    var nav = null;
    try { nav = performance.getEntriesByType('navigation')[0]; } catch (e) { /* ignore */ }
    push('system', 'ok', 'page loaded in ' + Math.round(now()) + 'ms', nav ? {
      dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      resources: (performance.getEntriesByType('resource') || []).length
    } : null);
  });

  /* ------------------------------------------------------------------ *
   * panel
   * ------------------------------------------------------------------ */

  var enabled = false, openState = false, filter = 'all', search = '';
  var root = null, listEl = null, badgeEl = null, statEl = null, launcher = null;
  var lastRendered = {};
  var pinned = true;            // follow the tail unless the reader scrolls up

  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get('debug') === '1') { enabled = true; sessionStorage.setItem(STORE_KEY, '1'); }
    else if (qs.get('debug') === '0') { enabled = false; sessionStorage.removeItem(STORE_KEY); }
    else if (sessionStorage.getItem(STORE_KEY) === '1') enabled = true;
  } catch (e) { /* private mode */ }

  // Local work gets the panel by default; production has to be asked.
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ||
                /\.e2b\.app$/.test(location.hostname) ||
                location.protocol === 'file:';
  if (isLocal) enabled = true;

  var CSS = [
    '#ileedbg,#ileedbg *{box-sizing:border-box;margin:0;padding:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '#ileedbg{position:fixed;z-index:2147483000;inset:auto 0 0 auto;color:#e8eee9;font-size:12px;line-height:1.45}',
    '#ileedbg button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}',
    '#ileedbg .ileedbg-launch{position:fixed;right:14px;bottom:14px;display:flex;align-items:center;gap:7px;',
    '  padding:8px 13px;border-radius:999px;background:#10231a;color:#dfe9e1;border:1px solid #2c4d3b;',
    '  box-shadow:0 6px 22px rgba(0,0,0,.35);letter-spacing:.02em}',
    '#ileedbg .ileedbg-launch:hover{background:#16301f;border-color:#3d6b50}',
    '#ileedbg .ileedbg-launch b{font-weight:600}',
    '#ileedbg .ileedbg-badge{min-width:17px;height:17px;padding:0 5px;border-radius:999px;background:#2c4d3b;color:#cfe3d6;',
    '  font-size:10.5px;display:inline-flex;align-items:center;justify-content:center;font-weight:600}',
    '#ileedbg .ileedbg-badge[data-err="1"]{background:#a33d2e;color:#fff}',
    '#ileedbg .ileedbg-panel{position:fixed;right:0;bottom:0;left:0;height:46vh;min-height:250px;display:flex;flex-direction:column;',
    '  background:#0c1712;border-top:1px solid #294436;box-shadow:0 -10px 40px rgba(0,0,0,.45)}',
    '#ileedbg .ileedbg-head{display:flex;align-items:center;gap:6px;flex-wrap:nowrap;padding:7px 10px;border-bottom:1px solid #1e3529;background:#0e1b15}',
    '#ileedbg .ileedbg-acts{display:flex;gap:6px;margin-left:auto;flex:none}',
    '#ileedbg .ileedbg-title{font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:10.5px;color:#7fae93}',
    '#ileedbg .ileedbg-f{flex:none;padding:4px 9px;border-radius:5px;border:1px solid #24402f;color:#9fbfac;font-size:11px}',
    '#ileedbg .ileedbg-f:hover{border-color:#3d6b50;color:#dfe9e1}',
    '#ileedbg .ileedbg-f[data-on="1"]{background:#1b3527;color:#eaf3ed;border-color:#437a58}',
    '#ileedbg .ileedbg-search{flex:0 1 200px;min-width:70px;padding:4px 9px;border-radius:5px;border:1px solid #24402f;',
    '  background:#0a140f;color:#dfe9e1;font-size:11px;outline:none}',
    '#ileedbg .ileedbg-search:focus{border-color:#437a58}',
    '#ileedbg .ileedbg-act{padding:4px 10px;border-radius:5px;border:1px solid #2c4d3b;background:#16301f;color:#cfe3d6;font-size:11px}',
    '#ileedbg .ileedbg-act:hover{background:#1e4029}',
    '#ileedbg .ileedbg-act[data-ok="1"]{background:#176b46;border-color:#176b46;color:#fff}',
    '#ileedbg .ileedbg-tool{display:none;flex:none;padding:10px;border-bottom:1px solid #1e3529;background:#10251a}',
    '#ileedbg .ileedbg-tool:not([hidden]){display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:8px;align-items:end}',
    '#ileedbg .ileedbg-tool-intro{grid-column:1/-1;color:#9fbfac;font-size:10.5px}',
    '#ileedbg .ileedbg-tool-intro strong{display:block;margin-bottom:2px;color:#e8eee9;font-size:11px}',
    '#ileedbg .ileedbg-field{display:grid;gap:3px;color:#7fae93;font-size:10px}',
    '#ileedbg .ileedbg-field input{width:100%;min-height:28px;padding:5px 7px;border:1px solid #2c4d3b;border-radius:5px;background:#0e1b15;color:#e8eee9;font:inherit}',
    '#ileedbg .ileedbg-field input:focus{border-color:#6aa47b;outline:2px solid rgba(198,143,57,.8);outline-offset:1px}',
    '#ileedbg .ileedbg-tool-submit{min-height:28px;padding:5px 9px;border:1px solid #437a58;border-radius:5px;background:#176b46;color:#fff;font:inherit;font-size:10.5px;font-weight:700;cursor:pointer}',
    '#ileedbg .ileedbg-tool-submit:disabled{opacity:.55;cursor:wait}',
    '#ileedbg .ileedbg-tool-status{grid-column:1/-1;min-height:15px;color:#9fbfac;font-size:10.5px}',
    '#ileedbg .ileedbg-tool-status[data-level="error"]{color:#f2b3a7}',
    '#ileedbg .ileedbg-tool-status[data-level="ok"]{color:#a8d8bd}',
    '#ileedbg .ileedbg-list{flex:1;overflow:auto;overscroll-behavior:contain}',
    '#ileedbg .ileedbg-row{display:grid;grid-template-columns:58px 62px 1fr auto;gap:8px;align-items:start;',
    '  padding:5px 10px;border-bottom:1px solid #15271e;cursor:pointer}',
    '#ileedbg .ileedbg-row:hover{background:#101f18}',
    '#ileedbg .ileedbg-t{color:#5d7d6b;font-variant-numeric:tabular-nums;font-size:11px}',
    '#ileedbg .ileedbg-k{font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;padding:2px 5px;border-radius:4px;',
    '  text-align:center;background:#1a2f24;color:#8ab49b}',
    '#ileedbg .ileedbg-k[data-k="error"]{background:#3b1714;color:#f0a99c}',
    '#ileedbg .ileedbg-k[data-k="network"]{background:#14293b;color:#9cc4e8}',
    '#ileedbg .ileedbg-k[data-k="activity"]{background:#2b2a16;color:#d6cf92}',
    '#ileedbg .ileedbg-k[data-k="system"]{background:#1b2b3a;color:#9fb6cc}',
    '#ileedbg .ileedbg-msg{white-space:pre-wrap;word-break:break-word;color:#d3e0d7}',
    '#ileedbg .ileedbg-row[data-level="error"] .ileedbg-msg{color:#f2b3a7}',
    '#ileedbg .ileedbg-row[data-level="warn"] .ileedbg-msg{color:#e8d49a}',
    '#ileedbg .ileedbg-row[data-level="ok"] .ileedbg-msg{color:#a8d8bd}',
    '#ileedbg .ileedbg-copy1{opacity:0;font-size:10px;color:#7fae93;padding:1px 6px;border:1px solid #24402f;border-radius:4px}',
    '#ileedbg .ileedbg-row:hover .ileedbg-copy1{opacity:1}',
    '#ileedbg .ileedbg-det{display:none;grid-column:3/5;white-space:pre-wrap;word-break:break-word;color:#9fbfac;',
    '  background:#0a1410;border-left:2px solid #2c4d3b;padding:7px 9px;margin-top:4px;border-radius:0 4px 4px 0;max-height:280px;overflow:auto}',
    '#ileedbg .ileedbg-row[data-open="1"] .ileedbg-det{display:block}',
    '#ileedbg .ileedbg-empty{padding:26px 14px;text-align:center;color:#5d7d6b}',
    '#ileedbg .ileedbg-foot{padding:5px 10px;border-top:1px solid #1e3529;background:#0e1b15;color:#5d7d6b;font-size:10.5px;',
    '  display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '@media (max-width:620px){#ileedbg .ileedbg-panel{height:62vh}#ileedbg .ileedbg-row{grid-template-columns:48px 54px 1fr;gap:6px}',
    '  #ileedbg .ileedbg-title{display:none}#ileedbg .ileedbg-head{flex-wrap:wrap}',
    '  #ileedbg .ileedbg-search{flex:1 1 100%;order:2}#ileedbg .ileedbg-acts{order:1}',
    '  #ileedbg .ileedbg-tool:not([hidden]){grid-template-columns:1fr 1fr}#ileedbg .ileedbg-tool-submit{grid-column:1/-1}',
    '  .ileedbg-copy1{display:none}.ileedbg-det{grid-column:1/4}}',
    '@media (prefers-reduced-motion:no-preference){#ileedbg .ileedbg-panel{animation:ileedbg-in .18s cubic-bezier(.22,1,.36,1)}}',
    '@keyframes ileedbg-in{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}'
  ].join('');

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    if (root) return;
    writing = true;

    var style = doc.createElement('style');
    style.id = 'ileedbg-style';
    style.textContent = CSS;
    doc.head.appendChild(style);

    root = el('div');
    root.id = 'ileedbg';
    root.setAttribute('aria-live', 'off');

    launcher = el('button', 'ileedbg-launch');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open debug log');
    launcher.appendChild(el('b', null, 'debug'));
    badgeEl = el('span', 'ileedbg-badge', '0');
    launcher.appendChild(badgeEl);
    launcher.addEventListener('click', function () { toggle(true); });

    var panel = el('div', 'ileedbg-panel');
    panel.style.display = 'none';

    var head = el('div', 'ileedbg-head');
    head.appendChild(el('span', 'ileedbg-title', 'ilee debug'));

    ['all', 'error', 'network', 'console', 'activity'].forEach(function (k) {
      var b = el('button', 'ileedbg-f', k);
      b.type = 'button';
      b.setAttribute('data-f', k);
      b.setAttribute('data-on', k === filter ? '1' : '0');
      b.addEventListener('click', function () {
        filter = k;
        Array.prototype.forEach.call(head.querySelectorAll('.ileedbg-f'), function (x) {
          x.setAttribute('data-on', x.getAttribute('data-f') === k ? '1' : '0');
        });
        redraw();
      });
      head.appendChild(b);
    });

    var searchEl = doc.createElement('input');
    searchEl.className = 'ileedbg-search';
    searchEl.type = 'search';
    searchEl.placeholder = 'filter\u2026';
    searchEl.setAttribute('aria-label', 'Filter log entries');
    searchEl.addEventListener('input', function () { search = this.value.toLowerCase(); redraw(); });
    head.appendChild(searchEl);

    var acts = el('div', 'ileedbg-acts');

    var bootstrapToggle = el('button', 'ileedbg-act', 'admin setup');
    bootstrapToggle.type = 'button';
    bootstrapToggle.title = 'Open the protected administrator bootstrap tool';
    acts.appendChild(bootstrapToggle);

    var copyBtn = el('button', 'ileedbg-act', 'copy');
    copyBtn.type = 'button';
    copyBtn.title = 'Copy the complete log, including errors, network calls and activity, to the clipboard';
    copyBtn.addEventListener('click', function () { copyAll(copyBtn); });
    acts.appendChild(copyBtn);

    var clearBtn = el('button', 'ileedbg-act', 'clear');
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', function () {
      entries.length = 0;
      counts = { all: 0, error: 0, network: 0, console: 0, activity: 0 };
      lastRendered = {};
      redraw();
      updateBadge();
    });
    acts.appendChild(clearBtn);

    var closeBtn = el('button', 'ileedbg-act', 'close');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', function () { toggle(false); });
    acts.appendChild(closeBtn);
    head.appendChild(acts);

    var bootstrapTool = el('form', 'ileedbg-tool');
    bootstrapTool.id = 'ileedbg-bootstrap-form';
    bootstrapTool.hidden = true;
    bootstrapTool.setAttribute('aria-label', 'Bootstrap administrator');
    var bootstrapIntro = el('div', 'ileedbg-tool-intro');
    bootstrapIntro.appendChild(el('strong', null, 'Bootstrap the first administrator'));
    bootstrapIntro.appendChild(el('span', null, 'Trusted-device only. The token is sent once, never stored, and redacted from the debug log.'));
    bootstrapTool.appendChild(bootstrapIntro);

    function bootstrapField(labelText, type, name, placeholder) {
      var label = el('label', 'ileedbg-field');
      label.appendChild(el('span', null, labelText));
      var input = el('input');
      input.type = type;
      input.name = name;
      input.placeholder = placeholder;
      input.autocomplete = 'off';
      input.required = true;
      label.appendChild(input);
      bootstrapTool.appendChild(label);
      return input;
    }

    var bootstrapNameInput = bootstrapField('Administrator name', 'text', 'adminName', 'Name');
    var bootstrapEmailInput = bootstrapField('Administrator email', 'email', 'adminEmail', 'admin@example.com');
    var bootstrapTokenInput = bootstrapField('Render OPS token', 'password', 'opsToken', 'OPS_TOKEN');
    var bootstrapSubmit = el('button', 'ileedbg-tool-submit', 'Send setup invite');
    bootstrapSubmit.type = 'submit';
    bootstrapTool.appendChild(bootstrapSubmit);
    var bootstrapStatus = el('div', 'ileedbg-tool-status', '');
    bootstrapStatus.setAttribute('role', 'status');
    bootstrapStatus.setAttribute('aria-live', 'polite');
    bootstrapTool.appendChild(bootstrapStatus);

    bootstrapToggle.addEventListener('click', function () {
      var opening = bootstrapTool.hidden;
      bootstrapTool.hidden = !opening;
      bootstrapToggle.setAttribute('data-ok', opening ? '1' : '0');
      if (opening) bootstrapNameInput.focus();
    });

    bootstrapTool.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = bootstrapNameInput.value.trim();
      var email = bootstrapEmailInput.value.trim();
      var token = bootstrapTokenInput.value;
      var quality = window.ileeOnboardingQuality;
      var nameCheck = quality ? quality.personName(name) : { ok: Boolean(name) };
      var emailCheck = quality ? quality.email(email) : { ok: Boolean(email) };
      if (!nameCheck.ok || !emailCheck.ok || !token || !bootstrapEmailInput.checkValidity()) {
        bootstrapStatus.textContent = (!nameCheck.ok ? nameCheck : emailCheck).message || 'Enter a name, valid email, and the Render OPS token.';
        bootstrapStatus.setAttribute('data-level', 'error');
        if (!nameCheck.ok) bootstrapNameInput.focus();
        else if (!emailCheck.ok || !bootstrapEmailInput.checkValidity()) bootstrapEmailInput.focus();
        else bootstrapTokenInput.focus();
        return;
      }
      bootstrapSubmit.disabled = true;
      bootstrapStatus.textContent = 'Sending the one-time administrator invite…';
      bootstrapStatus.removeAttribute('data-level');
      fetch('/api/v1/staff-admin-invites/bootstrap', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, email: email })
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      }).then(function (out) {
        if (!out.ok) throw new Error(out.body.message || 'The administrator invite was not sent (' + out.status + ').');
        bootstrapStatus.textContent = 'Invite sent. Check the administrator mailbox for the OTP and setup link.';
        bootstrapStatus.setAttribute('data-level', 'ok');
        bootstrapTokenInput.value = '';
      }).catch(function (err) {
        bootstrapStatus.textContent = err.message || 'The administrator invite could not be sent.';
        bootstrapStatus.setAttribute('data-level', 'error');
        bootstrapTokenInput.value = '';
      }).then(function () {
        bootstrapSubmit.disabled = false;
      });
    });

    listEl = el('div', 'ileedbg-list');
    listEl.addEventListener('scroll', function () {
      pinned = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 40;
    });

    var foot = el('div', 'ileedbg-foot');
    statEl = el('span', null, '');
    foot.appendChild(statEl);
    foot.appendChild(el('span', null, 'Ctrl+Shift+D toggles \u00b7 secrets and contact details are redacted'));

    panel.appendChild(head);
    panel.appendChild(bootstrapTool);
    panel.appendChild(listEl);
    panel.appendChild(foot);
    root.appendChild(launcher);
    root.appendChild(panel);
    root.__panel = panel;
    doc.body.appendChild(root);

    writing = false;
    redraw();
    updateBadge();
  }

  function matches(e) {
    if (filter !== 'all') {
      if (filter === 'error') { if (e.kind !== 'error' && e.level !== 'error') return false; }
      else if (e.kind !== filter) return false;
    }
    if (search) {
      var hay = (e.label + ' ' + e.detail).toLowerCase();
      if (hay.indexOf(search) === -1) return false;
    }
    return true;
  }

  function rowFor(e) {
    var row = el('div', 'ileedbg-row');
    row.setAttribute('data-level', e.level);
    row.setAttribute('data-id', String(e.id));
    row.appendChild(el('span', 'ileedbg-t', '+' + (e.t / 1000).toFixed(2) + 's'));
    var k = el('span', 'ileedbg-k', e.kind === 'activity' ? 'act' : e.kind);
    k.setAttribute('data-k', e.kind);
    row.appendChild(k);
    row.appendChild(el('span', 'ileedbg-msg', e.label));
    var c = el('button', 'ileedbg-copy1', 'copy');
    c.type = 'button';
    c.addEventListener('click', function (ev) {
      ev.stopPropagation();
      toClipboard(formatEntry(e), c, 'copy');
    });
    row.appendChild(c);
    if (e.detail) {
      row.appendChild(el('pre', 'ileedbg-det', e.detail));
      row.addEventListener('click', function () {
        row.setAttribute('data-open', row.getAttribute('data-open') === '1' ? '0' : '1');
      });
    }
    return row;
  }

  function render(entry) {
    if (!root || !openState || !entry) return;
    if (!matches(entry)) { updateBadge(); return; }
    writing = true;
    var empty = listEl.querySelector('.ileedbg-empty');
    if (empty) empty.remove();
    var row = rowFor(entry);
    lastRendered[entry.id] = row;
    listEl.appendChild(row);
    if (pinned) listEl.scrollTop = listEl.scrollHeight;
    writing = false;
    updateBadge();
  }

  // A fetch entry is created the moment the response lands, then filled in
  // once the cloned body has been read. This swaps the detail in place.
  function updateRow(entry) {
    var row = lastRendered[entry.id];
    if (!row) return;
    writing = true;
    var pre = row.querySelector('.ileedbg-det');
    if (!pre) {
      pre = el('pre', 'ileedbg-det', entry.detail);
      row.appendChild(pre);
      row.addEventListener('click', function () {
        row.setAttribute('data-open', row.getAttribute('data-open') === '1' ? '0' : '1');
      });
    } else {
      pre.textContent = entry.detail;
    }
    writing = false;
  }

  function redraw() {
    if (!root) return;
    writing = true;
    lastRendered = {};
    listEl.textContent = '';
    var shown = entries.filter(matches);
    if (!shown.length) {
      listEl.appendChild(el('div', 'ileedbg-empty', entries.length ? 'nothing matches this filter' : 'no activity captured yet'));
    } else {
      shown.forEach(function (e) {
        var row = rowFor(e);
        lastRendered[e.id] = row;
        listEl.appendChild(row);
      });
      listEl.scrollTop = listEl.scrollHeight;
    }
    writing = false;
    updateStat(shown.length);
  }

  function updateStat(shown) {
    if (!statEl) return;
    statEl.textContent = shown + ' shown \u00b7 ' + entries.length + ' held' +
      (counts.error ? ' \u00b7 ' + counts.error + ' error' + (counts.error > 1 ? 's' : '') : '') +
      ' \u00b7 buffer ' + MAX_ENTRIES;
  }

  function updateBadge() {
    if (!badgeEl) return;
    var errs = entries.filter(function (e) { return e.kind === 'error' || e.level === 'error'; }).length;
    badgeEl.textContent = errs ? String(errs) : String(entries.length);
    badgeEl.setAttribute('data-err', errs ? '1' : '0');
    updateStat(entries.filter(matches).length);
  }

  function toggle(next) {
    build();
    openState = next === undefined ? !openState : next;
    root.__panel.style.display = openState ? 'flex' : 'none';
    launcher.style.display = openState ? 'none' : 'flex';
    if (openState) { pinned = true; redraw(); }
  }

  /* ------------------------------------------------------------------ *
   * copy
   * ------------------------------------------------------------------ */

  function formatEntry(e) {
    var line = '+' + (e.t / 1000).toFixed(3) + 's  ' + pad(e.kind.toUpperCase(), 8) + ' ' + e.label;
    if (e.detail) line += '\n' + e.detail.replace(/^/gm, '    ');
    return line;
  }

  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

  function report(all) {
    // The panel can be filtered for diagnosis, but a copied report must carry
    // the whole timeline: the click that preceded the failure, the request,
    // the response, and the error may not share one filter.
    var shown = all ? entries.slice() : entries.filter(matches);
    var view = all ? 'all entries' : filter + (search ? ', search: "' + search + '"' : '');
    var head = [
      'ilee debug log',
      'url       ' + safeUrl(location.href),
      'when      ' + new Date().toISOString(),
      'agent     ' + navigator.userAgent,
      'viewport  ' + window.innerWidth + 'x' + window.innerHeight + ' @' + (window.devicePixelRatio || 1) + 'x',
      'entries   ' + shown.length + ' of ' + entries.length + ' held (copy: ' + view + ')',
      'errors    ' + counts.error,
      'note      secrets and contact details are redacted at capture',
      new Array(62).join('-')
    ].join('\n');
    return head + '\n' + shown.map(formatEntry).join('\n') + '\n';
  }

  // navigator.clipboard is undefined on http: origins, so the textarea path
  // is not legacy cruft - it is the one that works over plain HTTP.
  function toClipboard(text, btn, restore) {
    function done(ok) {
      if (!btn) return;
      btn.textContent = ok ? 'copied' : 'press \u2318C';
      btn.setAttribute('data-ok', ok ? '1' : '0');
      setTimeout(function () { btn.textContent = restore; btn.setAttribute('data-ok', '0'); }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); })['catch'](function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      try {
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        doc.body.appendChild(ta);
        ta.select();
        var ok = doc.execCommand('copy');
        doc.body.removeChild(ta);
        done(ok);
      } catch (e) { done(false); }
    }
  }

  function copyAll(btn) { toClipboard(report(true), btn, 'copy'); }

  /* ------------------------------------------------------------------ *
   * wiring
   * ------------------------------------------------------------------ */

  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      enabled = true;
      try { sessionStorage.setItem(STORE_KEY, '1'); } catch (err) {}
      toggle();
    }
    if (e.key === 'Escape' && openState) toggle(false);
  });

  function boot() {
    push('system', 'ok', 'debug overlay ready', {
      page: location.pathname,
      origin: location.origin,
      secureContext: !!window.isSecureContext,
      toggle: 'Ctrl/Cmd+Shift+D, or ?debug=1',
      capturing: ['console', 'uncaught errors', 'rejections', 'CSP violations', 'fetch', 'XHR', 'clicks', 'submits']
    });
    if (enabled) { build(); }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* ------------------------------------------------------------------ *
   * public handle - for the console, and for app code that wants to
   * record something the wrappers cannot see.
   * ------------------------------------------------------------------ */

  window.ileeDebug = {
    log: function (label, detail) { return push('console', 'log', label, detail ? redact(detail) : null); },
    error: function (label, detail) { return push('error', 'error', label, detail ? redact(detail) : null); },
    open: function () { enabled = true; toggle(true); },
    close: function () { toggle(false); },
    copy: function () { return report(true); },
    entries: function () { return entries.slice(); },
    clear: function () { entries.length = 0; counts = { all: 0, error: 0, network: 0, console: 0, activity: 0 }; redraw(); }
  };
})();
