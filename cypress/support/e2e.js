import 'cypress-mochawesome-reporter/register';

Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'webdriver', {
    get: () => undefined,
  });
});

// Mengabaikan error ResizeObserver dari aplikasi Agoda agar tidak menggagalkan test runner
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false; // Mencegah Cypress gagal karena error ResizeObserver
  }
  // Biarkan error lain tetap memunculkan kegagalan jika ada error serius
  return true;
});