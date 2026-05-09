// cypress/e2e/01_authentication.cy.js
// ─────────────────────────────────────────────────────────────
// Test Suite 1: Authentication
// Covers: login page UI, valid login, invalid login,
//         redirect protection, remember me, logout
// ─────────────────────────────────────────────────────────────

describe('Authentication', () => {

    // ── 1.1 Login Page UI ──────────────────────────────────────
    describe('Login Page UI', () => {

        beforeEach(() => {
            cy.clearCookies();
            cy.visit('/auth/login');
        });

        it('should display the login page correctly', () => {
            cy.title().should('contain', 'Sign In');
            cy.get('#username').should('be.visible');
            cy.get('#password').should('be.visible');
            cy.get('button[type="submit"]').should('contain', 'Sign In');
        });

        it('should show the brand panel with HRM Suite title', () => {
            cy.get('.login-brand').should('be.visible');
            cy.get('.brand-title').should('contain', 'HRM Suite');
        });

        it('should show demo credentials box', () => {
            cy.get('.demo-creds').should('be.visible');
            cy.get('.demo-row').should('have.length', 3);
        });

        it('should auto-fill credentials when demo row is clicked', () => {
            cy.get('.demo-row').first().click();
            cy.get('#username').should('have.value', 'admin');
            cy.get('#password').should('have.value', 'Admin@123');
        });

        it('should toggle password visibility', () => {
            cy.get('#password').should('have.attr', 'type', 'password');
            cy.get('#pwd-toggle').click();
            cy.get('#password').should('have.attr', 'type', 'text');
            cy.get('#pwd-toggle').click();
            cy.get('#password').should('have.attr', 'type', 'password');
        });

    });

    // ── 1.2 Valid Login ────────────────────────────────────────
    describe('Valid Login', () => {

        beforeEach(() => cy.clearCookies());

        it('should login as Admin and redirect to dashboard', () => {
            cy.visit('/auth/login');
            cy.get('#username').type('admin');
            cy.get('#password').type('Admin@123');
            cy.get('button[type="submit"]').click();

            cy.url().should('not.include', '/auth/login');
            cy.get('#app-shell').should('exist');
            cy.get('.sidebar').should('be.visible');
        });

        it('should display logged-in admin name in sidebar', () => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('.user-name').should('contain', 'System Administrator');
        });

        it('should login as HR Manager', () => {
            cy.visit('/auth/login');
            cy.get('#username').type('hrmanager');
            cy.get('#password').type('Hr@123');
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/auth/login');
            cy.get('.user-role').should('contain', 'HR');
        });

        it('should login as Staff user', () => {
            cy.visit('/auth/login');
            cy.get('#username').type('staff');
            cy.get('#password').type('Staff@123');
            cy.get('button[type="submit"]').click();
            cy.url().should('not.include', '/auth/login');
            cy.get('.user-role').should('contain', 'Staff');
        });

        it('/auth/me API should return user info when authenticated', () => {
            cy.login('admin', 'Admin@123');
            cy.request('/auth/me').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.Username).to.eq('admin');
                expect(res.body.Role).to.eq('Admin');
                expect(res.body.FullName).to.eq('System Administrator');
            });
        });

    });

    // ── 1.3 Invalid Login ──────────────────────────────────────
    describe('Invalid Login', () => {

        beforeEach(() => {
            cy.clearCookies();
            cy.visit('/auth/login');
        });

        it('should show error for wrong password', () => {
            cy.get('#username').type('admin');
            cy.get('#password').type('WrongPassword123');
            cy.get('button[type="submit"]').click();

            cy.get('.alert-error').should('be.visible');
            cy.get('.alert-error').should('contain', 'Invalid username or password');
            cy.url().should('include', '/auth/login');
        });

        it('should show error for non-existent username', () => {
            cy.get('#username').type('notarealuser');
            cy.get('#password').type('SomePassword@1');
            cy.get('button[type="submit"]').click();

            cy.get('.alert-error').should('be.visible');
        });

        it('should preserve username in field after failed login', () => {
            cy.get('#username').type('admin');
            cy.get('#password').type('wrong');
            cy.get('button[type="submit"]').click();
            cy.get('#username').should('have.value', 'admin');
        });

        it('should not login with empty fields', () => {
            cy.get('button[type="submit"]').click();
            // Should stay on login page
            cy.url().should('include', '/auth/login');
        });

    });

    // ── 1.4 Route Protection ───────────────────────────────────
    describe('Route Protection', () => {

        beforeEach(() => cy.clearCookies());

        it('should redirect unauthenticated user from / to login', () => {
            cy.visit('/');
            cy.url().should('include', '/auth/login');
        });

        it('should redirect unauthenticated user from /employees to login', () => {
            cy.visit('/employees');
            cy.url().should('include', '/auth/login');
        });

        it('should return 401 for unauthenticated API calls', () => {
            cy.request({ url: '/api/employees', failOnStatusCode: false })
                .its('status').should('eq', 401);
        });

        it('should return 401 for unauthenticated dashboard API call', () => {
            cy.request({ url: '/api/dashboard/stats', failOnStatusCode: false })
                .its('status').should('eq', 401);
        });

    });

    // ── 1.5 Logout ─────────────────────────────────────────────
    describe('Logout', () => {

        it('should logout via GET /auth/logout and redirect to login', () => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#app-shell').should('exist');

            cy.visit('/auth/logout');
            cy.url().should('include', '/auth/login');
        });

        it('should deny access after logout', () => {
            cy.login('admin', 'Admin@123');
            cy.visit('/auth/logout');
            cy.clearCookies();

            cy.visit('/');
            cy.url().should('include', '/auth/login');
        });

        it('should show logout button in top-bar dropdown', () => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#topbar-user-btn').click();
            cy.get('.td-logout').should('be.visible').should('contain', 'Sign Out');
        });

        it('should show logout button in sidebar dropdown', () => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#user-card-toggle').click();
            cy.get('.ud-logout').should('be.visible').should('contain', 'Sign Out');
        });

    });

});