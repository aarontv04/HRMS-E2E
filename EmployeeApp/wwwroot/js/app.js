/**
 * app.js — HRM Suite SPA
 * Modules: Dashboard, Employees, Payroll, Attendance, Leave
 * Uses DevExtreme DataGrid, Charts, Form components
 */

; (function (window, $) {
    'use strict';

    // ─── API Helper ────────────────────────────────────────────
    const API = {
        base: '/api',
        async get(url, params) {
            const qs = params ? '?' + new URLSearchParams(params).toString() : '';
            const r = await fetch(this.base + url + qs);
            if (!r.ok) throw new Error(await r.text());
            return r.json();
        },
        async post(url, body) {
            const r = await fetch(this.base + url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!r.ok) throw new Error(await r.text());
            return r.json();
        },
        async put(url, body) {
            const r = await fetch(this.base + url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!r.ok) throw new Error(await r.text());
            return r.json();
        },
        async delete(url) {
            const r = await fetch(this.base + url, { method: 'DELETE' });
            if (!r.ok) throw new Error(await r.text());
            return r.status !== 204 ? r.json() : null;
        }
    };

    // ─── Toast ──────────────────────────────────────────────────
    const Toast = {
        show(msg, type = 'default') {
            const icons = { success: 'circle-check', error: 'circle-xmark', warning: 'triangle-exclamation', default: 'circle-info' };
            const t = document.createElement('div');
            t.className = `toast ${type}`;
            t.innerHTML = `<i class="fa-solid fa-${icons[type] || icons.default}"></i><span>${msg}</span>`;
            document.getElementById('toast-container').appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
        },
        success(msg) { this.show(msg, 'success'); },
        error(msg) { this.show(msg, 'error'); },
        warning(msg) { this.show(msg, 'warning'); }
    };

    // ─── Modal ──────────────────────────────────────────────────
    const Modal = {
        open(title, bodyHtml, wide = false) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-body').innerHTML = bodyHtml;
            const overlay = document.getElementById('modal-overlay');
            const container = document.getElementById('modal-container');
            container.style.maxWidth = wide ? '860px' : '680px';
            overlay.classList.remove('hidden');
        },
        close() { document.getElementById('modal-overlay').classList.add('hidden'); },
        setTitle(t) { document.getElementById('modal-title').textContent = t; },
        getBody() { return document.getElementById('modal-body'); }
    };

    // ─── Outlet Helpers ─────────────────────────────────────────
    function setOutlet(html) {
        const outlet = document.getElementById('page-outlet');
        outlet.innerHTML = html;
        outlet.querySelector('.page-enter') || outlet.firstElementChild?.classList.add('page-enter');
    }

    function showLoading() {
        document.getElementById('page-outlet').innerHTML = '<div class="page-loading"><div class="spinner"></div></div>';
    }

    function avatarColor(name) {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];
        let h = 0;
        for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
        return colors[Math.abs(h) % colors.length];
    }

    function statusBadge(status) {
        const map = {
            'Active': 'badge-success', 'Inactive': 'badge-gray', 'OnLeave': 'badge-warning',
            'Approved': 'badge-success', 'Rejected': 'badge-danger', 'Pending': 'badge-warning',
            'Draft': 'badge-gray', 'Paid': 'badge-success', 'Present': 'badge-success',
            'Absent': 'badge-danger', 'Late': 'badge-warning', 'HalfDay': 'badge-info',
            'FullTime': 'badge-info', 'PartTime': 'badge-purple', 'Contract': 'badge-warning'
        };
        return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
    }

    function fmtDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

    // Convert a JS Date / ISO string to "yyyy-MM-dd" for the C# DateOnly API.
    // dxDateBox returns a full Date object — we must strip the time before sending.
    function toApiDate(val) {
        if (!val) return null;
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d)) return null;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Sanitise all DateOnly fields in a form data object before sending to the API
    function sanitizeDates(data, fields) {
        fields.forEach(f => { if (data[f] !== undefined) data[f] = toApiDate(data[f]); });
        return data;
    }
    function fmtCurrency(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0); }
    function initials(name) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); }

    // ─────────────────────────────────────────────────────────
    // MODULE: DASHBOARD
    // ─────────────────────────────────────────────────────────
    async function loadDashboard() {
        showLoading();
        try {
            const stats = await API.get('/dashboard/stats');
            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Dashboard</h1>
              <p>Welcome back! Here's what's happening today.</p>
            </div>
            <div class="page-header-right">
              <span style="font-size:12px;color:var(--gray-500)">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div class="stats-grid" id="stats-grid"></div>

          <div class="content-grid">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Headcount by Department</span>
              </div>
              <div class="card-body"><div id="dept-chart" class="chart-wrap"></div></div>
            </div>
            <div class="card">
              <div class="card-header">
                <span class="card-title">Payroll Trend (6 months)</span>
              </div>
              <div class="card-body"><div id="payroll-chart" class="chart-wrap"></div></div>
            </div>
          </div>

          <div class="content-grid">
            <div class="card">
              <div class="card-header">
                <span class="card-title">Quick Actions</span>
              </div>
              <div class="card-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  ${[
                    { icon: 'user-plus', label: 'Add Employee', route: '/employees/new', color: 'blue' },
                    { icon: 'file-invoice-dollar', label: 'Process Payroll', route: '/payroll/new', color: 'green' },
                    { icon: 'clock', label: 'Mark Attendance', route: '/attendance', color: 'yellow' },
                    { icon: 'calendar-plus', label: 'New Leave Request', route: '/leave/new', color: 'purple' },
                ].map(a => `
                    <div class="stat-card" data-href="${a.route}" style="cursor:pointer;gap:12px">
                      <div class="stat-icon ${a.color}"><i class="fa-solid fa-${a.icon}"></i></div>
                      <span style="font-size:13px;font-weight:600;color:var(--gray-700)">${a.label}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                <span class="card-title">Pending Leave Requests</span>
                <button class="btn btn-sm btn-secondary" data-href="/leave">View All</button>
              </div>
              <div class="card-body" id="pending-leave-list">
                <div class="page-loading"><div class="spinner"></div></div>
              </div>
            </div>
          </div>
        </div>
      `);

            // Stats cards
            const statsGrid = document.getElementById('stats-grid');
            const cards = [
                { icon: 'users', label: 'Total Employees', value: stats.TotalEmployees, color: 'blue', change: '+2 this month', dir: 'up' },
                { icon: 'user-check', label: 'Active Employees', value: stats.ActiveEmployees, color: 'green' },
                { icon: 'umbrella-beach', label: 'On Leave Today', value: stats.OnLeaveToday, color: 'yellow' },
                { icon: 'hourglass-half', label: 'Pending Leaves', value: stats.PendingLeaveRequests, color: 'red' },
                { icon: 'money-bill-trend-up', label: 'Payroll This Month', value: fmtCurrency(stats.TotalPayrollThisMonth), color: 'purple' },
                { icon: 'chart-line', label: 'Attendance Rate', value: stats.AverageAttendancePercent + '%', color: 'cyan' },
            ];

            statsGrid.innerHTML = cards.map(c => `
        <div class="stat-card">
          <div class="stat-icon ${c.color}"><i class="fa-solid fa-${c.icon}"></i></div>
          <div class="stat-info">
            <div class="stat-value">${c.value}</div>
            <div class="stat-label">${c.label}</div>
            ${c.change ? `<div class="stat-change ${c.dir}"><i class="fa-solid fa-arrow-${c.dir}"></i> ${c.change}</div>` : ''}
          </div>
        </div>
      `).join('');

            // Dept chart (DevExtreme)
            DevExpress.viz.dxChart && DevExpress.viz.dxChart;
            $('#dept-chart').dxChart({
                dataSource: stats.DeptBreakdown,
                series: [{ argumentField: 'Department', valueField: 'Count', type: 'bar', color: '#2563eb', name: 'Employees', cornerRadius: 4 }],
                argumentAxis: { label: { font: { family: 'Plus Jakarta Sans', size: 12 } } },
                valueAxis: { label: { font: { family: 'Plus Jakarta Sans', size: 12 } } },
                legend: { visible: false },
                tooltip: { enabled: true, customizeTooltip(p) { return { text: `${p.argument}: ${p.value} employees` }; } },
                commonAxisSettings: { grid: { visible: true, color: '#e2e8f0' } },
            });

            $('#payroll-chart').dxChart({
                dataSource: stats.PayrollTrend,
                series: [{ argumentField: 'Month', valueField: 'Amount', type: 'splinearea', color: '#10b981', name: 'Net Pay' }],
                legend: { visible: false },
                tooltip: { enabled: true, customizeTooltip(p) { return { text: fmtCurrency(p.value) }; } },
                commonAxisSettings: { grid: { visible: true, color: '#e2e8f0' } },
            });

            // Load pending leaves
            try {
                const leaves = await API.get('/leave', { status: 'Pending' });
                const pendingEl = document.getElementById('pending-leave-list');
                if (leaves.length === 0) {
                    pendingEl.innerHTML = '<div class="empty-state" style="padding:30px"><i class="fa-solid fa-check-circle" style="font-size:32px;color:var(--success)"></i><p style="margin-top:8px">No pending requests</p></div>';
                } else {
                    pendingEl.innerHTML = leaves.slice(0, 5).map(l => `
            <div class="activity-item">
              <div class="emp-avatar" style="background:${avatarColor(l.Employee?.FirstName || 'E')};font-size:11px">${initials((l.Employee?.FirstName || '') + ' ' + (l.Employee?.LastName || ''))}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--gray-800)">${l.Employee?.FirstName || ''} ${l.Employee?.LastName || ''}</div>
                <div style="font-size:12px;color:var(--gray-500)">${l.LeaveType?.TypeName || ''} · ${l.TotalDays} day(s)</div>
              </div>
              <div>
                <button class="btn btn-sm btn-success" onclick="App.approveLeave(${l.LeaveRequestId})">Approve</button>
              </div>
            </div>
          `).join('');
                }
            } catch (e) {
                console.warn('Could not load pending leaves:', e);
            }

            // Badge updates
            try {
                const pendingLeave = stats.PendingLeaveRequests;
                const badge = document.getElementById('badge-leave');
                if (badge && pendingLeave > 0) badge.textContent = pendingLeave;
            } catch (e) { }

        } catch (e) {
            console.error('Dashboard error:', e);
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Failed to load dashboard</h3><p>${e.message}</p></div>`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // MODULE: EMPLOYEES
    // ─────────────────────────────────────────────────────────
    async function loadEmployees(route, params) {
        const action = route.action;
        if (action === 'new') return openEmployeeForm(null);
        if (action === 'edit') return openEmployeeForm(params.id);
        if (action === 'detail') return loadEmployeeDetail(params.id);

        showLoading();
        try {
            const [employees, depts] = await Promise.all([
                API.get('/employees'),
                API.get('/employees/departments')
            ]);

            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Employees</h1>
              <p>${employees.length} total employees</p>
            </div>
            <div class="page-header-right">
              <button class="btn btn-secondary" id="export-btn"><i class="fa-solid fa-download"></i> Export</button>
              <button class="btn btn-primary" data-href="/employees/new"><i class="fa-solid fa-plus"></i> Add Employee</button>
            </div>
          </div>
          <div class="card">
            <div id="employee-grid" style="min-height:500px"></div>
          </div>
        </div>
      `);

            // DevExtreme DataGrid
            $('#employee-grid').dxDataGrid({
                dataSource: employees,
                keyExpr: 'EmployeeId',
                showBorders: false,
                rowAlternationEnabled: true,
                focusedRowEnabled: true,
                hoverStateEnabled: true,
                paging: { pageSize: 15 },
                pager: { showPageSizeSelector: true, allowedPageSizes: [10, 15, 25, 50], showInfo: true },
                filterRow: { visible: true },
                headerFilter: { visible: true },
                searchPanel: { visible: true, width: 240, placeholder: 'Search employees...' },
                groupPanel: { visible: true },
                columnChooser: { enabled: true, mode: 'select' },
                export: { enabled: true, fileName: 'Employees' },
                selection: { mode: 'multiple' },
                toolbar: {
                    items: [
                        { name: 'groupPanel' },
                        { name: 'searchPanel' },
                        { name: 'columnChooserButton' },
                        { name: 'exportButton' },
                        {
                            location: 'after',
                            template: () => $('<button class="btn btn-primary btn-sm" data-href="/employees/new"><i class="fa-solid fa-plus"></i> New Employee</button>')
                        }
                    ]
                },
                columns: [
                    {
                        caption: 'Employee',
                        calculateCellValue: r => r.FirstName + ' ' + r.LastName,
                        cellTemplate(cell, info) {
                            const name = info.data.FirstName + ' ' + info.data.LastName;
                            const color = avatarColor(name);
                            cell.append($(`
                <div class="flex gap-8" style="align-items:center">
                  <div class="emp-avatar" style="background:${color};font-size:11px">${initials(name)}</div>
                  <div>
                    <div style="font-weight:600;font-size:13px">${name}</div>
                    <div style="font-size:11.5px;color:var(--gray-500)">${info.data.EmployeeCode}</div>
                  </div>
                </div>
              `));
                        },
                        width: 200,
                        sortOrder: 'asc'
                    },
                    { dataField: 'Email', caption: 'Email', width: 200 },
                    {
                        dataField: 'DepartmentId', caption: 'Department',
                        lookup: { dataSource: depts, valueExpr: 'DepartmentId', displayExpr: 'DepartmentName' },
                        width: 140
                    },
                    {
                        dataField: 'EmploymentType', caption: 'Type', width: 100,
                        cellTemplate(cell, info) { cell.append($(statusBadge(info.data.EmploymentType))); }
                    },
                    {
                        dataField: 'Status', caption: 'Status', width: 100,
                        cellTemplate(cell, info) { cell.append($(statusBadge(info.data.Status))); }
                    },
                    {
                        dataField: 'HireDate', caption: 'Hire Date', dataType: 'date',
                        format: 'MMM dd, yyyy', width: 120
                    },
                    {
                        caption: 'Actions', width: 140, allowFiltering: false, allowSorting: false,
                        cellTemplate(cell, info) {
                            cell.append($(`
                <div class="flex gap-8">
                  <button class="btn btn-sm btn-secondary btn-icon" title="View" onclick="App.viewEmployee(${info.data.EmployeeId})"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-secondary btn-icon" title="Edit" onclick="App.editEmployee(${info.data.EmployeeId})"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn btn-sm btn-danger btn-icon" title="Delete" onclick="App.deleteEmployee(${info.data.EmployeeId}, '${info.data.FirstName} ${info.data.LastName}')"><i class="fa-solid fa-trash"></i></button>
                </div>
              `));
                        }
                    }
                ],
                onContentReady() {
                    // Re-init any data-href links after grid renders
                    document.querySelectorAll('[data-href]').forEach(el => {
                        if (!el._routerBound) { el._routerBound = true; }
                    });
                }
            });

        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Failed to load employees</h3><p>${e.message}</p></div>`);
        }
    }

    async function loadEmployeeDetail(id) {
        showLoading();
        try {
            const [emp, balances] = await Promise.all([
                API.get(`/employees/${id}`),
                API.get(`/leave/balances/${id}`)
            ]);
            const name = emp.FirstName + ' ' + emp.LastName;
            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left">
              <h1>${name}</h1>
              <p>${emp.EmployeeCode} · ${emp.Position?.PositionTitle || ''}</p>
            </div>
            <div class="page-header-right">
              <button class="btn btn-secondary" onclick="App.router.navigate('/employees')"><i class="fa-solid fa-arrow-left"></i> Back</button>
              <button class="btn btn-primary" onclick="App.editEmployee(${id})"><i class="fa-solid fa-pen"></i> Edit</button>
            </div>
          </div>
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Personal Information</span></div>
              <div class="card-body">
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
                  <div class="emp-avatar" style="width:64px;height:64px;font-size:22px;background:${avatarColor(name)}">${initials(name)}</div>
                  <div>
                    <div style="font-size:20px;font-weight:700;color:var(--gray-900)">${name}</div>
                    <div>${statusBadge(emp.Status)} ${statusBadge(emp.EmploymentType)}</div>
                  </div>
                </div>
                ${infoRow('Email', emp.Email)}
                ${infoRow('Phone', emp.PhoneNumber || '-')}
                ${infoRow('Date of Birth', fmtDate(emp.DateOfBirth))}
                ${infoRow('Gender', emp.Gender || '-')}
                ${infoRow('Address', [emp.Address, emp.City, emp.Country].filter(Boolean).join(', ') || '-')}
              </div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Employment Details</span></div>
              <div class="card-body">
                ${infoRow('Department', emp.Department?.DepartmentName || '-')}
                ${infoRow('Position', emp.Position?.PositionTitle || '-')}
                ${infoRow('Manager', emp.Manager ? emp.Manager.FirstName + ' ' + emp.Manager.LastName : '-')}
                ${infoRow('Hire Date', fmtDate(emp.HireDate))}
                ${infoRow('Employment Type', emp.EmploymentType)}
                ${infoRow('Status', emp.Status)}
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">Leave Balances (${new Date().getFullYear()})</span></div>
            <div class="card-body">
              ${balances.map(b => `
                <div class="balance-row">
                  <span class="balance-label">${b.LeaveType?.TypeName}</span>
                  <div class="balance-bar-wrap">
                    <div class="balance-bar" style="width:${b.Allocated > 0 ? Math.round((b.Used / b.Allocated) * 100) : 0}%;background:var(--primary)"></div>
                  </div>
                  <span class="balance-nums">${b.Used}/${b.Allocated} days</span>
                </div>
              `).join('') || '<p style="color:var(--gray-400);font-size:13px">No leave balance records</p>'}
            </div>
          </div>
        </div>
      `);
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Failed to load employee</h3><p>${e.message}</p></div>`);
        }
    }

    function infoRow(label, value) {
        return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--gray-100)">
      <span style="font-size:12.5px;font-weight:600;color:var(--gray-500)">${label}</span>
      <span style="font-size:13px;color:var(--gray-800)">${value}</span>
    </div>`;
    }

    async function openEmployeeForm(id) {
        showLoading();
        try {
            const [depts, positions, allEmployees] = await Promise.all([
                API.get('/employees/departments'),
                API.get('/employees/positions'),
                API.get('/employees')
            ]);

            let emp = { EmploymentType: 'FullTime', Status: 'Active', Country: 'USA' };
            if (id) emp = await API.get(`/employees/${id}`);

            const isEdit = !!id;

            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left">
              <h1>${isEdit ? 'Edit Employee' : 'New Employee'}</h1>
              <p>${isEdit ? 'Update employee information' : 'Add a new employee to the system'}</p>
            </div>
            <div class="page-header-right">
              <button class="btn btn-secondary" onclick="App.router.navigate('/employees')"><i class="fa-solid fa-xmark"></i> Cancel</button>
            </div>
          </div>
          <div class="card">
            <div id="employee-form-container"></div>
          </div>
        </div>
      `);

            const formData = { ...emp };

            $('#employee-form-container').dxForm({
                formData: formData,
                colCount: 2,
                labelLocation: 'top',
                showColonAfterLabel: false,
                items: [
                    {
                        itemType: 'group', caption: 'Personal Information', colCount: 2, colSpan: 2, items: [
                            { dataField: 'FirstName', label: { text: 'First Name' }, validationRules: [{ type: 'required' }] },
                            { dataField: 'LastName', label: { text: 'Last Name' }, validationRules: [{ type: 'required' }] },
                            { dataField: 'Email', label: { text: 'Email Address' }, validationRules: [{ type: 'required' }, { type: 'email' }] },
                            { dataField: 'PhoneNumber', label: { text: 'Phone Number' } },
                            { dataField: 'DateOfBirth', label: { text: 'Date of Birth' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy', max: new Date() } },
                            { dataField: 'Gender', label: { text: 'Gender' }, editorType: 'dxSelectBox', editorOptions: { items: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] } },
                            { dataField: 'Address', label: { text: 'Address' }, colSpan: 2 },
                            { dataField: 'City', label: { text: 'City' } },
                            { dataField: 'Country', label: { text: 'Country' } },
                        ]
                    },
                    {
                        itemType: 'group', caption: 'Employment Details', colCount: 2, colSpan: 2, items: [
                            {
                                dataField: 'DepartmentId', label: { text: 'Department' },
                                editorType: 'dxSelectBox',
                                editorOptions: {
                                    dataSource: depts, valueExpr: 'DepartmentId', displayExpr: 'DepartmentName',
                                    onValueChanged(e) {
                                        // Filter positions by dept
                                        const posEditor = $('#employee-form-container').dxForm('instance').getEditor('PositionId');
                                        if (posEditor) posEditor.option('dataSource', positions.filter(p => p.DepartmentId === e.value));
                                    }
                                },
                                validationRules: [{ type: 'required' }]
                            },
                            {
                                dataField: 'PositionId', label: { text: 'Position' },
                                editorType: 'dxSelectBox',
                                editorOptions: { dataSource: emp.DepartmentId ? positions.filter(p => p.DepartmentId === emp.DepartmentId) : positions, valueExpr: 'PositionId', displayExpr: 'PositionTitle' },
                                validationRules: [{ type: 'required' }]
                            },
                            {
                                dataField: 'ManagerId', label: { text: 'Manager' },
                                editorType: 'dxSelectBox',
                                editorOptions: {
                                    dataSource: allEmployees.filter(e => e.EmployeeId !== (id || 0)),
                                    valueExpr: 'EmployeeId',
                                    displayExpr: e => e.FirstName + ' ' + e.LastName,
                                    showClearButton: true
                                }
                            },
                            { dataField: 'HireDate', label: { text: 'Hire Date' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy' }, validationRules: [{ type: 'required' }] },
                            {
                                dataField: 'EmploymentType', label: { text: 'Employment Type' },
                                editorType: 'dxSelectBox', editorOptions: { items: ['FullTime', 'PartTime', 'Contract'] },
                                validationRules: [{ type: 'required' }]
                            },
                            {
                                dataField: 'Status', label: { text: 'Status' },
                                editorType: 'dxSelectBox', editorOptions: { items: ['Active', 'Inactive', 'OnLeave'] },
                                validationRules: [{ type: 'required' }]
                            },
                        ]
                    },
                    {
                        itemType: 'group', caption: 'Notes', colSpan: 2, items: [
                            { dataField: 'Notes', label: { text: 'Additional Notes' }, editorType: 'dxTextArea', editorOptions: { height: 80 }, colSpan: 2 }
                        ]
                    },
                    {
                        itemType: 'button', colSpan: 2,
                        buttonOptions: {
                            text: isEdit ? 'Update Employee' : 'Create Employee',
                            type: 'default', useSubmitBehavior: false,
                            onClick: async () => {
                                const form = $('#employee-form-container').dxForm('instance');
                                if (!form.validate().isValid) return;
                                try {
                                    const data = form.option('formData');
                                    // Strip time from DateOnly fields before sending to C# API
                                    sanitizeDates(data, ['DateOfBirth', 'HireDate', 'TerminationDate']);
                                    if (isEdit) {
                                        data.EmployeeId = parseInt(id);
                                        await API.put(`/employees/${id}`, data);
                                        Toast.success('Employee updated successfully!');
                                    } else {
                                        await API.post('/employees', data);
                                        Toast.success('Employee created successfully!');
                                    }
                                    window.App.router.navigate('/employees');
                                } catch (err) {
                                    Toast.error('Failed to save employee: ' + err.message);
                                }
                            }
                        }
                    }
                ]
            });

        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Failed to load form</h3><p>${e.message}</p></div>`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // MODULE: PAYROLL
    // ─────────────────────────────────────────────────────────
    async function loadPayroll(route, params) {
        if (route.action === 'new') return openPayrollForm(null);
        if (route.action === 'detail') return loadPayrollDetail(params.id);
        showLoading();
        try {
            const records = await API.get('/payroll');
            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Payroll</h1>
              <p>Manage employee payroll records</p>
            </div>
            <div class="page-header-right">
              <button class="btn btn-primary" data-href="/payroll/new"><i class="fa-solid fa-plus"></i> Process Payroll</button>
            </div>
          </div>
          <div class="card">
            <div id="payroll-grid" style="min-height:500px"></div>
          </div>
        </div>
      `);

            $('#payroll-grid').dxDataGrid({
                dataSource: records,
                keyExpr: 'PayrollId',
                showBorders: false,
                rowAlternationEnabled: true,
                paging: { pageSize: 15 },
                filterRow: { visible: true },
                searchPanel: { visible: true, width: 240 },
                columns: [
                    {
                        caption: 'Employee', width: 200,
                        calculateCellValue: r => (r.Employee?.FirstName || '') + ' ' + (r.Employee?.LastName || ''),
                        cellTemplate(cell, info) {
                            const name = (info.data.Employee?.FirstName || '') + ' ' + (info.data.Employee?.LastName || '');
                            cell.append($(`
                <div class="flex gap-8" style="align-items:center">
                  <div class="emp-avatar" style="background:${avatarColor(name)};font-size:11px">${initials(name)}</div>
                  <div>
                    <div style="font-weight:600;font-size:13px">${name}</div>
                    <div style="font-size:11.5px;color:var(--gray-500)">${info.data.Employee?.Department?.DepartmentName || ''}</div>
                  </div>
                </div>
              `));
                        }
                    },
                    { dataField: 'PayPeriodStart', caption: 'Period Start', dataType: 'date', format: 'MMM dd, yyyy', width: 130 },
                    { dataField: 'PayPeriodEnd', caption: 'Period End', dataType: 'date', format: 'MMM dd, yyyy', width: 130 },
                    { dataField: 'GrossPay', caption: 'Gross Pay', format: { type: 'currency', precision: 2 }, width: 120 },
                    { dataField: 'TotalDeductions', caption: 'Deductions', format: { type: 'currency', precision: 2 }, width: 120 },
                    { dataField: 'NetPay', caption: 'Net Pay', format: { type: 'currency', precision: 2 }, width: 120 },
                    {
                        dataField: 'Status', caption: 'Status', width: 100,
                        cellTemplate(cell, info) { cell.append($(statusBadge(info.data.Status))); }
                    },
                    {
                        caption: 'Actions', width: 160, allowFiltering: false, allowSorting: false,
                        cellTemplate(cell, info) {
                            const btns = [`<button class="btn btn-sm btn-secondary btn-icon" onclick="App.viewPayroll(${info.data.PayrollId})" title="View"><i class="fa-solid fa-eye"></i></button>`];
                            if (info.data.Status === 'Draft') {
                                btns.push(`<button class="btn btn-sm btn-success btn-icon" onclick="App.approvePayroll(${info.data.PayrollId})" title="Approve"><i class="fa-solid fa-check"></i></button>`);
                            }
                            if (info.data.Status === 'Approved') {
                                btns.push(`<button class="btn btn-sm btn-primary btn-icon" onclick="App.payPayroll(${info.data.PayrollId})" title="Mark Paid"><i class="fa-solid fa-money-bill"></i></button>`);
                            }
                            btns.push(`<button class="btn btn-sm btn-danger btn-icon" onclick="App.deletePayroll(${info.data.PayrollId})" title="Delete"><i class="fa-solid fa-trash"></i></button>`);
                            cell.append($(`<div class="flex gap-8">${btns.join('')}</div>`));
                        }
                    }
                ]
            });
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Failed to load payroll</h3><p>${e.message}</p></div>`);
        }
    }

    async function loadPayrollDetail(id) {
        showLoading();
        try {
            const r = await API.get(`/payroll/${id}`);
            const name = (r.Employee?.FirstName || '') + ' ' + (r.Employee?.LastName || '');
            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left"><h1>Payroll Detail</h1><p>${name} · ${fmtDate(r.PayPeriodStart)} to ${fmtDate(r.PayPeriodEnd)}</p></div>
            <div class="page-header-right">
              <button class="btn btn-secondary" onclick="App.router.navigate('/payroll')"><i class="fa-solid fa-arrow-left"></i> Back</button>
              ${r.Status === 'Draft' ? `<button class="btn btn-success" onclick="App.approvePayroll(${id})"><i class="fa-solid fa-check"></i> Approve</button>` : ''}
              ${r.Status === 'Approved' ? `<button class="btn btn-primary" onclick="App.payPayroll(${id})"><i class="fa-solid fa-money-bill"></i> Mark Paid</button>` : ''}
            </div>
          </div>
          <div class="content-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Pay Summary</span><span>${statusBadge(r.Status)}</span></div>
              <div class="card-body">
                <div class="payroll-line"><span>Basic Salary</span><span>${fmtCurrency(r.BasicSalary)}</span></div>
                <div class="payroll-line"><span>Regular Hours</span><span>${r.RegularHours}h</span></div>
                <div class="payroll-line"><span>Overtime Hours</span><span>${r.OvertimeHours}h</span></div>
                <div class="payroll-line payroll-addition"><span>Bonus</span><span>+ ${fmtCurrency(r.Bonus)}</span></div>
                <div class="payroll-line payroll-addition"><span>Commission</span><span>+ ${fmtCurrency(r.Commission)}</span></div>
                <div class="payroll-line" style="font-weight:600"><span>Gross Pay</span><span>${fmtCurrency(r.GrossPay)}</span></div>
                <div class="payroll-line payroll-deduction"><span>Federal Tax</span><span>- ${fmtCurrency(r.FederalTax)}</span></div>
                <div class="payroll-line payroll-deduction"><span>State Tax</span><span>- ${fmtCurrency(r.StateTax)}</span></div>
                <div class="payroll-line payroll-deduction"><span>Social Security</span><span>- ${fmtCurrency(r.SocialSecurity)}</span></div>
                <div class="payroll-line payroll-deduction"><span>Medicare</span><span>- ${fmtCurrency(r.Medicare)}</span></div>
                <div class="payroll-line payroll-deduction"><span>Health Insurance</span><span>- ${fmtCurrency(r.HealthInsurance)}</span></div>
                <div class="payroll-line payroll-deduction"><span>401(k) Retirement</span><span>- ${fmtCurrency(r.Retirement401k)}</span></div>
                <div class="payroll-line total"><span>Net Pay</span><span>${fmtCurrency(r.NetPay)}</span></div>
              </div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Employee Info</span></div>
              <div class="card-body">
                ${infoRow('Employee', name)}
                ${infoRow('Department', r.Employee?.Department?.DepartmentName || '-')}
                ${infoRow('Pay Period', fmtDate(r.PayPeriodStart) + ' – ' + fmtDate(r.PayPeriodEnd))}
                ${infoRow('Pay Date', fmtDate(r.PayDate))}
                ${infoRow('Processed By', r.ProcessedBy || '-')}
                ${infoRow('Processed At', r.ProcessedAt ? fmtDate(r.ProcessedAt) : '-')}
              </div>
            </div>
          </div>
        </div>
      `);
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>${e.message}</p></div>`);
        }
    }

    async function openPayrollForm() {
        showLoading();
        try {
            const employees = await API.get('/employees');
            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left"><h1>Process Payroll</h1><p>Create a new payroll record</p></div>
            <div class="page-header-right">
              <button class="btn btn-secondary" onclick="App.router.navigate('/payroll')"><i class="fa-solid fa-xmark"></i> Cancel</button>
            </div>
          </div>
          <div class="card"><div id="payroll-form-container"></div></div>
        </div>
      `);

            const formData = {
                EmployeeId: null,
                BasicSalary: 0,
                RegularHours: 160,
                OvertimeHours: 0,
                OvertimeRate: 1.5,
                Bonus: 0,
                Commission: 0,
                FederalTax: 0,
                StateTax: 0,
                SocialSecurity: 0,
                Medicare: 0,
                HealthInsurance: 0,
                Retirement401k: 0,
                OtherDeductions: 0,
                GrossPay: 0,
                TotalDeductions: 0,
                NetPay: 0,
                HourlySalary: 0,
                PayPeriodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                PayPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                PayDate: new Date(),
                Status: 'Draft',
                Notes: '',
            };

            $('#payroll-form-container').dxForm({
                formData,
                colCount: 2,
                labelLocation: 'top',
                items: [
                    {
                        itemType: 'group', caption: 'Employee & Period', colCount: 2, colSpan: 2, items: [
                            {
                                dataField: 'EmployeeId', label: { text: 'Employee' }, editorType: 'dxSelectBox',
                                editorOptions: {
                                    dataSource: employees.map(e => ({ ...e, FullName: e.FirstName + ' ' + e.LastName })),
                                    valueExpr: 'EmployeeId',
                                    displayExpr: 'FullName',
                                    searchEnabled: true,
                                    searchExpr: 'FullName',
                                    placeholder: 'Select employee...',
                                    showClearButton: true,
                                    onValueChanged(e) {
                                        // Auto-fill BasicSalary from the selected employee's salary
                                        const emp = employees.find(emp => emp.EmployeeId === e.value);
                                        if (emp && emp.BasicSalary) {
                                            const form = $('#payroll-form-container').dxForm('instance');
                                            if (form) form.updateData('BasicSalary', emp.BasicSalary);
                                        }
                                    }
                                },
                                validationRules: [{ type: 'required', message: 'Employee is required' }]
                            },
                            { dataField: 'PayDate', label: { text: 'Pay Date' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy' }, validationRules: [{ type: 'required' }] },
                            { dataField: 'PayPeriodStart', label: { text: 'Period Start' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy' } },
                            { dataField: 'PayPeriodEnd', label: { text: 'Period End' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy' } },
                        ]
                    },
                    {
                        itemType: 'group', caption: 'Earnings', colCount: 2, colSpan: 2, items: [
                            { dataField: 'BasicSalary', label: { text: 'Basic Salary ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 }, validationRules: [{ type: 'required' }] },
                            { dataField: 'RegularHours', label: { text: 'Regular Hours' }, editorType: 'dxNumberBox', editorOptions: { min: 0 } },
                            { dataField: 'OvertimeHours', label: { text: 'Overtime Hours' }, editorType: 'dxNumberBox', editorOptions: { min: 0 } },
                            { dataField: 'OvertimeRate', label: { text: 'Overtime Rate (x)' }, editorType: 'dxNumberBox', editorOptions: { min: 1, step: 0.1 } },
                            { dataField: 'Bonus', label: { text: 'Bonus ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'Commission', label: { text: 'Commission ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                        ]
                    },
                    {
                        itemType: 'group', caption: 'Deductions', colCount: 3, colSpan: 2, items: [
                            { dataField: 'FederalTax', label: { text: 'Federal Tax ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'StateTax', label: { text: 'State Tax ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'SocialSecurity', label: { text: 'Social Security ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'Medicare', label: { text: 'Medicare ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'HealthInsurance', label: { text: 'Health Insurance ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'Retirement401k', label: { text: '401(k) ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                        ]
                    },
                    {
                        itemType: 'group', caption: 'Additional', colCount: 2, colSpan: 2, items: [
                            { dataField: 'OtherDeductions', label: { text: 'Other Deductions ($)' }, editorType: 'dxNumberBox', editorOptions: { format: 'currency', min: 0 } },
                            { dataField: 'Status', label: { text: 'Status' }, editorType: 'dxSelectBox', editorOptions: { items: ['Draft', 'Approved', 'Paid'] } },
                            { dataField: 'Notes', label: { text: 'Notes' }, editorType: 'dxTextArea', editorOptions: { height: 60 }, colSpan: 2 },
                        ]
                    },
                    {
                        itemType: 'button', colSpan: 2,
                        buttonOptions: {
                            text: 'Create Payroll Record', type: 'default',
                            onClick: async () => {
                                const form = $('#payroll-form-container').dxForm('instance');
                                if (!form.validate().isValid) return;
                                try {
                                    const data = form.option('formData');

                                    // Extra guard: EmployeeId must be set
                                    if (!data.EmployeeId) {
                                        Toast.error('Please select an employee.');
                                        return;
                                    }

                                    // Sanitize date fields (strip time for C# DateOnly)
                                    sanitizeDates(data, ['PayPeriodStart', 'PayPeriodEnd', 'PayDate']);

                                    // Ensure all numeric fields are numbers (not null/undefined)
                                    const n = v => parseFloat(v) || 0;
                                    data.BasicSalary = n(data.BasicSalary);
                                    data.RegularHours = n(data.RegularHours);
                                    data.OvertimeHours = n(data.OvertimeHours);
                                    data.OvertimeRate = n(data.OvertimeRate) || 1.5;
                                    data.Bonus = n(data.Bonus);
                                    data.Commission = n(data.Commission);
                                    data.FederalTax = n(data.FederalTax);
                                    data.StateTax = n(data.StateTax);
                                    data.SocialSecurity = n(data.SocialSecurity);
                                    data.Medicare = n(data.Medicare);
                                    data.HealthInsurance = n(data.HealthInsurance);
                                    data.Retirement401k = n(data.Retirement401k);
                                    data.OtherDeductions = n(data.OtherDeductions);

                                    // Calculate derived fields
                                    const hrly = data.BasicSalary / (data.RegularHours || 160);
                                    data.HourlySalary = hrly;
                                    data.GrossPay = data.BasicSalary
                                        + (data.OvertimeHours * hrly * data.OvertimeRate)
                                        + data.Bonus
                                        + data.Commission;
                                    data.TotalDeductions = data.FederalTax + data.StateTax + data.SocialSecurity
                                        + data.Medicare + data.HealthInsurance
                                        + data.Retirement401k + data.OtherDeductions;
                                    data.NetPay = data.GrossPay - data.TotalDeductions;

                                    await API.post('/payroll', data);
                                    Toast.success('Payroll record created successfully!');
                                    App.router.navigate('/payroll');
                                } catch (err) {
                                    Toast.error('Failed to create payroll: ' + err.message);
                                }
                            }
                        }
                    }
                ]
            });
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>${e.message}</p></div>`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // MODULE: ATTENDANCE
    // ─────────────────────────────────────────────────────────
    async function loadAttendance(route, params) {
        if (route.action === 'detail') return loadAttendanceDetail(params.id);
        showLoading();
        try {
            const today = new Date().toISOString().slice(0, 10);
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
            const records = await API.get('/attendance', { from: monthStart, to: today });
            const employees = await API.get('/employees');

            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left"><h1>Attendance</h1><p>Track employee check-ins and working hours</p></div>
            <div class="page-header-right">
              <button class="btn btn-success" id="checkin-btn" onclick="App.quickCheckIn()"><i class="fa-solid fa-clock"></i> Quick Check-In</button>
              <button class="btn btn-primary" onclick="App.addAttendance()"><i class="fa-solid fa-plus"></i> Add Record</button>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
            ${[
                    { icon: 'users', label: 'Total Records', value: records.length, color: 'blue' },
                    { icon: 'circle-check', label: 'Present Today', value: records.filter(r => r.AttendanceDate === today && r.Status === 'Present').length, color: 'green' },
                    { icon: 'clock-rotate-left', label: 'Late Today', value: records.filter(r => r.AttendanceDate === today && r.Status === 'Late').length, color: 'yellow' },
                    { icon: 'circle-xmark', label: 'Absent Today', value: records.filter(r => r.AttendanceDate === today && r.Status === 'Absent').length, color: 'red' },
                ].map(c => `
              <div class="stat-card">
                <div class="stat-icon ${c.color}"><i class="fa-solid fa-${c.icon}"></i></div>
                <div class="stat-info"><div class="stat-value">${c.value}</div><div class="stat-label">${c.label}</div></div>
              </div>
            `).join('')}
          </div>

          <div class="card">
            <div id="attendance-grid" style="min-height:450px"></div>
          </div>
        </div>
      `);

            $('#attendance-grid').dxDataGrid({
                dataSource: records,
                keyExpr: 'AttendanceId',
                showBorders: false,
                rowAlternationEnabled: true,
                paging: { pageSize: 20 },
                filterRow: { visible: true },
                searchPanel: { visible: true, width: 240 },
                columns: [
                    {
                        caption: 'Employee', width: 200,
                        cellTemplate(cell, info) {
                            const name = (info.data.Employee?.FirstName || '') + ' ' + (info.data.Employee?.LastName || '');
                            cell.append($(`
                <div class="flex gap-8" style="align-items:center">
                  <div class="emp-avatar" style="background:${avatarColor(name)};font-size:11px">${initials(name)}</div>
                  <span style="font-weight:600;font-size:13px">${name}</span>
                </div>
              `));
                        }
                    },
                    { dataField: 'AttendanceDate', caption: 'Date', dataType: 'date', format: 'MMM dd, yyyy', width: 130, sortOrder: 'desc' },
                    {
                        dataField: 'CheckIn', caption: 'Check In', width: 100,
                        calculateCellValue: r => r.CheckIn ? r.CheckIn.substring(0, 5) : '-'
                    },
                    {
                        dataField: 'CheckOut', caption: 'Check Out', width: 100,
                        calculateCellValue: r => r.CheckOut ? r.CheckOut.substring(0, 5) : '-'
                    },
                    { dataField: 'WorkedHours', caption: 'Hours', format: { type: 'fixedPoint', precision: 1 }, width: 80 },
                    {
                        dataField: 'Status', caption: 'Status', width: 100,
                        cellTemplate(cell, info) { cell.append($(statusBadge(info.data.Status))); }
                    },
                    {
                        dataField: 'IsLate', caption: 'Late', width: 70,
                        cellTemplate(cell, info) {
                            if (info.data.IsLate) cell.append($(`<span class="badge badge-warning">${info.data.LateMinutes}m</span>`));
                            else cell.append($('<span style="color:var(--gray-400)">-</span>'));
                        }
                    },
                    {
                        caption: 'Actions', width: 100, allowFiltering: false,
                        cellTemplate(cell, info) {
                            cell.append($(`
                <div class="flex gap-8">
                  <button class="btn btn-sm btn-secondary btn-icon" onclick="App.editAttendance(${info.data.AttendanceId})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteAttendance(${info.data.AttendanceId})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
              `));
                        }
                    }
                ]
            });
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>${e.message}</p></div>`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // MODULE: LEAVE
    // ─────────────────────────────────────────────────────────
    async function loadLeave(route, params) {
        if (route.action === 'new') return openLeaveForm();
        if (route.action === 'detail') return loadLeaveDetail(params.id);
        showLoading();
        try {
            const [requests, types] = await Promise.all([
                API.get('/leave'),
                API.get('/leave/types')
            ]);

            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left"><h1>Leave Management</h1><p>Manage employee leave requests</p></div>
            <div class="page-header-right">
              <button class="btn btn-primary" data-href="/leave/new"><i class="fa-solid fa-plus"></i> New Request</button>
            </div>
          </div>

          <div class="tab-bar" id="leave-tabs">
            ${['All', 'Pending', 'Approved', 'Rejected'].map(s =>
                `<div class="tab-item ${s === 'All' ? 'active' : ''}" data-status="${s}">${s}${s === 'Pending' ? ` <span class="badge badge-warning" style="margin-left:4px">${requests.filter(r => r.Status === 'Pending').length}</span>` : ''}</div>`
            ).join('')}
          </div>

          <div class="card">
            <div id="leave-grid" style="min-height:450px"></div>
          </div>
        </div>
      `);

            let currentData = [...requests];

            function renderGrid(data) {
                const inst = $('#leave-grid').dxDataGrid('instance');
                if (inst) { inst.option('dataSource', data); return; }

                $('#leave-grid').dxDataGrid({
                    dataSource: data,
                    keyExpr: 'LeaveRequestId',
                    showBorders: false,
                    rowAlternationEnabled: true,
                    paging: { pageSize: 15 },
                    filterRow: { visible: true },
                    searchPanel: { visible: true, width: 240 },
                    columns: [
                        {
                            caption: 'Employee', width: 200,
                            cellTemplate(cell, info) {
                                const name = (info.data.Employee?.FirstName || '') + ' ' + (info.data.Employee?.LastName || '');
                                cell.append($(`
                  <div class="flex gap-8" style="align-items:center">
                    <div class="emp-avatar" style="background:${avatarColor(name)};font-size:11px">${initials(name)}</div>
                    <div>
                      <div style="font-weight:600;font-size:13px">${name}</div>
                      <div style="font-size:11.5px;color:var(--gray-500)">${info.data.Employee?.Department?.DepartmentName || ''}</div>
                    </div>
                  </div>
                `));
                            }
                        },
                        { dataField: 'LeaveType.TypeName', caption: 'Leave Type', width: 130 },
                        { dataField: 'StartDate', caption: 'Start Date', dataType: 'date', format: 'MMM dd, yyyy', width: 120, sortOrder: 'desc' },
                        { dataField: 'EndDate', caption: 'End Date', dataType: 'date', format: 'MMM dd, yyyy', width: 120 },
                        { dataField: 'TotalDays', caption: 'Days', width: 70, format: { type: 'fixedPoint', precision: 1 } },
                        {
                            dataField: 'Status', caption: 'Status', width: 100,
                            cellTemplate(cell, info) { cell.append($(statusBadge(info.data.Status))); }
                        },
                        { dataField: 'Reason', caption: 'Reason', minWidth: 150 },
                        {
                            caption: 'Actions', width: 160, allowFiltering: false,
                            cellTemplate(cell, info) {
                                const btns = [`<button class="btn btn-sm btn-secondary btn-icon" onclick="App.viewLeave(${info.data.LeaveRequestId})" title="View"><i class="fa-solid fa-eye"></i></button>`];
                                if (info.data.Status === 'Pending') {
                                    btns.push(`<button class="btn btn-sm btn-success btn-icon" onclick="App.approveLeave(${info.data.LeaveRequestId})" title="Approve"><i class="fa-solid fa-check"></i></button>`);
                                    btns.push(`<button class="btn btn-sm btn-danger btn-icon" onclick="App.rejectLeave(${info.data.LeaveRequestId})" title="Reject"><i class="fa-solid fa-xmark"></i></button>`);
                                }
                                btns.push(`<button class="btn btn-sm btn-danger btn-icon" onclick="App.deleteLeave(${info.data.LeaveRequestId})" title="Delete"><i class="fa-solid fa-trash"></i></button>`);
                                cell.append($(`<div class="flex gap-8">${btns.join('')}</div>`));
                            }
                        }
                    ]
                });
            }

            renderGrid(currentData);

            // Tab switching
            document.querySelectorAll('#leave-tabs .tab-item').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('#leave-tabs .tab-item').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const status = tab.dataset.status;
                    const filtered = status === 'All' ? requests : requests.filter(r => r.Status === status);
                    renderGrid(filtered);
                });
            });
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>${e.message}</p></div>`);
        }
    }

    async function openLeaveForm() {
        showLoading();
        try {
            const [employees, types] = await Promise.all([
                API.get('/employees'),
                API.get('/leave/types')
            ]);

            setOutlet(`
        <div class="page-enter">
          <div class="page-header">
            <div class="page-header-left"><h1>New Leave Request</h1><p>Submit a leave request for an employee</p></div>
            <div class="page-header-right">
              <button class="btn btn-secondary" onclick="App.router.navigate('/leave')"><i class="fa-solid fa-xmark"></i> Cancel</button>
            </div>
          </div>
          <div class="card" style="max-width:700px"><div id="leave-form-container"></div></div>
        </div>
      `);

            const formData = { Status: 'Pending', HalfDay: false, TotalDays: 1 };

            function calcDays(form) {
                const d = form.option('formData');
                if (d.StartDate && d.EndDate) {
                    const diff = (new Date(d.EndDate) - new Date(d.StartDate)) / (1000 * 60 * 60 * 24) + 1;
                    const days = d.HalfDay ? 0.5 : diff;
                    form.updateData('TotalDays', days);
                }
            }

            $('#leave-form-container').dxForm({
                formData,
                colCount: 2,
                labelLocation: 'top',
                items: [
                    { dataField: 'EmployeeId', label: { text: 'Employee' }, editorType: 'dxSelectBox', editorOptions: { dataSource: employees, valueExpr: 'EmployeeId', displayExpr: e => e.FirstName + ' ' + e.LastName, searchEnabled: true }, colSpan: 2, validationRules: [{ type: 'required' }] },
                    { dataField: 'LeaveTypeId', label: { text: 'Leave Type' }, editorType: 'dxSelectBox', editorOptions: { dataSource: types, valueExpr: 'LeaveTypeId', displayExpr: 'TypeName' }, colSpan: 2, validationRules: [{ type: 'required' }] },
                    { dataField: 'StartDate', label: { text: 'Start Date' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy', onValueChanged(e) { calcDays(e.component._$element.closest('.dx-form').dxForm('instance')); } }, validationRules: [{ type: 'required' }] },
                    { dataField: 'EndDate', label: { text: 'End Date' }, editorType: 'dxDateBox', editorOptions: { displayFormat: 'MMM dd, yyyy', onValueChanged(e) { calcDays(e.component._$element.closest('.dx-form').dxForm('instance')); } }, validationRules: [{ type: 'required' }] },
                    { dataField: 'TotalDays', label: { text: 'Total Days' }, editorType: 'dxNumberBox', editorOptions: { readOnly: true, min: 0.5 } },
                    { dataField: 'HalfDay', label: { text: 'Half Day?' }, editorType: 'dxCheckBox' },
                    { dataField: 'Reason', label: { text: 'Reason' }, editorType: 'dxTextArea', editorOptions: { height: 80 }, colSpan: 2, validationRules: [{ type: 'required' }] },
                    {
                        itemType: 'button', colSpan: 2,
                        buttonOptions: {
                            text: 'Submit Leave Request', type: 'default',
                            onClick: async () => {
                                const form = $('#leave-form-container').dxForm('instance');
                                if (!form.validate().isValid) return;
                                try {
                                    const leaveData = form.option('formData');
                                    sanitizeDates(leaveData, ['StartDate', 'EndDate']);
                                    await API.post('/leave', leaveData);
                                    Toast.success('Leave request submitted!');
                                    App.router.navigate('/leave');
                                } catch (err) { Toast.error(err.message); }
                            }
                        }
                    }
                ]
            });
        } catch (e) {
            setOutlet(`<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>${e.message}</p></div>`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // Global Action Handlers (called from grid cell templates)
    // ─────────────────────────────────────────────────────────
    const App = {
        router: null,

        viewEmployee(id) { this.router.navigate(`/employees/${id}`); },
        editEmployee(id) { this.router.navigate(`/employees/${id}/edit`); },
        async deleteEmployee(id, name) {
            if (!confirm(`Deactivate ${name}?`)) return;
            try { await API.delete(`/employees/${id}`); Toast.success('Employee deactivated.'); loadEmployees({ module: 'employees' }, {}); }
            catch (e) { Toast.error(e.message); }
        },

        viewPayroll(id) { this.router.navigate(`/payroll/${id}`); },
        async approvePayroll(id) {
            try { await API.post(`/payroll/${id}/approve`, { ApprovedBy: 'Admin' }); Toast.success('Payroll approved!'); this.router.navigate('/payroll'); }
            catch (e) { Toast.error(e.message); }
        },
        async payPayroll(id) {
            try { await API.post(`/payroll/${id}/pay`, {}); Toast.success('Payroll marked as paid!'); this.router.navigate('/payroll'); }
            catch (e) { Toast.error(e.message); }
        },
        async deletePayroll(id) {
            if (!confirm('Delete this payroll record?')) return;
            try { await API.delete(`/payroll/${id}`); Toast.success('Deleted.'); this.router.navigate('/payroll'); }
            catch (e) { Toast.error(e.message); }
        },

        async quickCheckIn() {
            Modal.open('Quick Check-In', `
        <div class="form-group">
          <label class="form-label">Select Employee <span class="req">*</span></label>
          <select id="checkin-emp" class="form-control">
            <option value="">Loading employees...</option>
          </select>
        </div>
        <div class="modal-footer" style="padding:0;border:0;margin-top:16px">
          <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
          <button class="btn btn-success" onclick="App._doCheckIn()"><i class="fa-solid fa-clock"></i> Check In Now</button>
        </div>
      `);
            const emps = await API.get('/employees');
            const sel = document.getElementById('checkin-emp');
            sel.innerHTML = emps.map(e => `<option value="${e.EmployeeId}">${e.FirstName} ${e.LastName}</option>`).join('');
        },
        async _doCheckIn() {
            const id = document.getElementById('checkin-emp')?.value;
            if (!id) return;
            try {
                await API.post(`/attendance/checkin/${id}`, {});
                Toast.success('Check-in recorded!');
                Modal.close();
            } catch (e) { Toast.error(e.message); }
        },

        addAttendance() { loadAttendance({ module: 'attendance', action: 'new' }, {}); },
        editAttendance(id) { /* Could open edit modal */ Toast.warning('Edit attendance not implemented in demo'); },
        async deleteAttendance(id) {
            if (!confirm('Delete this attendance record?')) return;
            try { await API.delete(`/attendance/${id}`); Toast.success('Deleted.'); this.router.navigate('/attendance'); }
            catch (e) { Toast.error(e.message); }
        },

        viewLeave(id) { this.router.navigate(`/leave/${id}`); },
        async approveLeave(id) {
            try { await API.post(`/leave/${id}/approve`, { ApprovedById: 1 }); Toast.success('Leave approved!'); this.router.navigate('/leave'); }
            catch (e) { Toast.error(e.message); }
        },
        async rejectLeave(id) {
            Modal.open('Reject Leave Request', `
        <div class="form-group">
          <label class="form-label">Rejection Reason <span class="req">*</span></label>
          <textarea id="reject-reason" class="form-control" rows="3" placeholder="Please provide a reason..."></textarea>
        </div>
        <div class="modal-footer" style="padding:0;border:0;margin-top:16px">
          <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
          <button class="btn btn-danger" onclick="App._doRejectLeave(${id})">Reject Request</button>
        </div>
      `);
        },
        async _doRejectLeave(id) {
            const reason = document.getElementById('reject-reason')?.value;
            if (!reason) { Toast.warning('Please enter a reason'); return; }
            try { await API.post(`/leave/${id}/reject`, { Reason: reason }); Toast.success('Leave rejected.'); Modal.close(); this.router.navigate('/leave'); }
            catch (e) { Toast.error(e.message); }
        },
        async deleteLeave(id) {
            if (!confirm('Delete this leave request?')) return;
            try { await API.delete(`/leave/${id}`); Toast.success('Deleted.'); this.router.navigate('/leave'); }
            catch (e) { Toast.error(e.message); }
        },
    };

    window.App = App;
    window.Modal = Modal;
    window.Toast = Toast;

    // ─── Boot ──────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        const router = new Router();
        App.router = router;

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Modal close
        document.getElementById('modal-close')?.addEventListener('click', () => Modal.close());
        document.getElementById('modal-overlay')?.addEventListener('click', e => {
            if (e.target === document.getElementById('modal-overlay')) Modal.close();
        });

        // Register route handlers
        router
            .on('dashboard', loadDashboard)
            .on('employees', loadEmployees)
            .on('payroll', loadPayroll)
            .on('attendance', loadAttendance)
            .on('leave', loadLeave);

        // Start
        router.start();
    });

})(window, jQuery);