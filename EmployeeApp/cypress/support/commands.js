// cypress/support/commands.js

/**
 * cy.login(username, password)
 * Logs in via the UI and caches the session.
 * After cy.login(), always call cy.visit('/') to restore the page context.
 */
Cypress.Commands.add('login', (username = 'admin', password = 'Admin@123') => {
    cy.session(
        [username, password],
        () => {
            cy.visit('/auth/login');
            cy.get('#username', { timeout: 10000 }).clear().type(username);
            cy.get('#password').clear().type(password);
            cy.get('button[type="submit"]').click();
            cy.url({ timeout: 10000 }).should('not.include', '/auth/login');
            cy.get('#app-shell', { timeout: 10000 }).should('exist');
        },
        {
            validate() {
                cy.request({ url: '/auth/me', failOnStatusCode: false })
                    .its('status').should('eq', 200);
            },
            cacheAcrossSpecs: true,
        }
    );
});

/**
 * cy.apiRequest(method, url, body?)
 * Makes an API request WITH the auth cookie attached automatically.
 * Use this instead of cy.request() for all authenticated API calls —
 * cy.request() does NOT send cookies by default unless they're set in the browser.
 */
Cypress.Commands.add('apiRequest', (method, url, body = null) => {
    // Get the auth cookie and attach it
    cy.getCookie('HRMSuite.Auth').then((cookie) => {
        const options = {
            method,
            url,
            failOnStatusCode: false,
            headers: cookie
                ? { Cookie: `HRMSuite.Auth=${cookie.value}` }
                : {},
        };
        if (body) options.body = body;
        return cy.request(options);
    });
});

/**
 * cy.loginViaApi(username, password)
 * Faster login via direct POST — use when UI login isn't being tested.
 */
Cypress.Commands.add('loginViaApi', (username = 'admin', password = 'Admin@123') => {
    cy.request({
        method: 'POST',
        url: '/auth/login',
        form: true,
        body: { username, password, rememberMe: false },
        followRedirect: true,
    });
});

/**
 * cy.logout()
 */
Cypress.Commands.add('logout', () => {
    cy.request({ url: '/auth/logout', followRedirect: false });
    cy.clearCookies();
});

/**
 * cy.navigateTo(route)
 * Waits for the SPA shell to mount, then clicks the sidebar nav item.
 */
Cypress.Commands.add('navigateTo', (route) => {
    cy.get('#app-shell', { timeout: 15000 }).should('exist');
    cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
    cy.get(`[data-route="${route}"]`, { timeout: 10000 }).should('be.visible').click();
    cy.get('#page-outlet', { timeout: 10000 }).should('be.visible');
});

/**
 * cy.waitForGrid()
 * Waits for DevExtreme DataGrid to exist and finish loading.
 * Avoids checking for loadpanel disappearance (it flashes too fast sometimes).
 */
Cypress.Commands.add('waitForGrid', () => {
    cy.get('.dx-datagrid', { timeout: 15000 }).should('exist');
    // Wait for rows OR no-data text — either means loading is done
    cy.get('.dx-data-row, .dx-datagrid-nodata', { timeout: 12000 }).should('exist');
});

/**
 * cy.fillDxInput(label, value)
 */
Cypress.Commands.add('fillDxInput', (label, value) => {
    cy.contains('.dx-field-item-label-text', label)
        .parents('.dx-field-item')
        .find('input')
        .clear()
        .type(value);
});

/**
 * cy.selectDxDropdown(label, optionText)
 */
Cypress.Commands.add('selectDxDropdown', (label, optionText) => {
    cy.contains('.dx-field-item-label-text', label)
        .parents('.dx-field-item')
        .find('.dx-selectbox input')
        .click();
    cy.get('.dx-list-item-content').contains(optionText).click();
});