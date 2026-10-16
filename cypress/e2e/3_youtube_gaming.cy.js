import YouTubeGamingPage from '../support/pageObjects/YouTubeGamingPage';

describe('YouTube Gaming Trending Navigation and Validation', () => {
  beforeEach(() => {
    YouTubeGamingPage.visit();
  });

  it('Should navigate via sidebar, show more, gaming, click view all trending, and validate 3rd video title and channel', () => {
    YouTubeGamingPage.goToGaming();
    YouTubeGamingPage.clickTrendingViewAll();
    YouTubeGamingPage.selectThirdTrendingVideo();

    // 1. Validasi ID Video pada URL Halaman Detail
    cy.get('@expectedVideoId').then((expectedVideoId) => {
      cy.url({ timeout: 10000 }).should('include', expectedVideoId);
    });

    // 2. Validasi Judul Video di Halaman Detail sama seperti di Trending Page
    cy.get('@expectedVideoTitle').then((expectedTitle) => {
      cy.get('h1.ytd-watch-metadata yt-formatted-string, #container > h1.ytd-watch-metadata, #above-the-fold #title h1', { timeout: 10000 })
        .should('be.visible')
        .invoke('text')
        .then((detailTitle) => {
          const cleanDetailTitle = detailTitle.replace(/\s+/g, ' ').trim();
          const cleanExpectedTitle = expectedTitle.replace(/\s+/g, ' ').trim();
          expect(cleanDetailTitle.toLowerCase()).to.include(cleanExpectedTitle.toLowerCase());
        });
    });

    // Validasi Nama Channel
    cy.get('@expectedChannelName').then((expectedChannel) => {
      cy.get('#upload-info #text.ytd-channel-name a, #owner #text-container yt-formatted-string a', { timeout: 10000 })
        .filter(':visible')
        .first()
        .invoke('text')
        .then((detailChannel) => {
          const cleanDetailChannel = detailChannel.replace(/\s+/g, ' ').trim();
          const cleanExpectedChannel = expectedChannel.replace(/\s+/g, ' ').trim();
          
          expect(cleanDetailChannel).to.equal(cleanExpectedChannel);
        });
    });
  });
});