/**
 * router.js — Client-side SPA Router with HTML5 History API
 * Supports dynamic segments, guards, and nested routes
 */

; (function (window) {
    'use strict';

    // ─── Route Registry ────────────────────────────────────────
    const ROUTES = [
        { path: '/', module: 'dashboard', label: 'Dashboard' },
        { path: '/dashboard', module: 'dashboard', label: 'Dashboard' },
        { path: '/employees', module: 'employees', label: 'Employees' },
        { path: '/employees/new', module: 'employees', label: 'New Employee', action: 'new' },
        { path: '/employees/:id', module: 'employees', label: 'Employee Detail', action: 'detail' },
        { path: '/employees/:id/edit', module: 'employees', label: 'Edit Employee', action: 'edit' },
        { path: '/payroll', module: 'payroll', label: 'Payroll' },
        { path: '/payroll/new', module: 'payroll', label: 'New Payroll', action: 'new' },
        { path: '/payroll/:id', module: 'payroll', label: 'Payroll Detail', action: 'detail' },
        { path: '/attendance', module: 'attendance', label: 'Attendance' },
        { path: '/attendance/:id', module: 'attendance', label: 'Attendance Detail', action: 'detail' },
        { path: '/leave', module: 'leave', label: 'Leave Management' },
        { path: '/leave/new', module: 'leave', label: 'New Leave Request', action: 'new' },
        { path: '/leave/:id', module: 'leave', label: 'Leave Detail', action: 'detail' },
    ];

    // ─── Path Matching ─────────────────────────────────────────
    function matchRoute(pathname) {
        for (const route of ROUTES) {
            const result = matchPath(route.path, pathname);
            if (result) return { route, params: result };
        }
        return null;
    }

    function matchPath(pattern, pathname) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = pathname.split('/').filter(Boolean);
        if (patternParts.length !== pathParts.length) return null;
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }

    // ─── Router Class ──────────────────────────────────────────
    class Router {
        constructor() {
            this._handlers = {};
            this._currentRoute = null;
            this._beforeHooks = [];
            this._afterHooks = [];
            this._init();
        }

        _init() {
            // Intercept all nav-item clicks
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('[data-route]');
                if (navItem) {
                    e.preventDefault();
                    this.navigate('/' + navItem.dataset.route);
                    return;
                }
                const routeLink = e.target.closest('[data-href]');
                if (routeLink) {
                    e.preventDefault();
                    this.navigate(routeLink.dataset.href);
                    return;
                }
                // Standard <a> with relative path
                const link = e.target.closest('a[href]');
                if (link && link.href && !link.href.startsWith('http') && !link.target) {
                    const url = new URL(link.href);
                    if (url.origin === window.location.origin) {
                        e.preventDefault();
                        this.navigate(url.pathname);
                    }
                }
            });

            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                this._handleRoute(window.location.pathname, false);
            });
        }

        // Register a route handler
        on(module, handler) {
            this._handlers[module] = handler;
            return this;
        }

        // Navigation guards
        beforeEach(fn) { this._beforeHooks.push(fn); return this; }
        afterEach(fn) { this._afterHooks.push(fn); return this; }

        // Navigate programmatically
        navigate(path, replace = false) {
            if (replace) {
                history.replaceState(null, '', path);
            } else {
                history.pushState(null, '', path);
            }
            this._handleRoute(path, true);
        }

        // Handle route change
        async _handleRoute(pathname, isNavigation) {
            const matched = matchRoute(pathname);

            // Run before hooks
            for (const hook of this._beforeHooks) {
                const result = await hook(matched, this._currentRoute);
                if (result === false) return;
            }

            this._currentRoute = matched;

            if (matched) {
                const { route, params } = matched;
                this._updateNav(route.module);
                this._updateBreadcrumb(route);
                const handler = this._handlers[route.module];
                if (handler) handler(route, params);
            } else {
                this._render404();
            }

            // Run after hooks
            for (const hook of this._afterHooks) hook(matched);

            // Scroll to top
            const outlet = document.getElementById('page-outlet');
            if (outlet) outlet.scrollTop = 0;
        }

        _updateNav(activeModule) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.route === activeModule);
            });
        }

        _updateBreadcrumb(route) {
            const el = document.getElementById('breadcrumb');
            if (!el) return;
            const parts = route.path.split('/').filter(Boolean);
            if (parts.length <= 1) {
                el.innerHTML = `<span class="crumb-active">${route.label}</span>`;
            } else {
                const base = parts[0];
                const baseRoute = ROUTES.find(r => r.path === '/' + base);
                el.innerHTML = `
          <span data-href="/${base}" style="cursor:pointer">${baseRoute?.label || base}</span>
          <i class="fa-solid fa-chevron-right" style="font-size:10px;color:var(--gray-400)"></i>
          <span class="crumb-active">${route.label}</span>
        `;
            }
        }

        _render404() {
            const outlet = document.getElementById('page-outlet');
            if (outlet) {
                outlet.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h3>Page Not Found</h3>
            <p>The page you're looking for doesn't exist.</p>
            <button class="btn btn-primary mt-16" data-href="/dashboard">Back to Dashboard</button>
          </div>`;
            }
        }

        // Start routing
        start() {
            this._handleRoute(window.location.pathname, false);
        }
    }

    window.Router = Router;

})(window);