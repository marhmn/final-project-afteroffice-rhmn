import AmazonSearchPage from '../support/pageObjects/AmazonSearchPage';

describe('Amazon Chair Search and Validation', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    AmazonSearchPage.visit();
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('Should search chair, sort by highest price, pick rightmost non-ad item, and validate title and price', () => {
    AmazonSearchPage.searchItem('chair');
    AmazonSearchPage.sortByHighestPrice();
    AmazonSearchPage.selectRightmostNonAdItem();

    // Validasi Judul
    cy.get('@expectedTitle').then((title) => {
      cy.get('#productTitle').should('contain', title);
    });

    // Validasi Harga (Gunakan selector spesifik untuk harga utama produk di halaman detail)
    cy.get('@expectedPrice').then((price) => {
      cy.get('.apexPriceToPay .a-price-whole, #corePriceDisplay_desktop_feature_div .a-price-whole')
        .first()
        .invoke('text')
        .then((detailPriceText) => {
          const detailCleanPrice = detailPriceText.replace(/[^0-9]/g, '');
          expect(detailCleanPrice).to.equal(price);
        });
    });
  });
});