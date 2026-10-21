/* Desk UI layer: menubar open/close, sidebar collapse, magnetic buttons
   and the magnetic evidence dropzone. Adds behaviour to existing elements
   only; queue logic stays in ops.js and form logic in the page scripts. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true;

  /* ── menubar ── */
  var sheetMq = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
  function lockSheetScroll() {
    if (sheetMq && sheetMq.matches) document.body.style.overflow = 'hidden';
  }
  function unlockSheetScroll() {
    document.body.style.overflow = '';
  }
  function closeAllMenus(except) {
    document.querySelectorAll('.menubar__slot[data-open="true"]').forEach(function (slot) {
      if (slot !== except) {
        slot.setAttribute('data-open', 'false');
        var t = slot.querySelector('.menubar__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
    if (!except) unlockSheetScroll();
  }
  document.addEventListener('click', function (ev) {
    var trigger = ev.target.closest ? ev.target.closest('.menubar__trigger') : null;
    if (trigger) {
      var slot = trigger.closest('.menubar__slot');
      if (!slot) return;
      var open = slot.getAttribute('data-open') === 'true';
      closeAllMenus(slot);
      slot.setAttribute('data-open', String(!open));
      trigger.setAttribute('aria-expanded', String(!open));
      if (!open) lockSheetScroll();
      else unlockSheetScroll();
      ev.preventDefault();
      return;
    }
    /* controls marked keep-open (e.g. the theme switcher) never dismiss the sheet */
    var keep = ev.target.closest ? ev.target.closest('[data-keep-open]') : null;
    if (keep) return;
    var inside = ev.target.closest ? ev.target.closest('.menubar__slot') : null;
    if (!inside) closeAllMenus(null);
    /* choosing an item closes its menu */
    var item = ev.target.closest ? ev.target.closest('.menubar__menu button, .menubar__menu a') : null;
    if (item) closeAllMenus(null);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeAllMenus(null);
  });

  /* ── dark-sheet theme switcher (visual preference, desk stays light) ── */
  (function initThemeSeg() {
    var seg = document.querySelector('.dark-theme-seg');
    if (!seg) return;
    var choices = Array.prototype.slice.call(seg.querySelectorAll('[data-theme-choice]'));
    if (!choices.length) return;
    function apply(value, persist) {
      choices.forEach(function (button) {
        var on = button.getAttribute('data-theme-choice') === value;
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (persist) {
        try { window.localStorage.setItem('desk-theme-choice', value); } catch (e) { /* private mode */ }
      }
    }
    var stored = null;
    try { stored = window.localStorage.getItem('desk-theme-choice'); } catch (e) { /* private mode */ }
    if (stored) apply(stored, false);
    seg.addEventListener('click', function (ev) {
      var button = ev.target.closest ? ev.target.closest('[data-theme-choice]') : null;
      if (!button) return;
      apply(button.getAttribute('data-theme-choice'), true);
    });
  }());

  /* ── sidebar collapse ── */
  var frame = document.getElementById('app');
  var toggle = document.getElementById('sidebar-toggle');
  var toggleInline = document.getElementById('sidebar-toggle-inline');

  function toggleSidebarCollapse() {
    if (!frame) return;
    var next = frame.getAttribute('data-collapsed') !== 'true';
    frame.setAttribute('data-collapsed', String(next));
    if (toggle) toggle.setAttribute('aria-expanded', String(!next));
    if (toggleInline) toggleInline.setAttribute('aria-expanded', String(!next));
    try { window.localStorage.setItem('desk-collapsed', String(next)); } catch (e) { /* ignore */ }
  }

  if (frame) {
    var stored = null;
    try { stored = window.localStorage.getItem('desk-collapsed'); } catch (e) { /* private mode */ }
    if (stored === 'true') {
      frame.setAttribute('data-collapsed', 'true');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (toggleInline) toggleInline.setAttribute('aria-expanded', 'false');
    }
    if (toggle) toggle.addEventListener('click', toggleSidebarCollapse);
    if (toggleInline) toggleInline.addEventListener('click', toggleSidebarCollapse);
  }

  // Global Ctrl+K / Cmd+K keyboard shortcut to focus search
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var searchInput = document.getElementById('desk-nav-search');
      if (frame && frame.getAttribute('data-collapsed') === 'true') {
        toggleSidebarCollapse();
      }
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  var searchBtn = document.getElementById('sidebar-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      if (frame && frame.getAttribute('data-collapsed') === 'true') {
        toggleSidebarCollapse();
      }
      var searchInput = document.getElementById('desk-nav-search');
      if (searchInput) searchInput.focus();
    });
  }

  /* ── magnetic buttons: the label leans toward the pointer ── */
  function magnetise(btn) {
    if (btn.querySelector(':scope > .btn-label')) return;
    var label = document.createElement('span');
    label.className = 'btn-label';
    while (btn.firstChild) label.appendChild(btn.firstChild);
    btn.appendChild(label);
    if (reduced || !finePointer) return;
    btn.addEventListener('pointermove', function (ev) {
      var r = btn.getBoundingClientRect();
      var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
      label.style.setProperty('--mx', (dx * 3).toFixed(1) + 'px');
      label.style.setProperty('--my', (dy * 2).toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', function () {
      label.style.setProperty('--mx', '0px');
      label.style.setProperty('--my', '0px');
    });
  }
  function magnetiseAll(root) {
    (root || document).querySelectorAll('#app .btn, .access-button').forEach(magnetise);
  }
  magnetiseAll();

  /* ── magnetic dropzone: drag states + tilt toward the pointer ── */
  document.addEventListener('dragover', function (ev) {
    var zone = ev.target.closest ? ev.target.closest('label.dz') : null;
    if (zone) { zone.classList.add('is-drag'); ev.preventDefault(); }
  });
  document.addEventListener('dragleave', function (ev) {
    var zone = ev.target.closest ? ev.target.closest('label.dz') : null;
    if (zone && !zone.contains(ev.relatedTarget)) zone.classList.remove('is-drag');
  });
  document.addEventListener('drop', function (ev) {
    var zone = ev.target.closest ? ev.target.closest('label.dz') : null;
    if (zone) zone.classList.remove('is-drag');
  });
  if (!reduced && finePointer) {
    document.addEventListener('pointermove', function (ev) {
      var zone = ev.target.closest ? ev.target.closest('label.dz') : null;
      document.querySelectorAll('label.dz.tilt').forEach(function (z) { if (z !== zone) z.classList.remove('tilt'); });
      if (!zone) { document.querySelectorAll('label.dz').forEach(function (z) { z.style.setProperty('--rx', '0deg'); z.style.setProperty('--ry', '0deg'); }); return; }
      var r = zone.getBoundingClientRect();
      var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
      zone.style.setProperty('--ry', (dx * 3).toFixed(1) + 'deg');
      zone.style.setProperty('--rx', (dy * -3).toFixed(1) + 'deg');
    }, true);
  }

  /* panels render forms late: magnetise + dress new buttons and zones */
  var observer = new MutationObserver(function () {
    magnetiseAll();
    document.querySelectorAll('#app label.form-field--wide:has(input[name="evidence"])').forEach(function (lab) {
      if (lab.classList.contains('dz')) return;
      lab.classList.add('dz');
      var input = lab.querySelector('input[name="evidence"]');
      var small = lab.querySelector('small');
      var icon = document.createElement('span');
      icon.className = 'dz-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '↑';
      var stack = document.createElement('span');
      stack.className = 'dz-stack';
      var def = document.createElement('span');
      def.className = 'dz-default';
      def.textContent = 'Drop evidence photos here, or choose files';
      var drag = document.createElement('span');
      drag.className = 'dz-drag';
      drag.textContent = 'Release to attach';
      stack.appendChild(def);
      stack.appendChild(drag);
      lab.insertBefore(icon, input);
      lab.insertBefore(stack, input);
      if (small) lab.appendChild(small);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}());

/* appended: mobile drawer for the sidebar */
(function () {
  'use strict';
  var frame = document.getElementById('app');
  var burger = document.getElementById('desk-burger');
  var scrim = document.getElementById('desk-scrim');
  var closeButton = document.getElementById('sidebar-close');
  if (!frame || !burger) return;
  var mq = window.matchMedia('(max-width: 900px)');
  function setDrawer(open) {
    frame.setAttribute('data-drawer', open ? 'open' : 'closed');
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function () {
    setDrawer(frame.getAttribute('data-drawer') !== 'open');
  });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  if (closeButton) closeButton.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') setDrawer(false);
  });
  document.addEventListener('click', function (ev) {
    if (mq.matches && ev.target.closest && ev.target.closest('.desk-sidebar .tab')) setDrawer(false);
  });
  var onChange = function () { if (!mq.matches) setDrawer(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
}());

/* Queue shortcuts, navigation search and the sidebar account launcher. */
(function () {
  'use strict';
  var frame = document.getElementById('app');
  var search = document.getElementById('desk-nav-search');
  var accountButton = document.getElementById('sidebar-account');
  var accountTrigger = document.querySelector('.menubar__trigger');

  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      document.querySelectorAll('.desk-sidebar .tab[data-tab]').forEach(function (tab) {
        tab.style.display = !query || tab.textContent.toLowerCase().indexOf(query) > -1 ? '' : 'none';
      });
    });
  }

  document.addEventListener('click', function (event) {
    var shortcut = event.target.closest ? event.target.closest('[data-open-queue]') : null;
    if (!shortcut) return;
    var tab = document.querySelector('.desk-sidebar .tab[data-tab="' + shortcut.getAttribute('data-open-queue') + '"]');
    if (!tab) return;
    tab.click();
    var workspace = document.querySelector('.desk-workspace');
    if (workspace) workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (accountButton && accountTrigger) {
    accountButton.addEventListener('click', function (event) {
      event.stopPropagation();
      if (frame) frame.setAttribute('data-drawer', 'closed');
      accountTrigger.click();
    });
  }
}());

/* Reference-derived account, queue-owner and mobile-dock interactions. */
(function () {
  'use strict';

  function copyText(value) {
    if (!value) return Promise.reject(new Error('No email available'));
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
    return new Promise(function (resolve, reject) {
      var input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
      } catch (error) { reject(error); }
      input.remove();
    });
  }

  function acknowledge(button, label) {
    var before = button.innerHTML;
    button.textContent = label;
    window.setTimeout(function () { button.innerHTML = before; }, 1600);
  }

  var accountRefresh = document.getElementById('account-refresh');
  var refresh = document.getElementById('refresh');
  if (accountRefresh && refresh) {
    accountRefresh.addEventListener('click', function () {
      refresh.click();
      acknowledge(accountRefresh, 'Desk refreshed');
    });
  }

  var copyEmail = document.getElementById('account-copy-email');
  if (copyEmail) {
    copyEmail.addEventListener('click', function () {
      copyText(copyEmail.getAttribute('data-copy-email')).then(function () {
        acknowledge(copyEmail, 'Email copied');
      }).catch(function () {
        acknowledge(copyEmail, 'Email unavailable');
      });
    });
  }

  function showDashboard() {
    var main = document.getElementById('main');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var accountDashboard = document.getElementById('account-dashboard');
  if (accountDashboard) accountDashboard.addEventListener('click', showDashboard);

  document.addEventListener('click', function (event) {
    var ownerAction = event.target.closest ? event.target.closest('[data-owner-action]') : null;
    if (ownerAction) {
      var ownerPanel = ownerAction.closest('.panel');
      if (!ownerPanel) return;
      if (ownerAction.getAttribute('data-owner-action') === 'tools') {
        var tool = ownerPanel.querySelector('.action-card');
        if (tool) {
          if (!tool.open) tool.querySelector('summary').click();
          tool.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        var queue = ownerPanel.querySelector('.region-heading');
        if (queue) queue.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    var staffFocus = event.target.closest ? event.target.closest('[data-staff-focus]') : null;
    if (staffFocus) {
      var staffPanel = staffFocus.closest('.panel');
      var accessQueue = staffPanel ? staffPanel.querySelector('.region-heading') : null;
      if (accessQueue) accessQueue.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

}());
