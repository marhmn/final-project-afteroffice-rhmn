class YouTubeGamingPage {
  visit() {
    cy.visit(Cypress.expose('youtube_url') || 'https://www.youtube.com');
    cy.wait(3000);
  }

  goToGaming() {
    cy.get('ytd-guide-collapsible-section-entry-renderer, #expander-item')
      .contains('Show more')
      .should('be.visible')
      .click({ force: true });
    
    cy.wait(1000);

    cy.get('ytd-guide-entry-renderer')
      .contains('Gaming')
      .click({ force: true });

    cy.url().should('include', '/gaming');
    cy.wait(2000);
  }

  clickTrendingViewAll() {
    // 1. Scroll bertahap ke bawah hingga teks "Trending" atau "Trending videos" muncul
    cy.document().then(() => {
      const scrollStep = () => {
        return cy.get('body').then(($body) => {
          if ($body.text().includes('Trending')) {
            return;
          } else {
            cy.scrollTo(0, '+=' + 600);
            cy.wait(600);
            return scrollStep();
          }
        });
      };
      return scrollStep();
    });

    cy.wait(1500);

    // 2. Temukan elemen rak (shelf) atau header yang memuat teks "Trending"
    cy.contains('span', /Trending/i)
      .should('be.visible')
      .scrollIntoView({ block: 'center' });

    cy.wait(1000);

    // 3. Ambil kontainer header/rak tersebut, lalu cari tombol/link "View all" / "See all" / ikon panah navigasi
    cy.contains('span', /Trending/i)
      .closest('ytd-shelf-renderer, ytd-rich-section-renderer, div#dismissible')
      .then(($section) => {
        // Cari tombol "View all", "See all", atau tombol panah navigasi (endpoint/button) di header rak
        const $viewAllBtn = $section.find('a#endpoint, a.yt-simple-endpoint, button, a').filter((i, el) => {
          const text = Cypress.$(el).text().toLowerCase();
          return text.includes('view all') || text.includes('see all') || Cypress.$(el).has('iron-icon').length > 0;
        });

        if ($viewAllBtn.length > 0) {
          cy.wrap($viewAllBtn.first()).click({ force: true });
        } else {
          // Fallback: Klik elemen tautan pertama di area header jika tombol spesifik tidak berlabel teks
          cy.wrap($section).find('header a, #title-container a').first().click({ force: true });
        }
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

export default new YouTubeGamingPage();