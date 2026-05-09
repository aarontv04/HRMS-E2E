const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

    e2e: {
        baseUrl: 'https://localhost:7131/',//auth/login?ReturnUrl=%2F',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
