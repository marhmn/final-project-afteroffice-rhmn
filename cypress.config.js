const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          // Optimasi memori agar browser tidak kehabisan RAM / crash
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--js-flags=--max-old-space-size=2048');
        }
        return launchOptions;
      });
    },
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      reportPageTitle: 'Final Project Cypress Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 10000,
    video: true,
    videosFolder: 'cypress/reports/videos',
    numTestsKeptInMemory: 0,
    blockHosts: [
      '*google-analytics.com',
      '*googletagmanager.com',
      '*doubleclick.net',
      '*clarity.ms'
    ],
  },
  expose: {
    agoda_url: 'https://www.agoda.com',
    amazon_url: 'https://www.amazon.com',
    youtube_url: 'https://www.youtube.com'
  }
});