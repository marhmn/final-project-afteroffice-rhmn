import 'cypress-mochawesome-reporter/register';

Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'webdriver', {
    get: () => undefined,
  });

  // Cegah pemutaran video otomatis dan nonaktifkan MediaSource agar browser tidak kehabisan RAM / crash
  try {
    delete win.MediaSource;
    delete win.WebKitMediaSource;
  } catch (e) {}

  try {
    if (win.HTMLMediaElement) {
      win.HTMLMediaElement.prototype.play = function () {
        this.pause();
        return Promise.resolve();
      };
    }
  } catch (e) {}
});

// Mengabaikan uncaught exceptions dari third-party script website publik (YouTube, Agoda, Amazon)
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});