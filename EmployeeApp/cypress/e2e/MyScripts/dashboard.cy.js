// cypress/e2e/02_dashboard.cy.js

describe('Dashboard', () => {

    before(() => {
        cy.login('admin', 'Admin@123');
    });

    beforeEach(() => {
        // Visit root and explicitly wait for the SPA shell before navigating
        cy.visit('/');
        cy.get('#app-shell', { timeout: 15000 }).should('exist');
        cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
        cy.navigateTo('dashboard');
    });

    describe('Page Load', () => {

        it('should load the dashboard without errors', () => {
            cy.get('#page-outlet').should('be.visible');
            cy.contains('Failed to load dashboard').should('not.exist');
        });

        it('should highlight Dashboard as active nav item', () => {
            cy.get('[data-route="dashboard"]', { timeout: 10000 }).should('have.class', 'active');
        });

        it('should show Dashboard in breadcrumb', () => {
            cy.get('#breadcrumb').should('contain', 'Dashboard');
        });

    });

    describe('Stats API', () => {

        it('should return valid stats from /api/dashboard/stats', () => {
            cy.request('/api/dashboard/stats').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.have.property('TotalEmployees');
                expect(res.body).to.have.property('ActiveEmployees');
                expect(res.body).to.have.property('OnLeave');
                expect(res.body).to.have.property('PendingLeave');
                expect(res.body).to.have.property('AttendancePct');
                expect(res.body).to.have.property('DeptBreakdown');
                expect(res.body).to.have.property('PayrollTrend');
                expect(res.body.TotalEmployees).to.be.a('number').and.be.greaterThan(0);
                expect(res.body.DeptBreakdown).to.be.an('array');
                expect(res.body.PayrollTrend).to.be.an('array');
            });
        });

        it('should have ActiveEmployees <= TotalEmployees', () => {
            cy.request('/api/dashboard/stats').then((res) => {
                expect(res.body.ActiveEmployees).to.be.lte(res.body.TotalEmployees);
            });
        });

        it('should have attendance percentage between 0 and 100', () => {
            cy.request('/api/dashboard/stats').then((res) => {
                expect(res.body.AttendancePct).to.be.within(0, 100);
            });
        });

    });

    describe('UI Elements', () => {

        it('should display stat cards', () => {
            cy.get('.stat-card, .stats-card, [class*="stat"]').should('have.length.gte', 1);
        });

        it('should display at least one chart', () => {
            cy.get('.dx-chart, .dxc-chart, canvas, [class*="chart"]', { timeout: 8000 })
                .should('have.length.gte', 1);
        });

    });

});