import AgodaFlightPage from '../support/pageObjects/AgodaFlightPage';

describe('Agoda Flight Booking Test - End-to-End Scenario', () => {
  it('Should complete flight search, passenger input from fixture, and validate data on payment page', () => {
    
    // Muat data dari cypress/fixtures/passenger.json
    cy.fixture('passenger').then((passengerInfo) => {

      // 1. Visit URL & Select Flight Tab
      AgodaFlightPage.visit();
      AgodaFlightPage.goToFlights();

      // 2. Search Flights (Jakarta to Singapore - Tomorrow, Passenger)
      AgodaFlightPage.searchFlightDetails();

      // 3. Filter Malaysia Airlines & Select Flight
      AgodaFlightPage.filterAndSelectFlight();

      // 4. Fill Passenger Details from fixture data, Check Terms, and Click Continue to Payment
      AgodaFlightPage.fillPassengerDetails(passengerInfo);

      // 5. Expect total price, passenger data, departure time, and arrival time on payment page
      AgodaFlightPage.verifyPaymentPageDetails();

    });
  });
});