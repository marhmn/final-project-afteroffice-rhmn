class AgodaFlightPage {
  // 1. Visit URL Agoda & Handle Pop-up
  visit() {
    cy.visit(Cypress.expose('agoda_url') || 'https://www.agoda.com', {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' }
    });
    cy.wait(3000);

    // Close cookie / sign-in pop-up if exists
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Close"], button:contains("Accept"), div[aria-modal="true"] button').length > 0) {
        cy.get('button[aria-label="Close"], button:contains("Accept")').first().click({ force: true });
        cy.wait(1000);
      }
    });
  }

  // 2. Select Flight Tab
  goToFlights() {
    // Cari langsung elemen apa pun yang memiliki teks "Flights" atau atribut link penerbangan
    cy.contains('a, span, div, [role="tab"]', /^Flights$/i, { timeout: 15000 })
      .first()
      .scrollIntoView({ block: 'center' })
      .click({ force: true });

    cy.wait(3000);
  }

  // 3. Input From Jakarta, To Singapore, Date Tomorrow, Passenger, Search
  searchFlightDetails() {
    // 1. Hitung tanggal besok secara dinamis untuk format data-testid Agoda (contoh: "Friday, October 16th, 2026")
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[tomorrow.getDay()];
    const monthName = months[tomorrow.getMonth()];
    const dayNum = tomorrow.getDate();
    const year = tomorrow.getFullYear();

    const getOrdinalSuffix = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };

    const tomorrowTestId = `${dayName}, ${monthName} ${dayNum}${getOrdinalSuffix(dayNum)}, ${year}`;

    // 2. Flying From: Jakarta
    cy.get('input[aria-label*="Origin"], input[placeholder*="From"], [data-selenium="flight-origin-search-input"]')
      .first()
      .click({ force: true })
      .clear({ force: true })
      .type('Jakarta', { delay: 100 });
    cy.wait(1500);
    cy.get('li, div[role="option"], ul div').contains(/Jakarta|CGK/i).first().click({ force: true });

    // 3. Flying To: Singapura
    cy.get('input[aria-label*="Destination"], input[placeholder*="To"], [data-selenium="flight-destination-search-input"]')
      .first()
      .click({ force: true })
      .clear({ force: true })
      .type('Singapura', { delay: 100 });
    cy.wait(1500);
    cy.get('li, div[role="option"], ul div').contains(/Singapore|Singapura|SIN/i).first().click({ force: true });

    // Tutup dropdown destinasi
    cy.get('body').type('{esc}');
    cy.wait(1000);

    // 4. Klik Departure menggunakan selektor spesifik Anda, lalu langsung pilih tanggal besok secara dinamis
    cy.get('#flight-departure > .Box-sc-kv6pi1-0 > .IconBox__child > .SearchBoxTextDescription > .SearchBoxTextDescription__title')
      .first()
      .click({ force: true })
      .then(() => {
        cy.get(`[data-testid="${tomorrowTestId}"]`, { timeout: 10000 })
          .first()
          .click({ force: true });
      });

    // 5. Click Passenger / Occupancy
    cy.get('[data-element-name="flight-search-occupancy"], [data-selenium="flight-occupancy-search-input"], div:contains("Passenger")', { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.wait(1000);

    // Tutup Modal Passenger jika muncul tombol Done/Selesai
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Done"), button:contains("Selesai"), button:contains("Apply")').length > 0) {
        cy.contains('button', /Done|Selesai|Apply/i).click({ force: true });
      }
    });

    // 6. Click Search Flights Menggunakan Selektor Spesifik Anda
    cy.get('#Tabs-Container > .a07fe-bg-product-primary > .a07fe-box > .sc-aXZVg', { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.wait(7000);
  }

  // 4. Show All Airlines, Check Malaysia Airlines, Select First Price Row, Scroll Down, Click Select
  filterAndSelectFlight() {
    // 1. Klik tombol atau opsi untuk memperlihatkan semua pilihan maskapai (Show all airlines)
    cy.get('[data-testid="show-all-flight-filter-item-airline"] > .sc-aXZVg', { timeout: 15000 })
      .first()
      .click({ force: true });

    cy.wait(1500);

    // 2. Pilih checkbox Malaysia Airlines secara spesifik
    cy.get('span, label, div')
      .contains(/Malaysia Airlines/i)
      .first()
      .click({ force: true });

    cy.wait(2000);

    // Target the first flight card (Baris Pertama)
    cy.get(':nth-child(1) > [data-testid="web-refresh-flights-card"] > .a07fe-border-generic-base-subtle > [data-testid="flightCard-flight-detail"]', { timeout: 15000 })
      .first()
      .then(($card) => {
        const text = $card.text();
        const times = text.match(/\d{1,2}:\d{2}/g);
        if (times && times.length >= 2) {
          cy.wrap(times[0]).as('departureTime');
          cy.wrap(times[1]).as('arrivalTime');
        }
      })
      .click({ force: true });

    cy.wait(5000);

    // Scroll down a bit and click Select
    cy.scrollTo(0, 300);
    cy.get('button:contains("Select"), button:contains("Pilih"), button[data-selenium="select-button"]')
      .first()
      .click({ force: true });

    cy.wait(6000);
  }

  // 5. Fill Passenger Details Form
  fillPassengerDetails() {
    cy.fixture('passenger').then((data) => {
      // --- Bagian Kontak (Contact Details) ---
      cy.get('[data-testid="contact.contactFirstName"]', { timeout: 15000 })
        .scrollIntoView()
        .clear({ force: true })
        .type(data.firstName, { force: true });

      cy.get('[data-testid="contact.contactLastName"]')
        .clear({ force: true })
        .type(data.lastName, { force: true });

      cy.get('[data-testid="contact.contactEmail"]')
        .clear({ force: true })
        .type(data.email, { force: true });

      cy.get('[data-testid="contact.contactPhoneNumber-PhoneNumberDataTestId"]')
        .clear({ force: true })
        .type(data.phoneNumber, { force: true });

      // --- Bagian Data Penumpang (Passenger Details) ---
      cy.get('[data-testid="flight.forms.i0.units.i0.passengerFirstName"]')
        .clear({ force: true })
        .type(data.firstName, { force: true });

      cy.get('[data-testid="flight.forms.i0.units.i0.passengerLastName"]')
        .clear({ force: true })
        .type(data.lastName, { force: true });

      // --- Pemilihan Gender (Male / Female) ---
      cy.get('div, span, button, label')
        .contains(new RegExp(`^${data.gender}$`, 'i'))
        .first()
        .click({ force: true });

      // Tanggal Lahir (DOB)
      cy.get('[data-testid="flight.forms.i0.units.i0.passengerDateOfBirth-DateInputDataTestId"]')
        .clear({ force: true })
        .type(data.birthDay, { force: true });

      // Tanggal Lahir (DOB) - Bulan (Dropdown)
      cy.get('[data-testid="flight.forms.i0.units.i0.passengerDateOfBirth-MonthInputDataTestId"] > :nth-child(1) > :nth-child(1) > .a07fe-items-center.a07fe-flex-1 > .FormFieldstyled__InputContainerStyled-sc-11x6xcu-2 > .a07fe-pt-0 > .a07fe-bg-generic-base-transparent > .a07fe-flex-1 > .sc-aXZVg')
        .click({ force: true });
      cy.wait(500);
      cy.get('div, span, button')
        .contains(new RegExp(`^${data.birthMonth}$`, 'i'))
        .first()
        .click({ force: true });

      cy.get('[data-testid="flight.forms.i0.units.i0.passengerDateOfBirth-YearInputDataTestId"]')
        .clear({ force: true })
        .type(data.birthYear, { force: true });

      // --- Kebangsaan (Nationality) - Menggunakan Selector Spesifik ---
      cy.get('[data-testid="flight.forms.i0.units.i0.passengerNationality"] > :nth-child(1) > :nth-child(1) > .a07fe-items-center.a07fe-flex-1 > .FormFieldstyled__InputContainerStyled-sc-11x6xcu-2 > .a07fe-pt-0 > .a07fe-bg-generic-base-transparent > .a07fe-flex-1 > .sc-aXZVg')
        .scrollIntoView()
        .click({ force: true });
      cy.wait(500);
      cy.get('input[type="text"], input[role="combobox"], input')
        .filter(':visible')
        .last()
        .type(data.nationality, { force: true });
      cy.wait(1000);
      cy.get('.a07fe-pr-12 > .Inputstyled__InputContainerStyled-sc-1yd74ix-0 > .a07fe-w-full > .Inputstyled__OverlayStyled-sc-1yd74ix-2', { timeout: 10000 })
        .first()
        .click({ force: true });

      // --- Bagian Paspor (Passport Details) ---
      cy.get('[data-testid="flight.forms.i0.units.i0.passportNumber"]')
        .scrollIntoView()
        .clear({ force: true })
        .type(data.passportNumber, { force: true });

      // --- Negara Penerbit Paspor (Country of Issue) ---
      cy.get('[data-testid="flight.forms.i0.units.i0.passportCountryOfIssue"] > :nth-child(1) > :nth-child(1) > .a07fe-items-center.a07fe-flex-1 > .FormFieldstyled__InputContainerStyled-sc-11x6xcu-2 > .a07fe-pt-0 > .a07fe-bg-generic-base-transparent > .a07fe-flex-1')
        .click({ force: true });
      cy.wait(500);
      cy.get('input[type="text"], input[role="combobox"], input')
        .filter(':visible')
        .last()
        .type(data.passportCountry, { force: true });
      cy.wait(1000);
      cy.get('.a07fe-pr-12 > .Inputstyled__InputContainerStyled-sc-1yd74ix-0 > .a07fe-w-full > .Inputstyled__OverlayStyled-sc-1yd74ix-2', { timeout: 10000 })
        .first()
        .click({ force: true });

      // Masa Berlaku Paspor (Passport Expiry)
      cy.get('[data-testid="flight.forms.i0.units.i0.passportExpiryDate-DateInputDataTestId"]')
        .clear({ force: true })
        .type(data.expiryDay, { force: true });

      // Expiry Month
      cy.get('[data-testid="flight.forms.i0.units.i0.passportExpiryDate-MonthInputDataTestId"] > :nth-child(1) > :nth-child(1) > .a07fe-items-center.a07fe-flex-1 > .FormFieldstyled__InputContainerStyled-sc-11x6xcu-2 > .a07fe-pt-0 > .a07fe-bg-generic-base-transparent > .a07fe-flex-1 > .sc-aXZVg')
        .click({ force: true });
      cy.wait(500);
      cy.get('div, span, button')
        .contains(new RegExp(`^${data.expiryMonth}$`, 'i'))
        .first()
        .click({ force: true });

      cy.get('[data-testid="flight.forms.i0.units.i0.passportExpiryDate-YearInputDataTestId"]')
        .clear({ force: true })
        .type(data.expiryYear, { force: true });
    });

    cy.wait(2000);

    // --- Scroll ke Paling Bawah ---
    cy.scrollTo('bottom', { ensureScrollable: false });
    cy.wait(1000);

    // Simpan Total Harga pada halaman passenger detail sebelum lanjut pembayaran
    cy.get('body').then(($body) => {
      const priceEls = $body.find('[data-testid*="price"], [class*="price"], [class*="Price"]');
      if (priceEls.length > 0) {
        const pText = priceEls.last().text().replace(/[^0-9]/g, '');
        if (pText) {
          cy.wrap(pText).as('passengerDetailPrice');
        }
      }
    });

    // Check "I agree" checkbox
    cy.get('.a07fe-py-8 > .a07fe-fill-generic-base-default > .Inputstyled__InputContainerStyled-sc-1yd74ix-0 > .a07fe-w-full > .Inputstyled__InputStyled-sc-1yd74ix-1', { timeout: 10000 })
      .scrollIntoView()
      .click({ force: true });

    // Click "Continue to payment"
    cy.contains('button', /Continue to payment/i)
      .first()
      .click({ force: true });

    cy.wait(4000);

    // Elemen tambahan setelah Continue to payment
    cy.get('.a07fe-items-baseline > .a07fe-bg-generic-base-transparent > .a07fe-box > .sc-aXZVg', { timeout: 15000 })
      .scrollIntoView()
      .click({ force: true });

    cy.wait(6000);
  }

  // 6. Validate Payment Page Data
  verifyPaymentPageDetails() {
    cy.fixture('passenger').then((data) => {
      // 1. Validasi Detail Penumpang (Nama Lengkap)
      cy.contains(new RegExp(`${data.firstName}.*${data.lastName}`, 'i'), { timeout: 15000 })
        .should('be.visible');

      // 2. Validasi Total Harga (Pastikan elemen harga muncul di halaman pembayaran)
      cy.get('[data-testid*="price"], [class*="price"], [class*="Price"]', { timeout: 10000 })
        .should('be.visible');

      // 3. Validasi Waktu Keberangkatan & Kedatangan (Departure & Arrival Time)
      cy.get('div, span, p')
        .contains(/\d{1,2}:\d{2}/)
        .should('be.visible');
    });

    cy.screenshot('payment-page-validation');
  }
}

export default new AgodaFlightPage();