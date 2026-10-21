/* Approved Ops Desk presentation. No API writes or sample records belong here.
 * ops.js owns sessions, API requests and validation; this layer renders their
 * results and moves the existing forms into an accessible native dialog.
 */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var dialog = document.getElementById('desk-dialog');
  var content = document.getElementById('dialog-content');
  var store = {}, states = {}, staff = {}, moved = null, returnFocus = null;
  var mq = window.matchMedia('(max-width: 700px)');
  var labels = { overview: 'Overview', leads: 'Leads', listings: 'Listings', tasks: 'Verification', apps: 'Applications', viewings: 'Viewings', rights: 'Rights requests', staff: 'Staff access' };
  var icons = { overview: 'house', leads: 'users', listings: 'buildings', tasks: 'shield-check', apps: 'file-text', viewings: 'calendar-check', rights: 'lock-key', staff: 'gear' };
  var words = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', closed: 'Closed', draft: 'Draft', submitted: 'Submitted', identity_verified: 'ID verified', inspected: 'Inspected', title_verified: 'Title verified', live: 'Live', reserved: 'Reserved', let: 'Let', archived: 'Archived', suspended: 'Suspended', identity: 'Identity', inspection: 'Inspection', title: 'Title', pending: 'Pending', overdue: 'Overdue', pass: 'Passed', fail: 'Failed', underwriting: 'Under review', started: 'Started', docs_submitted: 'Documents received', approved: 'Approved', conditional: 'Conditional', declined: 'Declined', withdrawn: 'Withdrawn', scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No show', rescheduled: 'Rescheduled', received: 'Received', in_progress: 'In progress', rejected: 'Rejected', erasure: 'Erasure request', access: 'Access request', correction: 'Correction request', withdrawal: 'Withdraw consent', account_created: 'Active', ops: 'Operations', inspector: 'Inspector', analyst: 'Analyst', finance: 'Finance', admin: 'Administrator', monthly: 'Monthly', quarterly: 'Quarterly', biannual: 'Biannual', annual: 'Annual' };
  var config = {
    leads: { section: 'Intake', description: 'Qualify new interest and keep the next conversation moving.', columns: ['Person', 'Interest', 'Status'], primary: null, guidance: 'New enquiries are not verified applications. Confirm requirements and contact details before moving forward.' },
    listings: { section: 'Supply', description: 'From first submission to verified, published supply.', columns: ['Property', 'Price', 'Status'], primary: 'create-listing', action: 'Add a listing', guidance: 'Required verification checks must pass before publication. Preparing checks never passes a gate or publishes a home.' },
    tasks: { section: 'Property checks', description: 'Prioritise overdue checks, then clear the next verification gate.', columns: ['Check', 'Assigned to', 'Status'], primary: 'create-task', action: 'Add a check', guidance: 'A passing check requires evidence. Record the outcome; elapsed time alone never completes a check.' },
    apps: { section: 'Tenancy work', description: 'Keep vetting, identity outcomes and decisions together.', columns: ['Applicant', 'Schedule', 'Status'], primary: 'create-application', action: 'Record application', guidance: 'Review vetting inputs and the identity outcome before deciding. Store a reason and next step, not sensitive identity numbers.' },
    viewings: { section: 'Appointments', description: 'Coordinate visits and record what happened on the ground.', columns: ['Visitor', 'Appointment', 'Status'], primary: 'create-viewing', action: 'Arrange viewing', guidance: 'Release a staff-only address only for an agreed viewing. Record the release alongside the viewing outcome.' },
    rights: { section: 'Privacy desk', description: 'Handle access, correction and erasure with a clear record.', columns: ['Request', 'Received', 'Status'], primary: 'resolve-rights', action: 'Resolve request', guidance: 'Confirm the matching subject record before resolving a request. Erasure is a deliberate action, not a routine status change.' },
    staff: { section: 'Administration', description: 'Review staff requests and keep permissions intentional.', columns: ['Person', 'Requested role', 'Status'], primary: 'invite-admin', action: 'Invite administrator', guidance: 'Approve only the permissions a person needs. Administrator invitations require email verification and password setup.' }
  };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(n) { return '<i class="ph ph-' + n + '" aria-hidden="true"></i>'; }
  function word(s) { return words[s] || String(s || 'Not recorded').replace(/_/g, ' '); }
  function date(v) { var d = new Date(v); return v && !isNaN(d.getTime()) ? d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'Not recorded'; }
  function initials(v) { return String(v || 'Staff').trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase(); }
  function money(kobo) { return kobo == null ? 'Not recorded' : '₦' + Math.round(Number(kobo) / 100).toLocaleString('en-NG'); }
  function status(kind, r) { return kind === 'tasks' ? (r.result || (r.overdue ? 'overdue' : 'pending')) : kind === 'viewings' ? (r.outcome || 'scheduled') : (r.status || r.state || 'pending'); }
  function pill(s) { var cls = ['live', 'approved', 'pass', 'qualified', 'completed', 'account_created'].includes(s) ? 'success' : ['overdue', 'fail', 'declined', 'rejected', 'suspended', 'no_show'].includes(s) ? 'exception' : 'neutral'; return '<span class="pill ' + cls + '"><span class="dot"></span>' + esc(word(s)) + '</span>'; }
  function metric(label, value, note) { return '<article class="metric"><div class="metric-top">' + esc(label) + '</div><div class="metric-value">' + esc(value) + '</div><div class="metric-foot">' + esc(note) + '</div></article>'; }
  function reference(id) { return String(id || '').slice(0, 8); }
  function record(kind, r) {
    var fields = {
      leads: [r.name || 'Unnamed enquiry', [r.email, r.phone].filter(Boolean).join(' · ') || 'No contact recorded', r.property_type || word(r.role), r.area || 'Area not recorded'],
      listings: [r.home_type || r.title || 'Property ' + reference(r.id), r.area || 'Listing ' + reference(r.id), money(r.rent_annual_kobo), r.category === 'buy' ? 'Asking price' : 'Annual rent' + (r.accepts_installments ? ' · Schedule accepted' : '')],
      tasks: [word(r.type) + ' check', 'Listing ' + reference(r.listing_id), r.assignee || 'Unassigned', r.sla_due_at ? 'Due ' + date(r.sla_due_at) : 'No due date'],
      apps: [r.tenant_name || 'Unnamed applicant', 'Listing ' + reference(r.listing_id), word(r.schedule), r.reason_code ? word(r.reason_code) : 'Received ' + date(r.created_at)],
      viewings: [r.attendee_name || 'Unnamed visitor', 'Listing ' + reference(r.listing_id), date(r.scheduled_at), r.scheduled_at ? new Date(r.scheduled_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : 'Time not recorded'],
      rights: [word(r.kind), r.contact || 'No contact recorded', date(r.created_at), r.subject_type ? word(r.subject_type) + ' record' : 'Subject not matched'],
      staff: [r.name || 'Unnamed applicant', r.email || 'No email recorded', word(r.requested_role), r.approved_role ? 'Approved: ' + word(r.approved_role) : 'Awaiting assignment']
    };
    return fields[kind];
  }
  function counts(kind, list) {
    var count = function (s) { return list.filter(function (r) { return status(kind, r) === s; }).length; };
    var specific = {
      leads: [['New', count('new'), 'Awaiting first contact'], ['Qualified', count('qualified'), 'Requirements confirmed'], ['Contacted', count('contacted'), 'Conversation started']],
      listings: [['Live homes', count('live'), 'Published inventory'], ['Awaiting checks', count('submitted') + count('identity_verified') + count('inspected'), 'Verification workflow'], ['Let', count('let'), 'Tenancy recorded']],
      tasks: [['Overdue', count('overdue'), 'Prioritise these checks'], ['Pending', count('pending'), 'Within the response window'], ['Passed', count('pass'), 'In the returned queue']],
      apps: [['In review', count('underwriting') + count('submitted') + count('started') + count('docs_submitted'), 'Awaiting a decision'], ['Approved', count('approved'), 'Decision recorded'], ['Declined', count('declined'), 'Reason recorded']],
      viewings: [['Scheduled', count('scheduled'), 'In the selected scope'], ['Completed', count('completed'), 'In the selected scope'], ['No show', count('no_show'), 'In the selected scope']],
      rights: [['Received', count('received'), 'Awaiting action'], ['In progress', count('in_progress'), 'Desk action underway'], ['Completed', count('completed'), 'Resolution recorded']],
      staff: [['Pending', count('pending'), 'Awaiting approval'], ['Active', count('account_created'), 'Account created'], ['Declined', count('declined'), 'Request reviewed']]
    };
    return metric('Total records', list.length, kind === 'viewings' ? 'Selected viewing scope' : 'Returned by the API') + specific[kind].map(function (a) { return metric.apply(null, a); }).join('');
  }
  function queue(kind, list, options) {
    if (!Array.isArray(list)) throw new Error('Invalid queue response');
    if (kind === 'staff' && staff.role !== 'admin') return '';
    if (kind === 'rights') list = list.slice().sort(function (a, b) { var open = function (r) { return ['received', 'in_progress'].includes(r.state) ? 0 : 1; }; return open(a) - open(b) || new Date(a.created_at) - new Date(b.created_at); });
    var c = config[kind];
    store[kind] = { list: list, options: options || {}, loaded: true };
    states[kind] = states[kind] || { status: 'all', query: '', expanded: false };
    overview();
    return '<header class="pageheading"><div><div class="eyebrow">' + c.section + '</div><h1>' + labels[kind] + '</h1><p>' + c.description + '</p></div><div class="heading-actions queue-actions">' + (c.primary ? '<button class="btn primary" type="button" data-open-form="' + c.primary + '">' + icon('plus-circle') + c.action + '</button>' : '<button class="btn primary" type="button" data-queue-filter="new" data-kind="leads">Review new leads</button>') + '<button class="btn mobile-tools" type="button" data-tools="' + kind + '">' + icon('caret-up-down') + 'Actions</button></div></header>' +
      '<div class="metric-grid queue-metrics">' + counts(kind, list) + '</div>' +
      (kind === 'viewings' ? '<div class="scope-bar" role="group" aria-label="Viewing scope">' + ['upcoming', 'open', 'closed', 'all'].map(function (s) { return '<button type="button" class="btn" data-viewings-scope="' + s + '" aria-pressed="' + ((options.scope || 'upcoming') === s) + '">' + (({all: 'All viewings', upcoming: 'Upcoming', open: 'Open', closed: 'Closed'})[s]) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="toolbar"><div class="filter-tabs" role="group" aria-label="Filter by status" data-filters="' + kind + '">' + filters(kind) + '</div><label class="search">' + icon('magnifying-glass') + '<input type="search" data-queue-search="' + kind + '" aria-label="Search ' + labels[kind] + '" placeholder="Search names or references" value="' + esc(states[kind].query) + '"></label></div>' +
      '<div class="layout"><div class="stack"><section class="card queue-records"><div class="cardhead"><h2>' + labels[kind] + '<span class="count" data-result-count="' + kind + '">' + filtered(kind).length + '</span></h2><span class="sub">Current records</span></div><table class="record-table"><thead><tr>' + c.columns.map(function (col) { return '<th scope="col">' + col + '</th>'; }).join('') + '<th scope="col"><span class="sr-only">Open record</span></th></tr></thead><tbody data-rows="' + kind + '">' + rows(kind) + '</tbody></table><div class="tablebottom" data-result-footer="' + kind + '">' + resultFooter(kind) + '</div></section></div>' +
      '<div class="stack"><details class="card guidance-card" ' + (mq.matches ? '' : 'open') + '><summary class="cardhead"><h2>' + icon(icons[kind]) + 'Desk guidance</h2>' + icon('caret-up-down') + '</summary><div class="callout"><strong>Before you proceed</strong><p>' + c.guidance + '</p></div><div class="owner-box"><div class="eyebrow">Signed-in staff member</div><div class="owner"><span class="avatar">' + esc(initials(staff.name)) + '</span><div><p>' + esc(staff.name || 'Staff') + '</p><small>' + esc(word(staff.role)) + '</small></div></div></div></details>' +
      '<section class="card desktop-tools"><div class="cardhead"><h2>Desk actions</h2></div><div class="tool-list">' + (options.cards || '<button class="tool" type="button" data-open-queue="apps">' + icon('file-text') + 'Open applications</button>') + '</div></section></div></div>';
  }
  function filters(kind) {
    var list = store[kind].list, st = states[kind];
    var all = ['all'].concat(Array.from(new Set(list.map(function (r) { return status(kind, r); }))));
    if (st.status !== 'all' && !all.includes(st.status)) all.push(st.status);
    return all.map(function (s) { var n = s === 'all' ? list.length : list.filter(function (r) { return status(kind, r) === s; }).length; return '<button class="filter-tab ' + (st.status === s ? 'active' : '') + '" type="button" data-queue-filter="' + esc(s) + '" data-kind="' + kind + '" aria-pressed="' + (st.status === s) + '">' + (s === 'all' ? 'All records' : esc(word(s))) + '<span>' + n + '</span></button>'; }).join('');
  }
  function filtered(kind) { var st = states[kind]; return store[kind].list.filter(function (r) { return (st.status === 'all' || status(kind, r) === st.status) && (record(kind, r).join(' ') + ' ' + r.id + ' ' + (r.listing_id || '') + ' ' + word(status(kind, r))).toLowerCase().includes(st.query.toLowerCase()); }); }
  function rows(kind) {
    var list = filtered(kind), shown = states[kind].expanded ? list : list.slice(0, 25);
    if (!list.length) return '<tr><td colspan="4"><div class="empty">' + icon('magnifying-glass') + '<h3>' + (store[kind].list.length ? 'No matching records' : 'No records yet') + '</h3><p>' + (store[kind].list.length ? 'Try another name, reference or status.' : 'Records will appear here when they are added to the desk.') + '</p>' + (store[kind].list.length ? '<button class="btn ghost" type="button" data-clear-filter="' + kind + '">Clear filters</button>' : '') + '</div></td></tr>';
    return shown.map(function (r) { var f = record(kind, r); return '<tr><td><div class="record-name"><span class="avatar">' + (['leads', 'apps', 'viewings', 'staff'].includes(kind) ? esc(initials(f[0])) : icon(icons[kind])) + '</span><div><button type="button" data-record-kind="' + kind + '" data-record-id="' + esc(r.id) + '">' + esc(f[0]) + '</button><small>' + esc(f[1]) + '</small></div></div></td><td><span class="mobile-field-label">' + config[kind].columns[1] + '</span>' + esc(f[2]) + '<small>' + esc(f[3]) + '</small></td><td>' + pill(status(kind, r)) + '</td><td><button type="button" class="row-open" data-record-kind="' + kind + '" data-record-id="' + esc(r.id) + '" aria-label="Open ' + esc(f[0]) + '">' + icon('caret-right') + '</button></td></tr>'; }).join('');
  }
  function resultFooter(kind) { var n = filtered(kind).length; return '<span>' + Math.min(states[kind].expanded ? n : 25, n) + ' of ' + n + (n === 1 ? ' record' : ' records') + '</span>' + (n > 25 ? '<button type="button" class="textbtn" data-expand-queue="' + kind + '">' + (states[kind].expanded ? 'Show less' : 'Show all ' + n) + '</button>' : ''); }
  function updateTable(kind) {
    var panel = document.getElementById('panel-' + kind);
    if (!panel.querySelector('[data-rows]') || !store[kind]) return;
    panel.querySelector('[data-rows]').innerHTML = rows(kind);
    panel.querySelector('[data-filters]').innerHTML = filters(kind);
    panel.querySelector('[data-result-count]').textContent = filtered(kind).length;
    panel.querySelector('[data-result-footer]').innerHTML = resultFooter(kind);
  }
  function queueState(kind, state) { store[kind] = { list: [], loaded: false, error: state === 'error' }; overview(); }
  function overview() {
    var target = document.getElementById('overview-content');
    if (!target) return;
    var available = Object.keys(config).filter(function (k) { return k !== 'staff' || staff.role === 'admin'; });
    var tasks = store.tasks && store.tasks.loaded ? store.tasks.list : null;
    var overdue = tasks ? tasks.filter(function (r) { return !r.result && r.overdue; }) : [];
    var latest = available.flatMap(function (k) { return store[k] && store[k].loaded ? store[k].list.filter(function (r) { return r.created_at && !isNaN(new Date(r.created_at).getTime()); }).map(function (r) { return { kind: k, r: r }; }) : []; }).sort(function (a, b) { return new Date(b.r.created_at) - new Date(a.r.created_at); }).slice(0, 4);
    var countText = function (k) { var q = store[k]; return q && q.loaded ? q.list.length : q && q.error ? 'Unavailable' : 'Loading'; };
    target.innerHTML = '<div class="layout overview-layout"><div class="stack"><section class="card queues-card"><div class="cardhead"><h2>Your work queues<span class="count">' + available.length + '</span></h2><span class="sub">Current API records</span></div>' + available.map(function (k) { return '<button type="button" class="queue-row" data-open-queue="' + k + '"><span class="queue-icon">' + icon(icons[k]) + '</span><span><span class="queue-name">' + labels[k] + '</span><span class="queue-sub" style="display:block">' + (store[k] && store[k].error ? 'Could not load this queue' : k === 'viewings' ? 'Selected viewing scope' : 'Open the queue') + '</span></span><span class="queue-trailing"><span class="queue-number">' + countText(k) + '</span></span>' + icon('caret-right') + '</button>'; }).join('') + '</section><section class="card activity-card"><div class="cardhead"><h2>' + icon('clock') + 'Latest records</h2><span class="sub">By creation date</span></div>' + (latest.length ? latest.map(function (entry) { var f = record(entry.kind, entry.r); return '<button type="button" class="activity-row" data-record-kind="' + entry.kind + '" data-record-id="' + esc(entry.r.id) + '"><span class="avatar">' + icon(icons[entry.kind]) + '</span><div><p>' + esc(f[0]) + '</p><small>' + labels[entry.kind] + ' · ' + esc(reference(entry.r.id)) + '</small></div><time>' + date(entry.r.created_at) + '</time></button>'; }).join('') : '<p class="small muted">No records to display yet.</p>') + '</section></div><div class="stack"><section class="card attention-card"><div class="cardhead"><h2>' + icon('warning') + 'Needs attention</h2>' + (overdue.length ? pill('overdue') : '') + '</div><div class="attention-total"><span id="c-overdue">' + (tasks ? overdue.length : '—') + '</span><small>overdue checks</small></div><div class="attention-list">' + (tasks ? overdue.length ? overdue.slice(0, 3).map(function (r) { return '<button type="button" class="attention-item" data-record-kind="tasks" data-record-id="' + esc(r.id) + '"><span class="status-icon">' + icon('clock') + '</span><span><span>' + esc(word(r.type)) + ' check</span><small>' + esc(r.assignee || 'Unassigned') + ' · Due ' + date(r.sla_due_at) + '</small></span></button>'; }).join('') : '<p class="small muted">No overdue checks in the returned queue.</p>' : '<p class="small muted">' + (store.tasks && store.tasks.error ? 'Checks could not be loaded. Refresh to try again.' : 'Loading verification checks…') + '</p>') + '</div><div class="callout"><strong>Evidence before publication</strong><p>Required verification gates must pass before a home can be published.</p></div><button class="btn dark" type="button" data-open-queue="tasks" data-overdue-filter>' + icon('arrow-right') + 'Review checks</button></section><section class="card progress-card"><div class="cardhead"><h2>Verification progress</h2><span class="sub">Returned checks</span></div>' + (tasks ? [['Passed', tasks.filter(function (r) { return r.result === 'pass'; }).length, 'green'], ['Pending', tasks.filter(function (r) { return !r.result && !r.overdue; }).length, 'muted'], ['Overdue', overdue.length, 'ink-soft'], ['Failed', tasks.filter(function (r) { return r.result === 'fail'; }).length, 'ink-soft']].filter(function (x) { return x[0] !== 'Failed' || x[1]; }).map(function (x) { return '<div class="progress-row"><span>' + x[0] + '</span><small>' + x[1] + ' of ' + tasks.length + '</small><div class="bar"><span style="width:' + (tasks.length ? Math.round(x[1] / tasks.length * 100) : 0) + '%;background:var(--' + x[2] + ')"></span></div></div>'; }).join('') : '<p class="small muted">Progress unavailable until checks load.</p>') + '<p class="muted small">Based on returned check states, not a risk score.</p></section><section class="card pilot pilot-card"><div><div class="eyebrow">Pilot workspace</div><h3>Local work. Clear ownership.</h3><p>Payments and e-signature remain outside this desk.</p></div>' + icon('map-pin') + '</section></div></div>';
  }
  function closeDialog() { if (dialog.open) dialog.close(); else restoreForm(); }
  function restoreForm() {
    if (moved) { moved.body.hidden = true; if (moved.home.isConnected) moved.home.appendChild(moved.body); moved = null; }
    content.replaceChildren();
    document.body.style.overflow = '';
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    else if (!app.hidden) document.getElementById('main').focus({ preventScroll: true });
    returnFocus = null;
  }
  dialog.addEventListener('close', function () { if (!dialog.open) restoreForm(); });
  function showDialog(title, html, type) {
    // Restore before reusing the single dialog for a different workflow.
    var invoker = dialog.open ? returnFocus : document.activeElement;
    if (dialog.open) restoreForm();
    returnFocus = invoker;
    dialog.className = type || 'form-dialog';
    document.getElementById('dialog-title').textContent = title;
    content.innerHTML = html || '';
    if (!dialog.open) dialog.showModal(); document.body.style.overflow = 'hidden';
  }
  function openForm(form) {
    if (!form) return;
    var home = form.closest('.action-card');
    if (!home) return;
    var body = home.querySelector('.action-body');
    var title = home.querySelector('.action-card__title').textContent;
    var desc = home.getAttribute('data-description');
    showDialog(title, '<p class="form-intro">' + esc(desc) + '</p>', 'form-dialog');
    moved = { body: body, home: home }; body.hidden = false; content.appendChild(body);
    var first = body.querySelector('input:not([type="hidden"]),select:not(.custom-select__native),.custom-select__trigger,textarea');
    if (first) first.focus({ preventScroll: true });
  }
  function openTools(kind) {
    var cards = Array.from(document.querySelectorAll('#panel-' + kind + ' .action-card'));
    showDialog('Desk actions', '<div class="tool-list">' + (cards.length ? cards.map(function (card) { var form = card.querySelector('form'); return '<button class="tool" type="button" data-open-form="' + esc(form.dataset.action) + '">' + icon('file-text') + esc(card.querySelector('.action-card__title').textContent) + icon('caret-right') + '</button>'; }).join('') : '<button class="tool" type="button" data-open-queue="apps">Open applications</button>') + '</div>', 'tools-dialog');
  }
  function openRecord(kind, id) {
    if (!store[kind] || !store[kind].loaded) return;
    var r = store[kind].list.find(function (item) { return String(item.id) === String(id); });
    if (!r) return;
    var f = record(kind, r), c = config[kind];
    var pairs = [['Reference', r.id], [c.columns[1], f[2]], ['Context', f[3]], ['Created', date(r.created_at)]];
    ['listing_id', 'application_id', 'lead_id'].forEach(function (key) { if (r[key]) pairs.push([word(key), r[key]]); });
    if (kind === 'leads') pairs.push(['Interest', r.area || 'Not recorded'], ['Role', word(r.role)]);
    if (kind === 'listings') pairs.push(['Verification tier', r.verification_tier == null ? 'Not recorded' : r.verification_tier]);
    if (r.tenant_email || r.tenant_phone || r.attendee_phone) pairs.push(['Contact', [r.tenant_email, r.tenant_phone, r.attendee_phone].filter(Boolean).join(' · ')]);
    if (kind === 'viewings') pairs.push(['Address released', r.address_released ? 'Yes' : 'No']);
    if (kind === 'rights') pairs.push(['Matching subject', r.matched === false ? 'No matching record' : (r.subject_id || 'Not recorded')]);
    var action = { listings: ['prepare-listing-id', 'Prepare checks'], tasks: ['result-task-id', 'Record check result'], apps: ['decision-app-id', 'Record decision'], viewings: ['viewing-outcome-id', 'Record outcome'], rights: ['resolve-rights-id', 'Resolve request'] }[kind];
    if (kind === 'listings' && !['draft', 'submitted'].includes(r.state)) action = null;
    var actions = action ? '<button class="btn dark" type="button" data-fill-field="' + action[0] + '" data-fill-value="' + esc(r.id) + '">' + action[1] + '</button>' : '';
    if (kind === 'listings' && ['inspected', 'title_verified'].includes(r.state)) actions += '<button class="btn primary" type="button" data-publish-listing="' + esc(r.id) + '">Publish live</button>';
    if (kind === 'staff' && staff.role === 'admin') {
      if (r.status === 'pending') actions = '<div class="staff-row-actions"><label class="form-field">Approved role<select data-staff-role="' + esc(r.id) + '">' + ['ops', 'inspector', 'analyst', 'finance', 'admin'].map(function (role) { return '<option value="' + role + '"' + (role === r.requested_role ? ' selected' : '') + '>' + word(role) + '</option>'; }).join('') + '</select></label><label class="form-field">Decline reason (optional)<input data-staff-reason="' + esc(r.id) + '" maxlength="400"></label><button class="btn primary" type="button" data-staff-decision="approve" data-staff-id="' + esc(r.id) + '">Approve</button><button class="btn ghost" type="button" data-staff-decision="reject" data-staff-id="' + esc(r.id) + '">Decline</button></div>';
      else if (r.status === 'approved') actions = '<button class="btn primary" type="button" data-staff-decision="reissue" data-staff-id="' + esc(r.id) + '">Reissue setup link</button>';
    }
    showDialog(labels[kind] + ' / ' + reference(r.id), '<div class="detail-identity"><span class="avatar">' + icon(icons[kind]) + '</span><div><h2>' + esc(f[0]) + '</h2><p>' + esc(f[1]) + '</p></div></div>' + pill(status(kind, r)) + '<div class="detailgrid">' + pairs.map(function (a) { return '<div><small>' + esc(a[0]) + '</small><p>' + esc(a[1]) + '</p></div>'; }).join('') + '</div>' + (r.terms || r.note || r.detail || r.rejection_reason ? '<h3>Recorded note</h3><p class="record-note">' + esc(r.terms || r.note || r.detail || r.rejection_reason) + '</p>' : '') + '<div class="callout"><strong>Next step</strong><p>' + c.guidance + '</p></div><div class="record-actions">' + actions + '</div>', 'record-dialog');
  }
  function setActive(kind) {
    closeDialog(); setDrawer(false);
    document.querySelectorAll('.tab[data-tab]').forEach(function (tab) { var on = tab.dataset.tab === kind; tab.classList.toggle('active', on); if (on) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current'); });
    document.getElementById('crumb-current').textContent = labels[kind];
    document.getElementById('desk-nav-search').value = ''; filterNavigation();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function setDrawer(open) { document.getElementById('rail').classList.toggle('open', open); document.getElementById('desk-scrim').classList.toggle('open', open); document.getElementById('desk-burger').setAttribute('aria-expanded', String(open)); app.dataset.drawer = open ? 'open' : 'closed'; app.querySelector('.app').inert = open && mq.matches; if (open) document.getElementById('sidebar-close').focus(); if (!dialog.open) document.body.style.overflow = open ? 'hidden' : ''; }
  function setCollapsed(collapsed, save) { document.body.dataset.sidebarCollapsed = String(collapsed); app.dataset.collapsed = String(collapsed); var button = document.getElementById('sidebar-toggle-inline'); button.setAttribute('aria-expanded', String(!collapsed)); button.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar'); button.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar'; if (save) try { localStorage.setItem('desk-collapsed', String(collapsed)); } catch (_) {} }
  function filterNavigation() { var q = document.getElementById('desk-nav-search').value.trim().toLowerCase(), count = 0; document.querySelectorAll('.tab[data-tab]').forEach(function (t) { var visible = (t.dataset.tab !== 'staff' || staff.role === 'admin') && t.textContent.toLowerCase().includes(q); t.hidden = !visible; if (visible) count++; }); document.querySelectorAll('.nav-group').forEach(function (g) { g.hidden = !g.querySelector('.tab:not([hidden])'); }); document.getElementById('nav-empty').hidden = count > 0; }
  function focusSearch() { if (mq.matches) setDrawer(true); else setCollapsed(false, true); var input = document.getElementById('desk-nav-search'); input.focus(); input.select(); }
  function account(open) { document.getElementById('account-menu').hidden = !open; document.getElementById('account-trigger').setAttribute('aria-expanded', String(open)); }
  document.getElementById('account-trigger').addEventListener('click', function () { account(document.getElementById('account-menu').hidden); });
  document.getElementById('sidebar-account').addEventListener('click', function (e) { e.stopPropagation(); setDrawer(false); account(true); document.getElementById('account-trigger').focus(); });
  document.getElementById('sidebar-toggle-inline').addEventListener('click', function () { document.getElementById('desk-nav-search').value = ''; filterNavigation(); setCollapsed(app.dataset.collapsed !== 'true', true); });
  document.getElementById('desk-burger').addEventListener('click', function () { setDrawer(app.dataset.drawer !== 'open'); });
  document.getElementById('sidebar-close').addEventListener('click', function () { setDrawer(false); document.getElementById('desk-burger').focus(); });
  document.getElementById('desk-scrim').addEventListener('click', function () { setDrawer(false); });
  document.getElementById('sidebar-search-btn').addEventListener('click', focusSearch);
  document.getElementById('desk-nav-search').addEventListener('input', filterNavigation);
  document.getElementById('account-dashboard').addEventListener('click', function () { document.getElementById('tab-overview').click(); });
  document.getElementById('account-copy-email').addEventListener('click', async function () { var button = this; try { await navigator.clipboard.writeText(button.dataset.copyEmail); button.textContent = 'Email copied'; } catch (_) { button.textContent = 'Copy unavailable in this browser'; } setTimeout(function () { button.innerHTML = icon('file-text') + 'Copy account email'; }, 2000); });
  document.getElementById('setup-guide').addEventListener('click', function () { setDrawer(false); showDialog('Setup guide', '<p class="form-intro">Use the queues to complete the next recorded step. Progress is determined by your real records, not a preset checklist.</p><div class="tool-list">' + ['leads', 'listings', 'tasks', 'apps', 'viewings', 'rights'].map(function (k) { return '<button class="tool" type="button" data-open-queue="' + k + '">' + icon(icons[k]) + labels[k] + icon('caret-right') + '</button>'; }).join('') + '</div>', 'tools-dialog'); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.account')) account(false);
    if (e.target.closest('#account-menu button,#account-menu a')) account(false);
    var close = e.target.closest('[data-dialog-close]'); if (close) closeDialog();
    if (e.target === dialog) { var r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); }
    var open = e.target.closest('[data-open-queue]'); if (open) { var tab = document.querySelector('.tab[data-tab="' + open.dataset.openQueue + '"]'); if (tab && !(open.dataset.openQueue === 'staff' && staff.role !== 'admin')) { var overdue = open.hasAttribute('data-overdue-filter'); tab.click(); if (overdue && states.tasks) { states.tasks.status = 'overdue'; updateTable('tasks'); } } }
    var recordButton = e.target.closest('[data-record-kind]'); if (recordButton) openRecord(recordButton.dataset.recordKind, recordButton.dataset.recordId);
    var tool = e.target.closest('[data-tools]'); if (tool) openTools(tool.dataset.tools);
    var action = e.target.closest('[data-action-launch]'); if (action) openForm(action.closest('.action-card').querySelector('form'));
    var filter = e.target.closest('[data-queue-filter]'); if (filter) { states[filter.dataset.kind].status = filter.dataset.queueFilter; states[filter.dataset.kind].expanded = false; updateTable(filter.dataset.kind); var replacement = document.querySelector('[data-filters="' + filter.dataset.kind + '"] [data-queue-filter="' + filter.dataset.queueFilter + '"]'); if (replacement) replacement.focus({ preventScroll: true }); }
    var clear = e.target.closest('[data-clear-filter]'); if (clear) { var kind = clear.dataset.clearFilter; states[kind] = { status: 'all', query: '', expanded: false }; document.querySelector('[data-queue-search="' + kind + '"]').value = ''; updateTable(kind); }
    var more = e.target.closest('[data-expand-queue]'); if (more) { var k = more.dataset.expandQueue; states[k].expanded = !states[k].expanded; updateTable(k); }
  });
  document.addEventListener('input', function (e) { if (e.target.dataset.queueSearch) { var k = e.target.dataset.queueSearch; states[k].query = e.target.value; states[k].expanded = false; updateTable(k); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var hadDrawer = app.dataset.drawer === 'open'; setDrawer(false); account(false); if (hadDrawer) document.getElementById('desk-burger').focus(); }
    if (e.key === 'Tab' && app.dataset.drawer === 'open' && mq.matches) { var controls = Array.from(document.getElementById('rail').querySelectorAll('a,button,input')).filter(function (el) { return el.getClientRects().length && !el.disabled; }); var first = controls[0], last = controls[controls.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && !app.hidden && !dialog.open) { e.preventDefault(); focusSearch(); } });
  mq.addEventListener('change', function () { setDrawer(false); document.querySelectorAll('.guidance-card').forEach(function (el) { el.open = !mq.matches; }); });
  var saved = false; try { saved = localStorage.getItem('desk-collapsed') === 'true'; } catch (_) {} setCollapsed(saved, false);
  window.ileeDeskView = {
    queue: queue, state: queueState, openForm: openForm, closeDialog: closeDialog, active: setActive,
    notice: function (message, error) { if (!dialog.open || content.querySelector('form') || !error) return; var alert = content.querySelector('[data-dialog-error]'); if (!alert) { alert = document.createElement('p'); alert.setAttribute('data-dialog-error', ''); alert.setAttribute('role', 'alert'); alert.className = 'action-feedback is-error'; content.appendChild(alert); } alert.textContent = message; },
    completeForm: function (form) { if (dialog.contains(form)) closeDialog(); },
    setStaff: function (value) { staff = value || {}; if (staff.role !== 'admin') { delete store.staff; document.getElementById('panel-staff').replaceChildren(); } filterNavigation(); overview(); },
    reset: function () { closeDialog(); store = {}; states = {}; staff = {}; account(false); setDrawer(false); document.querySelectorAll('.panel:not(#panel-overview)').forEach(function (p) { p.replaceChildren(); }); overview(); }
  };
})();
