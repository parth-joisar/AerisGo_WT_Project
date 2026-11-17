(() => {
  const SESSION_KEY = 'aerisgo-passenger-session';
  const PENDING_KEY = 'aerisgo-pending-signup';
  const RETURN_KEY = 'aerisgo-return-after-login';
  const RESET_EMAIL_KEY = 'aerisgo-reset-email';
  const USERS_KEY = 'aerisgo-passenger-demo-users';
  const IDLE_LIMIT = 30 * 60 * 1000;
  const SESSION_LIMIT = 8 * 60 * 60 * 1000;
  const PROTECTED = new Set([
    'home-account.html', 'search-results.html', 'flight-details.html', 'seat-selection.html',
    'passenger-details.html', 'booking-confirmation.html', 'booking-success.html', 'account.html',
    'check-in.html', 'checkin-success.html', 'meal-selection.html', 'baggage-selection.html',
    'notifications.html', 'profile.html', 'rewards.html', 'faqs.html'
  ]);
  const page = location.pathname.split('/').pop() || 'index.html';
  const $ = (selector, root = document) => root.querySelector(selector);
  let lastTouch = 0;

  function readJSON(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
  }
  function writeJSON(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  function registeredUsers() {
    const users = readJSON(localStorage, USERS_KEY);
    return Array.isArray(users) ? users : [];
  }
  function saltValue() {
    return [...crypto.getRandomValues(new Uint8Array(16))].map(value => value.toString(16).padStart(2, '0')).join('');
  }
  async function passwordHash(password, salt) {
    if (!crypto.subtle) throw new Error('Password protection is unavailable. Open this site over HTTPS or localhost.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  }
  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  function session() {
    const value = readJSON(sessionStorage, SESSION_KEY);
    if (!value || !value.email || !Number.isFinite(value.createdAt) || !Number.isFinite(value.lastActive)) return null;
    const now = Date.now();
    if (now - value.lastActive > IDLE_LIMIT || now - value.createdAt > SESSION_LIMIT) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return value;
  }
  function setSession(user) {
    const now = Date.now();
    writeJSON(sessionStorage, SESSION_KEY, { ...user, createdAt: now, lastActive: now });
  }
  function finishSignIn() {
    const destination = sessionStorage.getItem(RETURN_KEY);
    sessionStorage.removeItem(RETURN_KEY);
    location.replace(destination && !destination.includes('://') ? destination : 'home-account.html');
  }
  function redirectToSignIn(expired = false) {
    const destination = `${location.pathname.split('/').pop()}${location.search}`;
    sessionStorage.clear();
    sessionStorage.setItem(RETURN_KEY, destination);
    location.replace(`signin.html${expired ? '?expired=1' : ''}`);
  }
  function enforceSession() {
    if (PROTECTED.has(page)) {
      const hadSession = sessionStorage.getItem(SESSION_KEY) !== null;
      const active = session();
      if (!active) {
        redirectToSignIn(hadSession);
        return false;
      }
      document.documentElement.classList.add('passenger-session-active');
      document.querySelectorAll('[data-session-name]').forEach(node => { node.textContent = active.name || 'Passenger'; });
      document.querySelectorAll('[data-session-email]').forEach(node => { node.textContent = active.email; });
      document.querySelectorAll('[data-session-value="name"]').forEach(node => { if (!node.value || node.value === 'Demo Passenger') node.value = active.name || 'Passenger'; });
    }
    if (page === 'verify-otp.html' && !readJSON(sessionStorage, PENDING_KEY)) {
      location.replace('signup.html');
      return false;
    }
    return true;
  }

  function touchSession(event) {
    // Let the logout click clear storage even if the session has just expired.
    if (event?.target?.closest?.('[data-session-logout]')) return;
    const now = Date.now();
    if (now - lastTouch < 60_000) return;
    lastTouch = now;
    const active = session();
    if (active) {
      active.lastActive = now;
      writeJSON(sessionStorage, SESSION_KEY, active);
    } else if (PROTECTED.has(page)) {
      redirectToSignIn(true);
    }
  }

  function markInvalid(control, message) {
    control.setCustomValidity(message);
    control.reportValidity();
    control.addEventListener('input', () => control.setCustomValidity(''), { once: true });
    control.addEventListener('change', () => control.setCustomValidity(''), { once: true });
    return false;
  }

  function submitSearch(form) {
    const from = $('[name="from"]', form);
    const to = $('[name="to"]', form);
    const date = $('[name="date"]', form);
    if (from && to && from.value === to.value) return markInvalid(to, 'Choose a different arrival city.');
    if (date && date.value < todayISO()) return markInvalid(date, 'Choose today or a future travel date.');
    return true;
  }

  function submitPassenger(form) {
    const dob = $('[name="dateOfBirth"]', form);
    if (dob && dob.value && dob.value > todayISO()) return markInvalid(dob, 'Date of birth cannot be in the future.');
    const passenger = Object.fromEntries(new FormData(form).entries());
    writeJSON(sessionStorage, 'aerisgo-booking-passenger', passenger);
    return true;
  }

  function addValidation() {
    document.querySelectorAll('input[type="date"][name="date"]').forEach(input => { input.min = todayISO(); });
    document.querySelectorAll('input[name="dateOfBirth"]').forEach(input => {
      input.max = todayISO();
      const earliest = new Date();
      earliest.setFullYear(earliest.getFullYear() - 120);
      input.min = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, '0')}-${String(earliest.getDate()).padStart(2, '0')}`;
    });

    document.addEventListener('input', event => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.hasAttribute('data-digits-only')) {
        const max = Number(input.maxLength) > 0 ? Number(input.maxLength) : 10;
        input.value = input.value.replace(/\D/g, '').slice(0, max);
      }
      if (input.id === 'documentNumber' && $('#documentType')?.value === 'aadhaar') input.value = input.value.replace(/\D/g, '').slice(0, 12);
      if (input.matches('.otp-digit')) {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value) input.nextElementSibling?.focus();
      }
      if (input.name === 'confirm' || input.name === 'confirmPassword') {
        const password = $('[name="password"]', input.form);
        input.setCustomValidity(input.value && password && input.value !== password.value ? 'Passwords do not match.' : '');
      }
      if (input.name === 'password') {
        const confirm = $('[name="confirm"], [name="confirmPassword"]', input.form);
        if (confirm) confirm.setCustomValidity(confirm.value && confirm.value !== input.value ? 'Passwords do not match.' : '');
      }
    });
    document.addEventListener('keydown', event => {
      if (!event.target.matches('.otp-digit') || event.key !== 'Backspace' || event.target.value) return;
      event.target.previousElementSibling?.focus();
    });
    $('#documentType')?.addEventListener('change', event => {
      const number = $('#documentNumber');
      if (!number) return;
      if (event.target.value === 'aadhaar') {
        number.inputMode = 'numeric';
        number.pattern = '[0-9]{12}';
        number.minLength = 12;
        number.maxLength = 12;
        number.placeholder = '12-digit Aadhaar number';
        number.title = 'Enter exactly 12 digits.';
      } else {
        number.inputMode = 'text';
        number.pattern = '[A-Za-z0-9]{6,9}';
        number.minLength = 6;
        number.maxLength = 9;
        number.placeholder = '6–9 letter or number passport code';
        number.title = 'Enter 6–9 letters or numbers.';
      }
      number.value = '';
      number.focus();
    });

    document.querySelectorAll('form[data-flow]').forEach(form => form.addEventListener('submit', event => {
      const flow = form.dataset.flow;
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }
      if (flow === 'search') {
        if (!submitSearch(form)) event.preventDefault();
        else if (!session()) sessionStorage.setItem(RETURN_KEY, `${form.action.split('/').pop()}?${new URLSearchParams(new FormData(form))}`);
      }
      if (flow === 'passenger') {
        if (!submitPassenger(form)) event.preventDefault();
        else { event.preventDefault(); location.assign(form.action); }
      }
      if (flow === 'meals') sessionStorage.setItem('aerisgo-booking-meals', JSON.stringify(new FormData(form).getAll('meal')));
      if (flow === 'baggage') sessionStorage.setItem('aerisgo-booking-baggage', new FormData(form).get('extraBaggage') || '0');
      if (flow === 'forgot') {
        sessionStorage.setItem(RESET_EMAIL_KEY, new FormData(form).get('email'));
      }
      if (flow === 'confirm' && !form.elements.terms.checked) event.preventDefault();
      if (flow === 'checkin' && !form.elements.checkinConfirmed.checked) event.preventDefault();
    }));
  }

  function installAuthForms() {
    const signInForm = $('#signinForm');
    if (signInForm) {
      if (new URLSearchParams(location.search).has('expired')) {
        const message = $('#signinMessage');
        if (message) message.textContent = 'Your passenger session expired. Sign in again to continue.';
      }
      if (new URLSearchParams(location.search).has('reset')) {
        const message = $('#signinMessage');
        if (message) message.textContent = 'Password updated in this browser. Sign in with your new password.';
      }
      signInForm.addEventListener('submit', async event => {
        event.preventDefault();
        const email = $('#email').value.trim().toLowerCase();
        const password = $('#password').value;
        if (!signInForm.checkValidity()) { signInForm.reportValidity(); return; }
        const account = registeredUsers().find(user => user.email === email);
        let accepted = email === 'passenger@example.com' && password === 'passenger123' && !account;
        try {
          if (account?.salt && account?.passwordHash) accepted = (await passwordHash(password, account.salt)) === account.passwordHash;
        } catch { accepted = false; }
        if (!accepted) {
          $('#signinMessage').textContent = 'Demo sign-in did not match. Use the demo passenger account button.';
          return;
        }
        $('#signinMessage').textContent = '';
        setSession({ email, name: account?.name || 'Demo Passenger', role: 'passenger' });
        finishSignIn();
      });
    }

    const resetForm = $('#resetPasswordForm');
    if (resetForm) resetForm.addEventListener('submit', async event => {
      event.preventDefault();
      const password = $('[name="password"]', resetForm);
      const confirm = $('[name="confirmPassword"]', resetForm);
      if (!resetForm.checkValidity()) { resetForm.reportValidity(); return; }
      if (password.value !== confirm.value) { markInvalid(confirm, 'Passwords do not match.'); return; }
      const email = sessionStorage.getItem(RESET_EMAIL_KEY);
      try {
        const users = registeredUsers();
        let account = users.find(user => user.email === email);
        if (!account && email === 'passenger@example.com') {
          account = { email, name: 'Demo Passenger', role: 'passenger' };
          users.push(account);
        }
        if (!account) { location.replace('forgot-password.html'); return; }
        account.salt = saltValue();
        account.passwordHash = await passwordHash(password.value, account.salt);
        if (!writeJSON(localStorage, USERS_KEY, users)) throw new Error('Browser storage is unavailable.');
        sessionStorage.removeItem(RESET_EMAIL_KEY);
        location.replace('signin.html?reset=1');
      } catch (error) {
        $('#resetPasswordMessage').textContent = error.message || 'Could not save the new password in this browser.';
      }
    });

    const forgotForm = $('#forgotPasswordForm');
    if (forgotForm) forgotForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!forgotForm.checkValidity()) { forgotForm.reportValidity(); return; }
      const email = String(new FormData(forgotForm).get('email')).trim().toLowerCase();
      if (email !== 'passenger@example.com' && !registeredUsers().some(user => user.email === email)) {
        $('#forgotPasswordMessage').textContent = 'No passenger account uses that email in this browser.';
        return;
      }
      sessionStorage.setItem(RESET_EMAIL_KEY, email);
      location.assign('reset-password.html');
    });

    const signupForm = $('#signupForm');
    if (signupForm) signupForm.addEventListener('submit', async event => {
      event.preventDefault();
      const password = $('[name="password"]', signupForm);
      const confirm = $('[name="confirm"]', signupForm);
      if (!signupForm.checkValidity()) { signupForm.reportValidity(); return; }
      if (password.value !== confirm.value) { markInvalid(confirm, 'Passwords do not match.'); return; }
      const values = new FormData(signupForm);
      const email = values.get('email').trim().toLowerCase();
      if (email === 'passenger@example.com' || registeredUsers().some(user => user.email === email)) {
        $('#signupMessage').textContent = 'An account already uses this email. Sign in or use another email.';
        return;
      }
      let salt;
      let hash;
      try { salt = saltValue(); hash = await passwordHash(password.value, salt); }
      catch (error) { $('#signupMessage').textContent = error.message; return; }
      const pending = { name: values.get('name').trim(), email, phone: values.get('phone'), gender: values.get('gender'), salt, passwordHash: hash, createdAt: Date.now() };
      if (!writeJSON(sessionStorage, PENDING_KEY, pending)) {
        $('#signupMessage').textContent = 'This browser could not save your sign-up step. Please enable browser storage and try again.';
        return;
      }
      location.assign('verify-otp.html');
    });

    const otpForm = $('#otpForm');
    if (otpForm) otpForm.addEventListener('submit', event => {
      event.preventDefault();
      const code = [...document.querySelectorAll('.otp-digit')].map(input => input.value).join('');
      if (!otpForm.checkValidity()) { otpForm.reportValidity(); return; }
      if (code !== '123456') { $('#otpMessage').textContent = 'That code is not correct. Use the demo code shown above.'; return; }
      const pending = readJSON(sessionStorage, PENDING_KEY);
      if (!pending || Date.now() - pending.createdAt > 10 * 60 * 1000) {
        sessionStorage.removeItem(PENDING_KEY);
        location.replace('signup.html');
        return;
      }
      const users = registeredUsers();
      users.push({ email: pending.email, name: pending.name, phone: pending.phone, gender: pending.gender, role: 'passenger', salt: pending.salt, passwordHash: pending.passwordHash });
      if (!writeJSON(localStorage, USERS_KEY, users)) {
        $('#otpMessage').textContent = 'Could not save this demo account in browser storage.';
        return;
      }
      sessionStorage.removeItem(PENDING_KEY);
      setSession({ email: pending.email, name: pending.name, role: 'passenger' });
      location.replace('home-account.html');
    });
  }

  document.addEventListener('click', event => {
    const logout = event.target.closest('[data-session-logout]');
    if (!logout) return;
    event.preventDefault();
    sessionStorage.clear();
    location.assign('index.html');
  });

  document.addEventListener('pointerdown', touchSession, { passive: true });
  document.addEventListener('keydown', touchSession, { passive: true });
  window.addEventListener('pageshow', enforceSession);
  addValidation();
  installAuthForms();
  if (page === 'search-results.html') {
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || 'Ahmedabad';
    const to = params.get('to') || 'Mumbai';
    const date = params.get('date') || todayISO();
    const passengers = Number(params.get('passengers') || 1);
    const allowedCities = new Set(['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore']);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime());
    if (!allowedCities.has(from) || !allowedCities.has(to) || from === to || !validDate || date < todayISO() || !Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
      location.replace('home-account.html?invalidSearch=1');
    } else {
      $('#searchRoute').textContent = `${from} → ${to}`;
      $('#resultRoute').textContent = `${from} → ${to} · 1 Flight Found`;
      const formattedDate = new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
      $('#searchSummary').textContent = `${formattedDate} · ${passengers} Passenger${passengers === 1 ? '' : 's'}`;
    }
  }
  if (page === 'reset-password.html' && !sessionStorage.getItem(RESET_EMAIL_KEY)) location.replace('forgot-password.html');
  enforceSession();
})();
