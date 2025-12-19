{
  "baseUrl": "http://localhost:3000",
  "viewportWidth": 1280,
  "viewportHeight": 720,
  "defaultCommandTimeout": 10000,
  "requestTimeout": 15000,
  "responseTimeout": 15000,
  "video": false,
  "screenshotOnRunFailure": true,
  "retries": {
    "runMode": 2,
    "openMode": 0
  },
  "env": {
    "apiUrl": "http://localhost:3000/api"
  },
  "e2e": {
    "setupNodeEvents": (on, config) => {
      // implement node event listeners here
    },
    "specPattern": "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    "supportFile": "cypress/support/e2e.js"
  }
}