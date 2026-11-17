const seed = {
  flights: [
    { flight: 'AG109', route: 'Ahmedabad → Mumbai', departure: '16 Nov 2025, 21:30', arrival: '16 Nov 2025, 22:36', fare: '₹3,500', status: 'Scheduled' },
    { flight: 'AG204', route: 'Mumbai → Bengaluru', departure: '17 Nov 2025, 08:10', arrival: '17 Nov 2025, 09:55', fare: '₹4,200', status: 'Scheduled' },
    { flight: 'AG318', route: 'Delhi → Ahmedabad', departure: '17 Nov 2025, 11:25', arrival: '17 Nov 2025, 13:00', fare: '₹3,100', status: 'Delayed' },
    { flight: 'AG117', route: 'Ahmedabad → Mumbai', departure: '15 Nov 2025, 20:30', arrival: '15 Nov 2025, 21:45', fare: '₹3,000', status: 'Completed' }
  ],
  bookings: [
    { pnr: 'PDF664', passenger: 'Demo Passenger 03', email: 'passenger03@example.com', flight: 'AG109', route: 'Ahmedabad → Mumbai', seat: '10A', price: '₹6,414', date: '16 Nov 2025', status: 'Confirmed' },
    { pnr: 'PJM826', passenger: 'Demo Passenger', email: 'passenger@example.com', flight: 'AG109', route: 'Ahmedabad → Mumbai', seat: '9B', price: '₹6,798', date: '16 Nov 2025', status: 'Confirmed' },
    { pnr: 'LZ2439', passenger: 'Demo Passenger 02', email: 'passenger02@example.com', flight: 'AG117', route: 'Ahmedabad → Mumbai', seat: '10A', price: '₹6,414', date: '15 Nov 2025', status: 'Cancelled' }
  ],
  aircraft: [
    { registration: 'VT-E3H', model: 'Airbus A320neo', manufacturer: 'Airbus', seats: '176', status: 'Active', maintenance: '2026-12-18' },
    { registration: 'VT-I3G', model: 'Airbus A320neo', manufacturer: 'Airbus', seats: '176', status: 'Active', maintenance: '2026-12-22' },
    { registration: 'VT-IIK', model: 'Airbus A320neo', manufacturer: 'Airbus', seats: '176', status: 'Maintenance', maintenance: '2026-11-20' },
    { registration: 'VT-IND', model: 'Airbus A320neo', manufacturer: 'Airbus', seats: '176', status: 'Active', maintenance: '2027-01-05' }
  ],
  crew: [
    { id: 'EMP004', name: 'Crew Member 01', role: 'Flight Attendant', email: 'crew01@example.com', phone: '+91 00000 00000', license: 'LIC7655', status: 'Active' },
    { id: 'EMP003', name: 'Crew Member 02', role: 'Pilot', email: 'crew02@example.com', phone: '+91 00000 00000', license: 'LIC8705', status: 'Active' },
    { id: 'EMP002', name: 'Crew Member 03', role: 'Co-Pilot', email: 'crew03@example.com', phone: '+91 00000 00000', license: 'LIC8730', status: 'Active' },
    { id: 'EMP001', name: 'Crew Member 04', role: 'Pilot', email: 'crew04@example.com', phone: '+91 00000 00000', license: 'LIC5487', status: 'Active' }
  ],
  users: [
    { name: 'Demo Passenger 01', email: 'passenger01@example.com', phone: '+91 00000 00000', gender: 'Male', role: 'Passenger', status: 'Verified' },
    { name: 'Demo Passenger', email: 'passenger@example.com', phone: '+91 00000 00000', gender: 'Male', role: 'Passenger', status: 'Verified' },
    { name: 'Demo Passenger 02', email: 'passenger02@example.com', phone: '+91 00000 00000', gender: 'Female', role: 'Passenger', status: 'Verified' },
    { name: 'Demo Passenger 03', email: 'passenger03@example.com', phone: '+91 00000 00000', gender: 'Male', role: 'Passenger', status: 'Verified' },
    { name: 'Staff Account', email: 'staff@example.com', phone: '+91 00000 00000', gender: 'Other', role: 'Staff', status: 'Verified' },
    { name: 'Admin Account', email: 'admin@example.com', phone: '+91 00000 00000', gender: 'Other', role: 'Admin', status: 'Verified' }
  ]
};

const storeKey = 'aerisgo-admin-v3';
const authKey = 'aerisgo-admin-demo-session';
let data;
try { data = { ...seed, ...JSON.parse(localStorage.getItem(storeKey) || '{}') }; }
catch { data = JSON.parse(JSON.stringify(seed)); }
let current = 'dashboard';
let editingIndex = null;
let toastTimer;

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function showApp() {
  $('#loginScreen').hidden = true;
  $('#appShell').classList.add('is-authenticated');
  render('dashboard');
}

function showLogin() {
  sessionStorage.removeItem(authKey);
  $('#appShell').classList.remove('is-authenticated');
  $('#loginScreen').hidden = false;
  $('#loginForm').reset();
  $('#loginError').textContent = '';
  $('#loginStatus').textContent = '';
  $('#loginEmail').focus();
}

$('#loginForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email')).trim().toLowerCase();
  const password = String(form.get('password'));
  if (email !== 'admin@aerisgo.in' || password !== 'aerisgo123') {
    $('#loginStatus').textContent = '';
    $('#loginError').textContent = 'Email or password is incorrect. Use the demo credentials shown below.';
    return;
  }
  sessionStorage.setItem(authKey, 'active');
  showApp();
});

$('#demoLoginButton').addEventListener('click', () => {
  $('#loginEmail').value = 'admin@aerisgo.in';
  $('#loginPassword').value = 'aerisgo123';
  $('#loginError').textContent = '';
  $('#loginStatus').textContent = 'Demo details filled. Click “Sign in to dashboard” to continue.';
  $('#loginPassword').focus();
});

function save() { localStorage.setItem(storeKey, JSON.stringify(data)); }
function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
function titleCase(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function status(value) { return `<span class="status ${esc(value).toLowerCase()}">${esc(value)}</span>`; }
function heading(title, description, actions = '') {
  return `<div class="page-heading"><div><span class="eyebrow">AERISGO OPERATIONS</span><h1>${title}</h1><p>${description}</p></div><div class="head-actions">${actions}</div></div>`;
}
function btn(text, action, className = '') { return `<button type="button" class="button ${className}" data-action="${action}">${text}</button>`; }

function dashboard() {
  return `${heading('Admin Dashboard', 'Complete analytics and insights for AerisGo operations.', btn('↻ &nbsp; Refresh', 'refresh', 'quiet'))}
    <section class="stats-grid">${[['Total flights','03','✈','1 active today'],['Bookings today','02','▤','Customer reservations'],['Revenue today','₹12,612','₹','Revenue performance'],['Verified customers','03','♧','User engagement']].map(([label,value,icon,foot]) => `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot"><span class="trend">↗ 12%</span> &nbsp;${foot}</div></article>`).join('')}</section>
    <section class="dashboard-grid"><article class="panel"><div class="panel-head"><div><h2>Flight &amp; passengers overview</h2><p>Daily operations for the selected period</p></div><select class="period-select" id="chartPeriod"><option>Last 7 days</option><option>Last 30 days</option><option>This year</option></select></div><div class="chart-wrap"><svg viewBox="0 0 680 220" role="img" aria-label="Flight and passenger activity line chart"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#793345" stop-opacity=".23"/><stop offset="1" stop-color="#793345" stop-opacity="0"/></linearGradient></defs><line class="chart-grid" x1="45" y1="30" x2="665" y2="30"/><line class="chart-grid" x1="45" y1="80" x2="665" y2="80"/><line class="chart-grid" x1="45" y1="130" x2="665" y2="130"/><line class="chart-grid" x1="45" y1="180" x2="665" y2="180"/><text class="chart-label" x="12" y="34">60</text><text class="chart-label" x="12" y="84">40</text><text class="chart-label" x="12" y="134">20</text><text class="chart-label" x="20" y="184">0</text><path class="chart-area" d="M45 155 C85 160 104 140 142 145 S213 125 240 132 S310 108 345 113 S410 84 448 92 S520 57 550 68 S617 34 665 40 L665 180 L45 180Z"/><path class="chart-line" d="M45 155 C85 160 104 140 142 145 S213 125 240 132 S310 108 345 113 S410 84 448 92 S520 57 550 68 S617 34 665 40"/><text class="chart-label" x="45" y="205">11 Nov</text><text class="chart-label" x="235" y="205">13 Nov</text><text class="chart-label" x="435" y="205">15 Nov</text><text class="chart-label" x="630" y="205">17 Nov</text></svg></div><div class="chart-legend"><span><i class="legend-dot">●</i>Passengers</span><span><i class="legend-dot">●</i>Flights</span></div></article>
    <article class="panel"><div class="panel-head"><div><h2>Popular routes</h2><p>Bookings across active routes</p></div><span class="eyebrow">TODAY</span></div><div class="route-list"><div class="route-row"><div><div class="route-name">Ahmedabad → Mumbai</div><div class="route-meta">AG109 · 2h 06m</div></div><div class="route-count">42<small>bookings</small></div></div><div class="route-row"><div><div class="route-name">Mumbai → Bengaluru</div><div class="route-meta">AG204 · 1h 45m</div></div><div class="route-count">28<small>bookings</small></div></div><div class="route-row"><div><div class="route-name">Delhi → Ahmedabad</div><div class="route-meta">AG318 · 1h 35m</div></div><div class="route-count">19<small>bookings</small></div></div><div class="route-row"><div><div class="route-name">Ahmedabad → Delhi</div><div class="route-meta">AG131 · 1h 40m</div></div><div class="route-count">14<small>bookings</small></div></div></div></article></section>
    ${tablePanel('Recent bookings', 'Latest customer reservations', 'bookings', data.bookings.slice(0, 4))}`;
}

const config = {
  flights: { desc: 'Manage flight schedules, routes, and availability.', add: '＋ Add flight', cols: [['flight','Flight'],['route','Route'],['departure','Departure'],['arrival','Arrival'],['fare','Fare'],['status','Status']] },
  bookings: { desc: 'Manage reservations, passenger details, and seat assignments.', add: '＋ Add booking', cols: [['pnr','PNR'],['passenger','Passenger'],['flight','Flight'],['seat','Seat'],['price','Price'],['date','Booked on'],['status','Status']] },
  aircraft: { desc: 'Manage your fleet, status, and maintenance schedules.', add: '＋ Add aircraft', cols: [['registration','Registration'],['model','Aircraft'],['manufacturer','Manufacturer'],['seats','Seats'],['status','Status'],['maintenance','Next maintenance']] },
  crew: { desc: 'Manage pilots, co-pilots, and flight attendants.', add: '＋ Add crew member', cols: [['id','Employee ID'],['name','Name'],['role','Role'],['email','Email'],['phone','Phone'],['license','License'],['status','Status']] },
  users: { desc: 'Manage passenger accounts, staff roles, and verification.', add: '＋ Add user', cols: [['name','Name'],['email','Email'],['phone','Phone'],['gender','Gender'],['role','Role'],['status','Status']] }
};

function money(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount) : esc(value);
}
function dateTime(value) {
  const date = new Date(String(value ?? '').replace(',', ''));
  return Number.isNaN(date.getTime()) ? esc(value) : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}
function dateOnly(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? esc(value) : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
function displayCell(field, value) {
  if (field === 'status') return status(value);
  if (field === 'fare' || field === 'price') return esc(money(value));
  if (field === 'departure' || field === 'arrival') return esc(dateTime(value));
  if (field === 'maintenance' || field === 'date') return esc(dateOnly(value));
  if (['flight','pnr','id','registration'].includes(field)) return `<span class="cell-strong">${esc(value)}</span>`;
  return esc(value);
}

function tablePanel(title, description, key, rows) {
  const columns = config[key]?.cols || [];
  return `<article class="panel panel-wide table-panel"><div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div>${config[key] ? btn(config[key].add, `add-${key}`, 'primary small') : ''}</div><div class="toolbar"><div class="search-wrap"><input class="search-field" id="tableSearch" placeholder="Search ${key}…" aria-label="Search ${key}"></div><select class="filter-select" id="statusFilter"><option value="">All statuses</option>${[...new Set((data[key] || []).map(row => row.status))].map(value => `<option>${esc(value)}</option>`).join('')}</select></div><div class="table-wrap"><table><thead><tr>${columns.map(column => `<th>${column[1]}</th>`).join('')}<th>Actions</th></tr></thead><tbody id="tableRows">${renderRows(key, rows)}</tbody></table></div></article>`;
}
function renderRows(key, rows) {
  const columns = config[key]?.cols || [];
  if (!rows.length) return `<tr><td class="empty" colspan="${columns.length + 1}">No records match your search.</td></tr>`;
  return rows.map(row => `<tr>${columns.map(([field]) => `<td>${displayCell(field, row[field])}</td>`).join('')}<td><button type="button" class="table-action" data-action="delete" data-key="${key}" data-index="${data[key].indexOf(row)}" aria-label="Delete record">⋮</button></td></tr>`).join('');
}
function management(key) {
  const rows = data[key];
  return `${heading(`${titleCase(key)} Management`, config[key].desc, btn('↻ &nbsp; Refresh', 'refresh', 'quiet') + btn(config[key].add, `add-${key}`, 'primary'))}<article class="panel" style="margin-bottom:16px"><div class="stat-top"><span>ALL ${titleCase(key)}</span><span class="eyebrow">${rows.length} RECORDS</span></div><div class="stat-value">${rows.length}</div><div class="stat-foot">Current records in this workspace</div></article>${tablePanel(`${titleCase(key)} directory`, `Showing ${rows.length} ${key} records`, key, rows)}`;
}
function seatMap() {
  const seats = Array.from({ length: 48 }, (_, index) => {
    const number = index + 1;
    const kind = number % 13 === 0 ? 'locked' : number % 9 === 0 ? 'booked' : 'available';
    const name = `${Math.ceil(number / 6)}${'ABCDEF'[(number - 1) % 6]}`;
    return `<button type="button" class="seat ${kind === 'available' ? '' : kind}" data-action="seat" data-seat="${name}" title="Seat ${name} · ${kind}">${name}</button>`;
  }).join('');
  return `${heading('Real-time seat map', 'Ahmedabad → Mumbai · AG109 · Airbus A320neo', btn('← &nbsp; Flights', 'flights', 'quiet'))}<section class="seat-summary"><div class="seat-metric"><span>Total seats</span><strong>176</strong></div><div class="seat-metric"><span>Available</span><strong style="color:var(--green)">142</strong></div><div class="seat-metric"><span>Locked</span><strong style="color:var(--amber)">18</strong></div><div class="seat-metric"><span>Booked</span><strong style="color:var(--red)">16</strong></div></section><article class="panel"><div class="panel-head"><div><h2>Cabin seat map</h2><p>Select a seat to see its current status</p></div><select class="filter-select"><option>AG109 · Ahmedabad → Mumbai</option><option>AG204 · Mumbai → Bengaluru</option></select></div><div class="seat-legend"><span><i class="legend-swatch" style="background:#4eb77d"></i>Available</span><span><i class="legend-swatch" style="background:#e5ae3e"></i>Locked</span><span><i class="legend-swatch" style="background:#cf5855"></i>Booked</span></div><div class="seat-layout">${seats}</div></article>`;
}
function render(view = current) {
  current = view;
  const activeNav = $(`[data-view="${view}"]`);
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item === activeNav));
  $('#breadcrumb').textContent = view === 'seatmap' ? 'Seat map' : titleCase(view);
  const content = $('#content');
  content.classList.remove('view-enter');
  content.innerHTML = view === 'dashboard' ? dashboard() : view === 'seatmap' ? seatMap() : management(view);
  void content.offsetWidth;
  content.classList.add('view-enter');
  $('#sidebar').classList.remove('open');
  bindView();
}
function bindView() {
  $('#tableSearch')?.addEventListener('input', filterRows);
  $('#statusFilter')?.addEventListener('change', filterRows);
}
function filterRows() {
  const query = $('#tableSearch')?.value.toLowerCase() || '';
  const filter = $('#statusFilter')?.value || '';
  const rows = data[current].filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(query)) && (!filter || row.status === filter));
  $('#tableRows').innerHTML = renderRows(current, rows);
}

const fields = {
  flights: [
    { field: 'flight', label: 'Flight number', type: 'text', placeholder: 'AG101', pattern: '[A-Za-z]{2,3}[0-9]{1,4}', title: 'Use 2–3 letters followed by 1–4 digits.' },
    { field: 'route', label: 'Route', type: 'text', placeholder: 'Ahmedabad → Mumbai' },
    { field: 'departure', label: 'Departure date and time', type: 'datetime-local' },
    { field: 'arrival', label: 'Arrival date and time', type: 'datetime-local' },
    { field: 'fare', label: 'Fare (₹)', type: 'number', min: '0', step: '1', placeholder: '3500' },
    { field: 'status', label: 'Status', type: 'select', options: ['Scheduled','Delayed','Cancelled','Completed'] }
  ],
  bookings: [
    { field: 'pnr', label: 'Booking reference', type: 'text', placeholder: 'AG1234', pattern: '[A-Za-z0-9]{4,10}', title: 'Use 4–10 letters and numbers.' },
    { field: 'passenger', label: 'Passenger name', type: 'text', placeholder: 'Full name' },
    { field: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
    { field: 'flight', label: 'Flight number', type: 'text', placeholder: 'AG101', pattern: '[A-Za-z]{2,3}[0-9]{1,4}', title: 'Use 2–3 letters followed by 1–4 digits.' },
    { field: 'seat', label: 'Seat', type: 'text', placeholder: '12A', pattern: '[0-9]{1,2}[A-Fa-f]', title: 'Enter a row number and seat letter, such as 12A.' },
    { field: 'price', label: 'Price (₹)', type: 'number', min: '0', step: '1', placeholder: '3500' },
    { field: 'date', label: 'Booking date', type: 'date' },
    { field: 'status', label: 'Status', type: 'select', options: ['Confirmed','Pending','Cancelled'] }
  ],
  aircraft: [
    { field: 'registration', label: 'Registration', type: 'text', placeholder: 'VT-ABC', pattern: 'VT-[A-Z0-9]{3}', title: 'Use the format VT-ABC.' },
    { field: 'model', label: 'Aircraft model', type: 'text', placeholder: 'Airbus A320neo' },
    { field: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'Airbus' },
    { field: 'seats', label: 'Seat capacity', type: 'number', min: '1', max: '900', step: '1', placeholder: '176' },
    { field: 'status', label: 'Status', type: 'select', options: ['Active','Maintenance','Retired'] },
    { field: 'maintenance', label: 'Next maintenance', type: 'date' }
  ],
  crew: [
    { field: 'id', label: 'Employee ID', type: 'text', placeholder: 'EMP005', pattern: 'EMP[0-9]{3,6}', title: 'Use EMP followed by 3–6 digits.' },
    { field: 'name', label: 'Full name', type: 'text', placeholder: 'Full name' },
    { field: 'role', label: 'Role', type: 'select', options: ['Pilot','Co-Pilot','Flight Attendant'] },
    { field: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
    { field: 'phone', label: 'Phone', type: 'tel', inputmode: 'tel', pattern: '[+0-9() -]{10,18}', title: 'Use 10–18 digits and phone symbols only.' },
    { field: 'license', label: 'License', type: 'text', placeholder: 'LIC0000', pattern: 'LIC[0-9]{3,8}', title: 'Use LIC followed by 3–8 digits.' },
    { field: 'status', label: 'Status', type: 'select', options: ['Active','Inactive'] }
  ],
  users: [
    { field: 'name', label: 'Full name', type: 'text', placeholder: 'Full name' },
    { field: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
    { field: 'phone', label: 'Phone', type: 'tel', inputmode: 'tel', pattern: '[+0-9() -]{10,18}', title: 'Use 10–18 digits and phone symbols only.' },
    { field: 'gender', label: 'Gender', type: 'select', options: ['Male','Female','Other'] },
    { field: 'role', label: 'Role', type: 'select', options: ['Passenger','Staff','Admin'] },
    { field: 'status', label: 'Status', type: 'select', options: ['Verified','Pending'] }
  ]
};

function toLocalDateTime(value) {
  const date = new Date(String(value ?? '').replace(',', ''));
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function formValue(field, value) {
  if (field.type === 'datetime-local') return toLocalDateTime(value);
  if (field.type === 'date' && /^\d{1,2} [A-Za-z]{3} \d{4}$/.test(String(value ?? ''))) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  if (field.type === 'number') return String(value ?? '').replace(/[^0-9.]/g, '');
  return String(value ?? '');
}
function openForm(key, index = null) {
  editingIndex = index;
  const row = index === null ? {} : data[key][index];
  const singular = { flights: 'flight', bookings: 'booking', aircraft: 'aircraft', crew: 'crew member', users: 'user' }[key];
  $('#dialogTitle').textContent = `${index === null ? 'Add' : 'Edit'} ${singular}`;
  $('#dialogFields').innerHTML = fields[key].map(field => {
    if (field.type === 'select') return `<div class="dialog-field"><label for="f-${field.field}">${field.label}</label><select id="f-${field.field}" name="${field.field}" required>${field.options.map(option => `<option ${row[field.field] === option ? 'selected' : ''}>${option}</option>`).join('')}</select></div>`;
    const attributes = Object.entries(field).filter(([name]) => !['field','label','type','placeholder','options'].includes(name)).map(([name,value]) => `${name}="${esc(value)}"`).join(' ');
    return `<div class="dialog-field"><label for="f-${field.field}">${field.label}</label><input id="f-${field.field}" name="${field.field}" type="${field.type}" ${field.placeholder ? `placeholder="${esc(field.placeholder)}"` : ''} ${attributes} value="${esc(formValue(field, row[field.field]))}" required></div>`;
  }).join('');
  $('#recordForm').dataset.key = key;
  $('#recordDialog').showModal();
  $('#dialogFields input, #dialogFields select')?.focus();
}

$('#dialogFields').addEventListener('input', event => {
  const input = event.target;
  if (input.matches('input[type="number"]')) input.value = input.value.replace(/[^0-9]/g, '');
  if (input.matches('input[type="tel"]')) input.value = input.value.replace(/[^0-9+() -]/g, '');
});
$('#dialogFields').addEventListener('change', event => {
  if (event.target.name === 'departure') $('#dialogFields [name="arrival"]')?.setAttribute('min', event.target.value);
  if (event.target.name === 'arrival') event.target.setCustomValidity('');
});
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => $('#recordDialog').close()));
$('#recordForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const key = form.dataset.key;
  const departure = form.elements.namedItem('departure');
  const arrival = form.elements.namedItem('arrival');
  if (departure && arrival && departure.value && arrival.value && arrival.value <= departure.value) {
    arrival.setCustomValidity('Arrival must be after departure.');
    arrival.reportValidity();
    return;
  }
  arrival?.setCustomValidity('');
  const row = Object.fromEntries(new FormData(form).entries());
  const wasAdding = editingIndex === null;
  if (wasAdding) data[key].unshift(row);
  else data[key][editingIndex] = row;
  save();
  $('#recordDialog').close();
  render(current);
  notify(`${titleCase(key)} ${wasAdding ? 'added' : 'updated'} successfully`);
});

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]');
  if (nav) { render(nav.dataset.view); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const name = action.dataset.action;
  if (name === 'logout') { showLogin(); return; }
  if (config[name]) { render(name); return; }
  if (name.startsWith('add-')) { openForm(name.slice(4)); return; }
  if (name === 'refresh') { render(current); notify('Dashboard data refreshed'); return; }
  if (name === 'delete') {
    const key = action.dataset.key;
    const index = Number(action.dataset.index);
    if (confirm(`Remove this ${key.slice(0, -1)} record?`)) {
      data[key].splice(index, 1);
      save();
      render(current);
      notify('Record removed');
    }
    return;
  }
  if (name === 'seat') notify(`Seat ${action.dataset.seat} selected`);
});

$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
if (sessionStorage.getItem(authKey) === 'active') showApp();
else showLogin();
