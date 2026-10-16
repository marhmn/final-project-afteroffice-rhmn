class YoutubeGamingPage {
  visit() {
    // Set cookie YouTube agar selalu berbahasa Inggris (hl=en)
    cy.setCookie('PREF', 'hl=en&gl=US', { domain: '.youtube.com' });

    cy.visit(Cypress.expose('youtube_url') || 'https://www.youtube.com');
    cy.wait(3000);
  }

  goToGaming() {
    // Klik link Gaming pada sidebar secara langsung tanpa memicu crash expander animasi
    cy.get('body').then(($body) => {
      const gLink = $body.find('a[href*="/gaming"]');
      if (gLink.length > 0) {
        gLink[0].click();
      } else {
        // Fallback jika belum ter-render: navigasi via Cypress visit URL
        cy.visit((Cypress.expose('youtube_url') || 'https://www.youtube.com') + '/gaming');
      }
    });

    cy.url({ timeout: 15000 }).should('include', '/gaming');
    cy.wait(2000);
  }

  clickTrendingViewAll() {
    // 1. Scroll sedikit ke bawah agar shelf termuat
    cy.scrollTo(0, 500);
    cy.wait(1500);

    // 2. Temukan shelf atau header yang memuat teks "Trending"
    cy.contains(/Trending/i, { timeout: 15000 })
      .scrollIntoView({ block: 'center' });

    cy.wait(1000);

    // 3. Klik tombol/link "View all" / "Lihat semua" di shelf Trending
    cy.get('body').then(($body) => {
      const $section = $body.find('ytd-shelf-renderer:contains("Trending"), ytd-rich-section-renderer:contains("Trending"), div#dismissible:contains("Trending")');
      if ($section.length > 0) {
        const $viewAllBtn = $section.find('a#endpoint, a.yt-simple-endpoint, button, a').filter((i, el) => {
          const text = Cypress.$(el).text().toLowerCase();
          return text.includes('view all') || text.includes('see all') || text.includes('semua') || text.includes('lihat') || Cypress.$(el).has('iron-icon').length > 0;
        });

        if ($viewAllBtn.length > 0) {
          cy.wrap($viewAllBtn.first()).click({ force: true });
          return;
        }
      }

      // Fallback: klik link yang memiliki teks View all / Lihat semua
      cy.contains(/View all|See all|Lihat semua/i, { timeout: 10000 })
        .first()
        .click({ force: true });
    });

    cy.wait(3000);
  }

  selectThirdTrendingVideo() {
    // 1. Ambil kartu video ke-3 dari daftar Trending
    cy.get('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer', { timeout: 15000 })
      .should('have.length.greaterThan', 2)
      .eq(2)
      .then(($videoCard) => {

        // 2. Ambil dan simpan ID Video dari link mana pun yang mengandung /watch
        cy.wrap($videoCard)
          .find('a[href*="/watch"]')
          .first()
          .invoke('attr', 'href')
          .then((hrefUrl) => {
            const videoId = hrefUrl.includes('v=') ? hrefUrl.split('v=')[1]?.split('&')[0] : hrefUrl;
            cy.wrap(videoId).as('expectedVideoId');
          });

        // 3. Ambil dan simpan Judul Video dari kartu Trending
        cy.wrap($videoCard)
          .find('#video-title, #video-title-link, a#video-title, yt-formatted-string#video-title')
          .first()
          .invoke('text')
          .then((titleText) => {
            const cleanTitle = titleText.replace(/\s+/g, ' ').trim();
            cy.wrap(cleanTitle).as('expectedVideoTitle');
          });

        // 4. Ambil dan simpan Nama Channel (fleksibel menggunakan wildcard selector)
        cy.wrap($videoCard)
          .find('#channel-name a, ytd-channel-name a, #text-container, #text.ytd-channel-name')
          .first()
          .invoke('text')
          .then((channelText) => {
            const cleanChannel = channelText.replace(/\s+/g, ' ').trim();
            cy.wrap(cleanChannel).as('expectedChannelName');
          });

        // 4. Buka video menggunakan metode klik Native JS langsung pada elemen tautan/thumbnail
        const linkElement = $videoCard.find('a[href*="/watch"], #thumbnail')[0];
        if (linkElement) {
          linkElement.click();
        } else {
          $videoCard[0].click();
        }
      });

    cy.wait(4000);

    // 5. Tangani pop-up YouTube Premium ("No thanks") jika muncul
    cy.get('body').then(($body) => {
      if ($body.find('yt-button-renderer:contains("No thanks"), button:contains("No thanks"), paper-button:contains("No thanks")').length > 0) {
        cy.contains('yt-button-renderer, button, paper-button', /No thanks|Dismiss/i)
          .first()
          .click({ force: true });
        cy.wait(1500);
      }
    });
  }
}

export default new YoutubeGamingPage();