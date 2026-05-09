// cypress/e2e/03_employees.cy.js
// ─────────────────────────────────────────────────────────────
// Test Suite 3: Employee Management (Full CRUD)
// ─────────────────────────────────────────────────────────────

describe('Employee Management', () => {

    let createdEmployeeId = null;
    const TEST_EMAIL = `cypress.emp.${Date.now()}@company.com`;

    // Login once before the whole suite, then visit / in each beforeEach
    before(() => {
        cy.login('admin', 'Admin@123');
    });

    // ── 3.1 Employee List (UI) ─────────────────────────────────
    describe('Employee List', () => {

        beforeEach(() => {
            cy.login('admin', 'Admin@123'); // restores session from cache
            cy.visit('/');
            cy.get('#app-shell', { timeout: 15000 }).should('exist');
            cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
            cy.navigateTo('employees');
            cy.waitForGrid();
        });

        it('should load the employees page', () => {
            cy.get('#page-outlet').should('be.visible');
            cy.contains('Employees').should('be.visible');
        });

        it('should display the DataGrid with employee rows', () => {
            cy.get('.dx-datagrid').should('exist');
            cy.get('.dx-data-row').should('have.length.gte', 1);
        });

        it('should show correct column headers', () => {
            cy.get('.dx-datagrid-headers').within(() => {
                cy.contains('Employee').should('exist');
                cy.contains('Email').should('exist');
                cy.contains('Department').should('exist');
            });
        });

        it('should show New Employee button', () => {
            cy.contains('New Employee').should('be.visible');
        });

        it('should have action buttons per row', () => {
            cy.get('.dx-data-row').first().within(() => {
                cy.get('button').should('have.length.gte', 2);
            });
        });

    });

    // ── 3.2 Employee List (API) ────────────────────────────────
    describe('Employee List API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/'); // needed to set cookie context for cy.apiRequest
        });

        it('GET /api/employees should return array of employees', () => {
            cy.apiRequest('GET', '/api/employees').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.greaterThan(0);
            });
        });

        it('each employee should have required fields', () => {
            cy.apiRequest('GET', '/api/employees').then((res) => {
                const emp = res.body[0];
                expect(emp).to.have.property('EmployeeId');
                expect(emp).to.have.property('EmployeeCode');
                expect(emp).to.have.property('FirstName');
                expect(emp).to.have.property('LastName');
                expect(emp).to.have.property('Email');
                expect(emp).to.have.property('Status');
            });
        });

        it('GET /api/employees/departments should return departments', () => {
            cy.apiRequest('GET', '/api/employees/departments').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array').and.have.length.greaterThan(0);
                expect(res.body[0]).to.have.property('DepartmentId');
                expect(res.body[0]).to.have.property('DepartmentName');
            });
        });

        it('GET /api/employees/positions should return positions', () => {
            cy.apiRequest('GET', '/api/employees/positions').then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array').and.have.length.greaterThan(0);
            });
        });

        it('GET /api/employees/positions?departmentId=1 should filter by dept', () => {
            cy.apiRequest('GET', '/api/employees/positions?departmentId=1').then((res) => {
                expect(res.status).to.eq(200);
                res.body.forEach((p) => expect(p.DepartmentId).to.eq(1));
            });
        });

    });

    // ── 3.3 Create Employee (API) ──────────────────────────────
    describe('Create Employee via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should create a new employee and return 201', () => {
            cy.apiRequest('POST', '/api/employees', {
                FirstName: 'Cypress',
                LastName: 'TestUser',
                Email: TEST_EMAIL,
                PhoneNumber: '9876543210',
                Gender: 'Male',
                HireDate: '2024-01-15',
                DateOfBirth: '1995-06-20',
                EmploymentType: 'Full-Time',
                Status: 'Active',
                DepartmentId: 1,
                PositionId: 1,
                BasicSalary: 50000,
            }).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.EmployeeId).to.be.a('number').and.greaterThan(0);
                expect(res.body.EmployeeCode).to.match(/^EMP\d+$/);
                expect(res.body.FirstName).to.eq('Cypress');
                expect(res.body.Email).to.eq(TEST_EMAIL);
                createdEmployeeId = res.body.EmployeeId;
            });
        });

        it('should reject duplicate email with 400', () => {
            cy.apiRequest('POST', '/api/employees', {
                FirstName: 'Duplicate',
                LastName: 'User',
                Email: TEST_EMAIL,
                HireDate: '2024-01-15',
                Status: 'Active',
                DepartmentId: 1,
                PositionId: 1,
            }).then((res) => {
                expect(res.status).to.eq(400);
                expect(res.body.error).to.contain('Email already exists');
            });
        });

        it('should reject missing required fields with 400', () => {
            cy.apiRequest('POST', '/api/employees', {
                FirstName: 'NoLastName',
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

    });

    // ── 3.4 Read Employee (API) ────────────────────────────────
    describe('Read Employee via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should GET an employee by ID', () => {
            cy.apiRequest('GET', '/api/employees').then((res) => {
                const id = createdEmployeeId || res.body[0].EmployeeId;
                cy.apiRequest('GET', `/api/employees/${id}`).then((emp) => {
                    expect(emp.status).to.eq(200);
                    expect(emp.body.EmployeeId).to.eq(id);
                });
            });
        });

        it('should return 404 for non-existent employee ID', () => {
            cy.apiRequest('GET', '/api/employees/999999').then((res) => {
                expect(res.status).to.eq(404);
            });
        });

    });

    // ── 3.5 Update Employee (API) ──────────────────────────────
    describe('Update Employee via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should update an employee phone number', () => {
            cy.apiRequest('GET', '/api/employees').then((listRes) => {
                const emp = listRes.body.find(e => e.Email === TEST_EMAIL) || listRes.body[0];
                cy.apiRequest('PUT', `/api/employees/${emp.EmployeeId}`, {
                    ...emp,
                    PhoneNumber: '1111111111',
                }).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.PhoneNumber).to.eq('1111111111');
                });
            });
        });

        it('should return 400 when URL id mismatches body EmployeeId', () => {
            cy.apiRequest('GET', '/api/employees').then((listRes) => {
                const emp = listRes.body[0];
                // emp.EmployeeId != 99999 so server should reject
                cy.apiRequest('PUT', '/api/employees/99999', { ...emp }).then((res) => {
                    expect(res.status).to.eq(400);
                });
            });
        });

    });

    // ── 3.6 Create Employee (UI) ───────────────────────────────
    describe('Create Employee via UI', () => {

        beforeEach(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#app-shell', { timeout: 15000 }).should('exist');
            cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
            cy.navigateTo('employees');
            cy.waitForGrid();
        });

        it('should open the new employee form', () => {
            cy.contains('New Employee').click();
            cy.get('.dx-form', { timeout: 8000 }).should('be.visible');
        });

        it('should show validation errors on empty submit', () => {
            cy.contains('New Employee').click();
            cy.get('.dx-form', { timeout: 8000 }).should('be.visible');
            cy.contains('button', /save|create/i).click();
            cy.get('.dx-invalid-message, .dx-validation-summary').should('exist');
        });

        it('should navigate back to list on cancel', () => {
            cy.contains('New Employee').click();
            cy.get('.dx-form', { timeout: 8000 }).should('be.visible');
            cy.contains('button', /cancel|back/i).click();
            cy.get('.dx-datagrid').should('be.visible');
        });

    });

    // ── 3.7 Delete Employee (API) ──────────────────────────────
    describe('Delete Employee via API', () => {

        before(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
        });

        it('should delete the test employee', () => {
            cy.apiRequest('GET', '/api/employees').then((res) => {
                const testEmp = res.body.find(e => e.Email === TEST_EMAIL);
                if (testEmp) {
                    cy.apiRequest('DELETE', `/api/employees/${testEmp.EmployeeId}`).then((del) => {
                        expect(del.status).to.eq(204);
                    });
                } else {
                    cy.log('Test employee not found — already cleaned up');
                }
            });
        });

        it('should return 404 after deletion', () => {
            if (!createdEmployeeId) {
                cy.log('No createdEmployeeId — skipping');
                return;
            }
            cy.apiRequest('GET', `/api/employees/${createdEmployeeId}`).then((res) => {
                expect(res.status).to.eq(404);
            });
        });

    });

    // ── 3.8 Search ─────────────────────────────────────────────
    describe('Employee Search', () => {

        beforeEach(() => {
            cy.login('admin', 'Admin@123');
            cy.visit('/');
            cy.get('#app-shell', { timeout: 15000 }).should('exist');
            cy.get('.sidebar', { timeout: 10000 }).should('be.visible');
            cy.navigateTo('employees');
            cy.waitForGrid();
        });

        it('should show the search bar', () => {
            cy.get('input[placeholder*="Search"]').should('be.visible');
        });

        it('should filter rows when typing in search box', () => {
            cy.apiRequest('GET', '/api/employees').then((res) => {
                const firstName = res.body[0].FirstName;
                cy.get('input[placeholder*="Search"]').type(firstName);
                cy.get('.dx-data-row').should('have.length.gte', 1);
            });
        });

    });

});