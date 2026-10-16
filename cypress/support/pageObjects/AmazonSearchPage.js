class AmazonSearchPage {
  visit() {
    cy.visit(Cypress.expose('amazon_url') || 'https://www.amazon.com');
    cy.wait(3000);
  }

  searchItem(item) {
    cy.get('#twotabsearchtextbox')
      .should('be.visible')
      .type(item, { delay: 150 })
      .type('{enter}');
  }

  sortByHighestPrice() {
    cy.get('#s-result-sort-select', { timeout: 15000 })
      .should('be.visible')
      .scrollIntoView({ block: 'center' });
    
    cy.wait(1000);
    cy.get('#s-result-sort-select').select('price-desc-rank', { force: true });
    cy.wait(4000);
  }

  selectRightmostNonAdItem() {
    // 1. Scroll ke area grid utama agar produk termuat
    cy.get('.s-main-slot', { timeout: 15000 })
      .scrollIntoView({ block: 'start' });
    
    cy.wait(2000);

    // 2. Ambil semua item hasil pencarian yang valid (punya harga & bukan iklan)
    cy.get('.s-main-slot .s-result-item[data-component-type="s-search-result"]', { timeout: 15000 })
      .filter((index, element) => {
        const $el = Cypress.$(element);
        const hasPrice = $el.find('.a-price-whole').length > 0;
        const isSponsored = $el.find('.s-sponsored-label-info, [aria-label*="Sponsored"]').length > 0;
        return hasPrice && !isSponsored;
      })
      .then(($validItems) => {
        // Ambil elemen-elemen yang berada di baris pertama berdasarkan posisi vertikal (offset().top)
        const firstRowTop = $validItems.first().offset().top;
        const firstRowItems = $validItems.filter((i, el) => {
          // Toleransi selisih tinggi baris 20px
          return Math.abs(Cypress.$(el).offset().top - firstRowTop) < 20;
        });

        // Urutkan elemen baris pertama dari posisi kiri ke kanan (berdasarkan offset().left), 
        // lalu ambil yang paling kanan (elemen terakhir di baris pertama)
        const sortedRightToLeft = firstRowItems.toArray().sort((a, b) => {
          return Cypress.$(b).offset().left - Cypress.$(a).offset().left;
        });

        // Ambil elemen dengan posisi paling kanan
        const targetItem = Cypress.$(sortedRightToLeft[0]);

        // Scroll tepat ke elemen target
        cy.wrap(targetItem).scrollIntoView({ block: 'center' });
        cy.wait(1000);

        // Ambil Nama Produk
        cy.wrap(targetItem)
          .find('h2 a, h2 span, .a-text-normal')
          .first()
          .invoke('text')
          .then((text) => {
            cy.wrap(text.trim()).as('expectedTitle');
          });

        // Ambil Harga Utama (Tanpa Sen)
        cy.wrap(targetItem)
          .find('.a-price-whole')
          .first()
          .invoke('text')
          .then((text) => {
            const cleanPrice = text.replace(/[^0-9]/g, '');
            cy.wrap(cleanPrice).as('expectedPrice');
          });

        // Klik produk untuk menuju halaman detail
        cy.wrap(targetItem).find('h2 a, a.a-link-normal').first().click({ force: true });
      });
  }
}

export default new AmazonSearchPage();