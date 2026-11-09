import { escapeHTML, uniqueId } from './utils.js';
import { icon } from './icons.js';

let active = null;
document.addEventListener('pointerdown', event => {
  if (active && !active.root.contains(event.target) && !active.list.contains(event.target)) active.close();
});

/** Styled, keyboard-operable select. The list escapes scroll clipping without moving the page. */
export function mountSelect(root, config) {
  const id = config.id || uniqueId('select');
  const listId = `${id}-list`;
  let options = config.options || [];
  let value = config.value || '';
  let highlighted = -1;
  let opened = false;
  let typeahead = '';
  let lastKeyTime = 0;
  root.classList.add('custom-select');
  root.innerHTML = `<input type="hidden" name="${escapeHTML(config.name || '')}"><button type="button" id="${id}" class="select-trigger" role="combobox" aria-label="${escapeHTML(config.label || 'Choose an option')}" aria-haspopup="listbox" aria-controls="${listId}" aria-expanded="false"><span></span>${icon('chevron-down', 16)}</button><ul id="${listId}" class="select-options" popover="manual" role="listbox" aria-label="${escapeHTML(config.label || 'Options')}" hidden></ul>`;
  const button = root.querySelector('button');
  const input = root.querySelector('input');
  const label = button.querySelector('span');
  const list = root.querySelector('ul');
  const nativePopover = typeof list.showPopover === 'function';
  if (!nativePopover) list.removeAttribute('popover');
  // Older dialog-capable browsers use a local portal instead of an unstyled native select.
  const fallbackHost = root.closest('dialog') || document.body;
  const minWidth = Number.parseFloat(getComputedStyle(list).getPropertyValue('--select-min-width')) || 0;
  const alignEnd = getComputedStyle(list).getPropertyValue('--select-align').trim() === 'end';

  function bounds() {
    const viewport = window.visualViewport;
    const left = (viewport?.offsetLeft || 0) + 8;
    const top = (viewport?.offsetTop || 0) + 8;
    return { left, top, right: left + (viewport?.width || innerWidth) - 16, bottom: top + (viewport?.height || innerHeight) - 16 };
  }
  function positionList(event) {
    if (!opened || event?.target === list) return;
    const rect = button.getBoundingClientRect();
    const clip = bounds();
    // Keep the menu beside a visible trigger, including inside the scrolling dialog body.
    for (let parent = root.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowY)) {
        const box = parent.getBoundingClientRect();
        clip.top = Math.max(clip.top, box.top); clip.bottom = Math.min(clip.bottom, box.bottom);
      }
    }
    if (rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right) { close(); return; }
    const width = Math.min(Math.max(rect.width, minWidth), clip.right - clip.left);
    list.style.width = `${width}px`;
    const below = Math.max(0, clip.bottom - rect.bottom - 5);
    const above = Math.max(0, rect.top - clip.top - 5);
    const desired = Math.min(240, list.scrollHeight + 2);
    const upward = below < desired && above > below;
    list.style.maxHeight = `${Math.min(240, upward ? above : below)}px`;
    const height = list.getBoundingClientRect().height;
    const x = Math.min(Math.max(alignEnd ? rect.right - width : rect.left, clip.left), clip.right - width);
    list.style.left = `${x}px`;
    list.style.top = `${upward ? rect.top - 5 - height : rect.bottom + 5}px`;
    list.dataset.placement = upward ? 'above' : 'below';
  }
  function revealHighlight() {
    if (!opened || highlighted < 0) return;
    const option = list.children[highlighted]; if (!option) return;
    const top = option.offsetTop; const bottom = top + option.offsetHeight;
    if (top < list.scrollTop + 5) list.scrollTop = Math.max(0, top - 5);
    else if (bottom > list.scrollTop + list.clientHeight - 5) list.scrollTop = bottom - list.clientHeight + 5;
  }
  function render() {
    input.value = value;
    label.textContent = options.find(option => option.value === value)?.label || config.placeholder || 'Choose an option';
    button.classList.toggle('is-placeholder', !value);
    list.innerHTML = options.map((option, index) => `<li id="${listId}-${index}" role="option" data-option="${index}" aria-selected="${option.value === value}" class="${index === highlighted ? 'is-highlighted' : ''}">${escapeHTML(option.label)}${option.value === value ? icon('check', 15) : ''}</li>`).join('');
    if (opened && highlighted >= 0) {
      button.setAttribute('aria-activedescendant', `${listId}-${highlighted}`);
      positionList(); revealHighlight();
    } else button.removeAttribute('aria-activedescendant');
  }
  function listen(enabled) {
    const method = enabled ? 'addEventListener' : 'removeEventListener';
    document[method]('scroll', positionList, true);
    window[method]('resize', positionList);
    window.visualViewport?.[method]('resize', positionList);
    window.visualViewport?.[method]('scroll', positionList);
  }
  function close() {
    if (nativePopover && list.matches(':popover-open')) list.hidePopover();
    opened = false; list.hidden = true;
    if (!nativePopover && list.parentElement !== root) root.append(list);
    button.setAttribute('aria-expanded', 'false'); button.removeAttribute('aria-activedescendant');
    root.classList.remove('is-open'); listen(false);
    if (active?.root === root) active = null;
  }
  function open() {
    if (button.disabled || !options.length) return;
    if (active?.root !== root) active?.close();
    active = { root, list, close }; opened = true; list.hidden = false;
    if (nativePopover) list.showPopover(); else fallbackHost.append(list);
    button.setAttribute('aria-expanded', 'true'); root.classList.add('is-open');
    highlighted = Math.max(0, options.findIndex(option => option.value === value));
    render(); listen(true);
  }
  function choose(index) {
    const option = options[index]; if (!option) return;
    value = option.value; close(); render(); button.focus({ preventScroll: true }); config.onChange?.(value);
  }
  const onTrigger = event => { if (event.target.closest('.select-trigger')) opened ? close() : open(); };
  const onOption = event => { const option = event.target.closest('[data-option]'); if (option) choose(Number(option.dataset.option)); };
  function onKey(event) {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!opened) open();
      else if (event.key === 'ArrowDown') highlighted = Math.min(options.length - 1, highlighted + 1);
      else if (event.key === 'ArrowUp') highlighted = Math.max(0, highlighted - 1);
      if (event.key === 'Home') highlighted = 0;
      if (event.key === 'End') highlighted = options.length - 1;
      render();
    } else if ((event.key === 'Enter' || event.key === ' ') && opened) { event.preventDefault(); choose(highlighted); }
    else if (event.key === 'Escape' && opened) { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === 'Tab') close();
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== ' ') {
      const now = Date.now(); typeahead = now - lastKeyTime < 600 ? typeahead + event.key : event.key; lastKeyTime = now;
      const index = options.findIndex(option => option.label.toLowerCase().startsWith(typeahead.toLowerCase()));
      if (index >= 0) { event.preventDefault(); if (!opened) open(); highlighted = index; render(); }
    }
  }
  root.addEventListener('click', onTrigger); list.addEventListener('click', onOption); button.addEventListener('keydown', onKey);
  render();
  return {
    get value() { return value; }, button,
    setOptions(next, nextValue = '') { options = next; value = nextValue; highlighted = -1; close(); render(); },
    setValue(next) { value = next; render(); },
    destroy() { close(); root.removeEventListener('click', onTrigger); list.removeEventListener('click', onOption); button.removeEventListener('keydown', onKey); },
  };
}
