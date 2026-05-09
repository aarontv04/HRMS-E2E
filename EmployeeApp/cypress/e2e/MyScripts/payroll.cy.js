// cypress/e2e/04_payroll.cy.js
// ─────────────────────────────────────────────────────────────
// Test Suite 4: Payroll
// Covers: list, create, approve, pay workflow, delete
// ─────────────────────────────────────────────────────────────

describe('Payroll', () => {

    let createdPayrollId = null;
    let testEmployeeId = null;

    before(() => {
        cy.login('admin', 'Admin@123');
        cy.visit('/');
        // Get a valid employee ID for payroll tests using authenticated request
        cy.apiRequest('GET', '/api/employees').then((res) => {
            expect(res.status).to.eq(200);
            testEmployeeId = res.body[0].EmployeeId;
        });
    });

    // ── 4.1 Payroll List UI ────────────────────────────────────
    describe('Payroll List', () => {

        beforeEach(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#app-shell', { timeout: 15000 }).should('exist');
            cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
            cy.navigateTo('payroll');
            cy.waitForGrid();
        });

        it('should load the payroll page', () => {
            cy.get('#page-outlet').should('be.visible');
            cy.contains('Payroll').should('be.visible');
        });

        it('should display payroll DataGrid', () => {
            cy.get('.dx-datagrid').should('exist');
        });

        it('should show Process Payroll button', () => {
            cy.contains(/process payroll|new payroll|add payroll/i).should('be.visible');
        });

    });

    // ── 4.2 Payroll List API ───────────────────────────────────
    describe('Payroll List API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('GET /api/payroll should return payroll records', () => {
            cy.apiRequest('GET', '/api/payroll').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should filter payroll by employee ID', () => {
            cy.apiRequest('GET', `/api/payroll?employeeId=${testEmployeeId}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
                res.body.forEach((r) => {
                    expect(r.EmployeeId).to.eq(testEmployeeId);
                });
            });
        });

        it('should filter payroll by year', () => {
            const year = new Date().getFullYear();
            cy.apiRequest('GET', `/api/payroll?year=${year}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('each payroll record should have required fields', () => {
            cy.apiRequest('GET', '/api/payroll').then((res) => {
                if (res.body.length > 0) {
                    const record = res.body[0];
                    expect(record).to.have.property('PayrollId');
                    expect(record).to.have.property('EmployeeId');
                    expect(record).to.have.property('BasicSalary');
                    expect(record).to.have.property('NetPay');
                    expect(record).to.have.property('GrossPay');
                    expect(record).to.have.property('Status');
                }
            });
        });

    });

    // ── 4.3 Create Payroll ─────────────────────────────────────
    describe('Create Payroll via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should create a new payroll record and return 201', () => {
            cy.apiRequest('POST', '/api/payroll', {
                EmployeeId: testEmployeeId,
                BasicSalary: 50000,
                RegularHours: 160,
                OvertimeHours: 0,
                OvertimeRate: 1.5,
                Bonus: 0,
                Commission: 0,
                FederalTax: 5000,
                StateTax: 2000,
                SocialSecurity: 3100,
                Medicare: 725,
                HealthInsurance: 250,
                Retirement401k: 1500,
                OtherDeductions: 0,
                HourlySalary: 312.5,
                GrossPay: 50000,
                TotalDeductions: 12575,
                NetPay: 37425,
                PayPeriodStart: '2025-01-01',
                PayPeriodEnd: '2025-01-31',
                PayDate: '2025-02-01',
                Status: 'Draft',
            }).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.PayrollId).to.be.a('number').and.greaterThan(0);
                expect(res.body.Status).to.eq('Draft');
                expect(res.body.NetPay).to.be.a('number');
                expect(res.body.GrossPay).to.be.a('number');
                createdPayrollId = res.body.PayrollId;
            });
        });

        it('NetPay should be a valid number greater than 0', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('GET', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.NetPay).to.be.a('number').and.greaterThan(0);
                expect(res.body.GrossPay).to.be.a('number').and.greaterThan(0);
                expect(res.body.BasicSalary).to.eq(50000);
            });
        });

        it('should reject payroll with missing EmployeeId', () => {
            cy.apiRequest('POST', '/api/payroll', {
                BasicSalary: 50000,
                PayPeriodStart: '2025-01-01',
                PayPeriodEnd: '2025-01-31',
                PayDate: '2025-02-01',
                Status: 'Draft',
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

        it('should reject payroll with missing dates', () => {
            cy.apiRequest('POST', '/api/payroll', {
                EmployeeId: testEmployeeId,
                BasicSalary: 50000,
                Status: 'Draft',
                // Missing PayPeriodStart, PayPeriodEnd, PayDate
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

    });

    // ── 4.4 Read Payroll ───────────────────────────────────────
    describe('Read Payroll via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should GET the created payroll by ID', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('GET', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.PayrollId).to.eq(createdPayrollId);
                expect(res.body.EmployeeId).to.eq(testEmployeeId);
            });
        });

        it('should return 404 for non-existent payroll ID', () => {
            cy.apiRequest('GET', '/api/payroll/999999').then((res) => {
                expect(res.status).to.eq(404);
            });
        });

    });

    // ── 4.5 Approve & Pay Workflow ─────────────────────────────
    describe('Payroll Approve & Pay Workflow', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should approve a Draft payroll record', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('POST', `/api/payroll/${createdPayrollId}/approve`, {
                ApprovedBy: 'admin',
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.Status).to.eq('Approved');
            });
        });

        it('status should be Approved after approving', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('GET', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.body.Status).to.eq('Approved');
            });
        });

        it('should process payment for an Approved record', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('POST', `/api/payroll/${createdPayrollId}/pay`, {}).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.Status).to.eq('Paid');
            });
        });

        it('status should be Paid after payment', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('GET', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.body.Status).to.eq('Paid');
            });
        });

    });

    // ── 4.6 Delete Payroll ─────────────────────────────────────
    describe('Delete Payroll', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should delete the created payroll record', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('DELETE', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.status).to.eq(204);
            });
        });

        it('should return 404 after deletion', () => {
            if (!createdPayrollId) return;
            cy.apiRequest('GET', `/api/payroll/${createdPayrollId}`).then((res) => {
                expect(res.status).to.eq(404);
            });
        });

    });

});