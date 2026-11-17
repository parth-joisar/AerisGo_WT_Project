const demoPassengerButton = document.querySelector('#demoPassengerButton');

demoPassengerButton.addEventListener('click', () => {
  document.querySelector('#email').value = 'passenger@example.com';
  const hasResetPassword = (() => {
    try {
      return (JSON.parse(localStorage.getItem('aerisgo-passenger-demo-users') || '[]'))
        .some(user => user.email === 'passenger@example.com' && user.passwordHash);
    } catch { return false; }
  })();
  document.querySelector('#password').value = hasResetPassword ? '' : 'passenger123';
  document.querySelector('#demoPassengerStatus').textContent = 'Demo details filled. Click Sign in to continue.';
  if (hasResetPassword) document.querySelector('#demoPassengerStatus').textContent = 'Demo email filled. Enter the password you set, then click Sign in.';
});
