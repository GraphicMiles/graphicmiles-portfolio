// Accessible custom select enhancement.
//
// Native select menus are rendered by the operating system on mobile. That is
// useful for reachability, but it also produces a platform radio-list popup
// that does not belong to ilee's visual language. The native select remains in
// the form as the value source; this button/listbox is the visual control.
(function () {
  'use strict';

  var OPEN = 'is-open';
  var counter = 0;

  function closeAll(except) {
    document.querySelectorAll('.custom-select.' + OPEN).forEach(function (root) {
      if (root === except) return;
      close(root);
    });
  }

  function close(root) {
    var trigger = root.querySelector('.custom-select__trigger');
    var menu = root.querySelector('.custom-select__menu');
    root.classList.remove(OPEN);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
  }

  function labelFor(option) {
    return option ? option.textContent.trim() : '';
  }

  function sync(root) {
    var select = root.querySelector('select');
    var trigger = root.querySelector('.custom-select__trigger');
    var options = root.querySelectorAll('[role="option"]');
    if (!select || !trigger) return;
    var selected = select.options[select.selectedIndex];
    trigger.querySelector('.custom-select__value').textContent = labelFor(selected) || 'Choose an option';
    options.forEach(function (option) {
      var on = option.getAttribute('data-value') === select.value;
      option.setAttribute('aria-selected', on ? 'true' : 'false');
      option.classList.toggle('is-selected', on);
    });
  }

  /** Create the listbox items for one select. Shared by enhance() and rebuild(). */
  function buildItems(root, select, menu) {
    menu.innerHTML = '';
    Array.prototype.forEach.call(select.options, function (option) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'custom-select__option';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', option.value);
      item.setAttribute('aria-selected', option.selected ? 'true' : 'false');
      item.textContent = labelFor(option);
      item.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        choose(root, option.value);
      });
      menu.appendChild(item);
    });
  }

  /**
   * Rebuild a listbox whose <option>s changed after enhancement.
   *
   * enhance() marks the select and builds the listbox once. The MutationObserver
   * below only looks for NEW selects, so a page that repopulates an existing one
   * - js/homes.js filling the area and home-type filters from the live API -
   * leaves the visible listbox showing the options from parse time while the
   * native select underneath is display:none. The filter then has options nobody
   * can reach. This is the fix, and it is the reason a rebuild is exposed at all.
   */
  function rebuild(root) {
    var select = root.querySelector('select');
    var menu = root.querySelector('.custom-select__menu');
    if (!select || !menu) return;
    var wasOpen = root.classList.contains(OPEN);
    if (wasOpen) close(root);
    buildItems(root, select, menu);
    sync(root);
    if (wasOpen) open(root);
  }

  /** Rebuild every enhanced select inside a scope. */
  function refresh(scope) {
    var root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll('.custom-select[data-custom-select-root="true"]').forEach(rebuild);
  }

  function choose(root, value) {
    var select = root.querySelector('select');
    if (!select) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync(root);
    close(root);
  }

  function open(root) {
    closeAll(root);
    var trigger = root.querySelector('.custom-select__trigger');
    var menu = root.querySelector('.custom-select__menu');
    if (!trigger || !menu) return;
    root.classList.add(OPEN);
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    var current = menu.querySelector('[aria-selected="true"]');
    if (current) current.focus();
  }

  function enhance(select) {
    if (!select || select.dataset.customSelect === 'true') return;
    if (select.multiple || select.disabled) return;
    select.dataset.customSelect = 'true';

    var root = document.createElement('div');
    root.className = 'custom-select';
    root.dataset.customSelectRoot = 'true';
    select.parentNode.insertBefore(root, select);
    root.appendChild(select);
    select.classList.add('custom-select__native');

    var id = select.id || ('custom-select-' + (++counter));
    var menuId = id + '-menu';
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', menuId);
    trigger.innerHTML = '<span class="custom-select__value"></span><span class="custom-select__chevron" aria-hidden="true"></span>';

    var menu = document.createElement('div');
    menu.className = 'custom-select__menu';
    menu.id = menuId;
    menu.hidden = true;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', select.getAttribute('aria-label') || select.name || 'Options');

    buildItems(root, select, menu);

    root.insertBefore(trigger, select);
    root.appendChild(menu);
    sync(root);

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (root.classList.contains(OPEN)) close(root); else open(root);
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(root);
      }
    });
    menu.addEventListener('keydown', function (event) {
      var items = Array.prototype.slice.call(menu.querySelectorAll('[role="option"]'));
      var index = items.indexOf(document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault(); close(root); trigger.focus();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        // Guarded: with no items, items[-1].focus() threw and left the listbox
        // open with focus nowhere, so the next Tab started from the top of page.
        var next = items[Math.min(index + 1, items.length - 1)];
        if (next) next.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        var prev = items[Math.max(index - 1, 0)];
        if (prev) prev.focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); if (items[index]) choose(root, items[index].dataset.value);
      }
    });

    var form = select.form;
    if (form) form.addEventListener('reset', function () { window.setTimeout(function () { sync(root); }, 0); });
    select.addEventListener('change', function () { sync(root); });
  }

  function scan(scope) {
    var root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll('select:not([data-custom-select="true"])').forEach(enhance);
  }

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.custom-select')) closeAll();
  });

  // Public seam. A page that fills a select from the API has to call this, or
  // the visible listbox keeps the options it was built with at parse time.
  window.ileeCustomSelect = { refresh: refresh, rebuild: rebuild, scan: scan };

  if (document.body) scan(document);
  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) scan(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
