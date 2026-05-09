/* =============================================================
   HRM Suite – Premium Design System
   Font: Plus Jakarta Sans (Google Fonts)
   ============================================================= */

:root {
    /* Brand Palette */
    --primary:        #2563eb;
    --primary - hover:  #1d4ed8;
    --primary - light: #eff6ff;
    --primary - dark:   #1e40af;

    --accent:         #0ea5e9;
    --success:        #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --purple:         #8b5cf6;

    /* Neutrals */
    --gray - 50: #f8fafc;
    --gray - 100: #f1f5f9;
    --gray - 200: #e2e8f0;
    --gray - 300: #cbd5e1;
    --gray - 400:       #94a3b8;
    --gray - 500:       #64748b;
    --gray - 600:       #475569;
    --gray - 700:       #334155;
    --gray - 800:       #1e293b;
    --gray - 900:       #0f172a;

    /* Sidebar */
    --sidebar - w: 260px;
    --sidebar - bg:     #0f172a;
    --sidebar - border: rgba(255, 255, 255, 0.06);

    /* Surface */
    --surface: #ffffff;
    --surface - raised: #ffffff;
    --bg: #f1f5f9;

    /* Typography */
    --font - body: 'Plus Jakarta Sans', sans - serif;
    --font - mono: 'JetBrains Mono', monospace;

    /* Shadows */
    --shadow - xs: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow - sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow - md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
    --shadow - lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
    --shadow - xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

    /* Radius */
    --r - sm: 6px;
    --r - md: 10px;
    --r - lg: 14px;
    --r - xl: 20px;
    --r - full: 9999px;

    /* Transitions */
    --t - fast: 0.15s ease;
    --t - med: 0.25s ease;
    --t - slow: 0.4s cubic - bezier(0.4, 0, 0.2, 1);
}

/* ─── Reset ────────────────────────────────────────────────── */
*, *:: before, *::after { box - sizing: border - box; margin: 0; padding: 0; }
html, body { height: 100 %; overflow: hidden; }
body {
    font - family: var(--font - body);
    font - size: 14px;
    color: var(--gray - 800);
    background: var(--bg);
    -webkit - font - smoothing: antialiased;
}
a { text - decoration: none; color: inherit; }
button { cursor: pointer; border: none; background: none; font - family: inherit; }
input, select, textarea { font - family: inherit; }

/* ─── App Shell ─────────────────────────────────────────────── */
#app - shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

/* ─── Sidebar ───────────────────────────────────────────────── */
.sidebar {
    width: var(--sidebar - w);
    min - width: var(--sidebar - w);
    height: 100vh;
    background: var(--sidebar - bg);
    display: flex;
    flex - direction: column;
    position: relative;
    z - index: 100;
    transition: width var(--t - slow), min - width var(--t - slow);
    overflow: hidden;
}

.sidebar.collapsed {
    width: 68px;
    min - width: 68px;
}

/* Logo */
.sidebar - logo {
    display: flex;
    align - items: center;
    gap: 12px;
    padding: 20px 18px;
    border - bottom: 1px solid var(--sidebar - border);
    min - height: 72px;
}

.logo - icon {
    width: 36px;
    height: 36px;
    min - width: 36px;
    background: linear - gradient(135deg, var(--primary), var(--accent));
    border - radius: var(--r - md);
    display: flex;
    align - items: center;
    justify - content: center;
    color: white;
    font - size: 16px;
    box - shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.logo - text {
    display: flex;
    flex - direction: column;
    opacity: 1;
    transition: opacity var(--t - med);
    white - space: nowrap;
}
.sidebar.collapsed.logo - text { opacity: 0; pointer - events: none; }

.logo - title {
    font - size: 15px;
    font - weight: 700;
    color: #fff;
    letter - spacing: -0.3px;
}
.logo - sub {
    font - size: 10px;
    color: var(--gray - 400);
    font - weight: 500;
    letter - spacing: 0.5px;
    text - transform: uppercase;
}

/* Nav */
.sidebar - nav {
    flex: 1;
    padding: 12px 10px;
    overflow - y: auto;
    overflow - x: hidden;
    display: flex;
    flex - direction: column;
    gap: 2px;
}
.sidebar - nav:: -webkit - scrollbar { width: 4px; }
.sidebar - nav:: -webkit - scrollbar - thumb { background: rgba(255, 255, 255, 0.1); border - radius: 4px; }

.nav - section - label {
    font - size: 9px;
    font - weight: 700;
    letter - spacing: 1.5px;
    color: var(--gray - 500);
    padding: 12px 8px 6px;
    white - space: nowrap;
    transition: opacity var(--t - med);
}
.sidebar.collapsed.nav - section - label { opacity: 0; }

.nav - item {
    display: flex;
    align - items: center;
    gap: 12px;
    padding: 10px 10px;
    border - radius: var(--r - md);
    color: var(--gray - 400);
    font - size: 13.5px;
    font - weight: 500;
    transition: background var(--t - fast), color var(--t - fast);
    position: relative;
    white - space: nowrap;
    cursor: pointer;
}
.nav - item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.nav - item.active {
    background: rgba(37, 99, 235, 0.2);
    color: #fff;
}
.nav - item.active.nav - icon { color: var(--accent); }

.nav - icon {
    width: 32px;
    height: 32px;
    min - width: 32px;
    display: flex;
    align - items: center;
    justify - content: center;
    font - size: 14px;
    border - radius: var(--r - sm);
}

.nav - label {
    transition: opacity var(--t - med);
}
.sidebar.collapsed.nav - label { opacity: 0; }

.nav - badge {
    margin - left: auto;
    background: var(--gray - 600);
    color: #fff;
    font - size: 10px;
    font - weight: 700;
    padding: 2px 7px;
    border - radius: var(--r - full);
    min - width: 20px;
    text - align: center;
    transition: opacity var(--t - med);
}
.nav - badge.pending { background: var(--warning); }
.nav - badge:empty { display: none; }
.sidebar.collapsed.nav - badge { opacity: 0; }

/* Sidebar Footer */
.sidebar - footer {
    padding: 14px 10px;
    border - top: 1px solid var(--sidebar - border);
}

.user - card {
    display: flex;
    align - items: center;
    gap: 10px;
    padding: 8px;
    border - radius: var(--r - md);
    transition: background var(--t - fast);
    cursor: pointer;
}
.user - card:hover { background: rgba(255, 255, 255, 0.06); }

.user - avatar {
    width: 34px;
    height: 34px;
    min - width: 34px;
    background: linear - gradient(135deg, var(--purple), var(--accent));
    border - radius: var(--r - full);
    display: flex;
    align - items: center;
    justify - content: center;
    color: white;
    font - size: 14px;
}

.user - info {
    display: flex;
    flex - direction: column;
    transition: opacity var(--t - med);
}
.sidebar.collapsed.user - info { opacity: 0; }
.user - name { font - size: 12.5px; font - weight: 600; color: #fff; }
.user - role { font - size: 10.5px; color: var(--gray - 400); }

/* ─── Main Content ───────────────────────────────────────────── */
#main - content {
    flex: 1;
    display: flex;
    flex - direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
}

/* ─── Top Bar ───────────────────────────────────────────────── */
.top - bar {
    height: 60px;
    min - height: 60px;
    background: var(--surface);
    border - bottom: 1px solid var(--gray - 200);
    display: flex;
    align - items: center;
    justify - content: space - between;
    padding: 0 24px;
    gap: 16px;
    z - index: 50;
    box - shadow: var(--shadow - xs);
}

.top - bar - left, .top - bar - right {
    display: flex;
    align - items: center;
    gap: 12px;
}

.icon - btn {
    width: 36px;
    height: 36px;
    display: flex;
    align - items: center;
    justify - content: center;
    border - radius: var(--r - md);
    color: var(--gray - 600);
    font - size: 15px;
    transition: background var(--t - fast), color var(--t - fast);
}
.icon - btn:hover { background: var(--gray - 100); color: var(--gray - 900); }

.breadcrumb {
    display: flex;
    align - items: center;
    gap: 6px;
    font - size: 13px;
    color: var(--gray - 500);
    font - weight: 500;
}
.breadcrumb.crumb - active { color: var(--gray - 900); font - weight: 600; }

.search - box {
    display: flex;
    align - items: center;
    gap: 8px;
    background: var(--gray - 100);
    border: 1px solid var(--gray - 200);
    border - radius: var(--r - full);
    padding: 7px 14px;
    transition: border - color var(--t - fast), box - shadow var(--t - fast);
}
.search - box: focus - within {
    border - color: var(--primary);
    box - shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    background: #fff;
}
.search - box i { color: var(--gray - 400); font - size: 13px; }
.search - box input {
    border: none;
    background: none;
    outline: none;
    font - size: 13px;
    width: 180px;
    color: var(--gray - 800);
}
.search - box input::placeholder { color: var(--gray - 400); }

.notif - btn { position: relative; }
.notif - dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 7px;
    height: 7px;
    background: var(--danger);
    border - radius: 50 %;
    border: 2px solid var(--surface);
}

.avatar - btn {
    width: 36px;
    height: 36px;
    background: linear - gradient(135deg, var(--primary), var(--accent));
    border - radius: var(--r - full);
    display: flex;
    align - items: center;
    justify - content: center;
    color: white;
    font - size: 16px;
    cursor: pointer;
}

/* ─── Page Outlet ───────────────────────────────────────────── */
.page - outlet {
    flex: 1;
    overflow - y: auto;
    overflow - x: hidden;
    padding: 24px;
}
.page - outlet:: -webkit - scrollbar { width: 6px; }
.page - outlet:: -webkit - scrollbar - track { background: transparent; }
.page - outlet:: -webkit - scrollbar - thumb { background: var(--gray - 300); border - radius: 4px; }

/* ─── Page Loading ───────────────────────────────────────────── */
.page - loading {
    display: flex;
    align - items: center;
    justify - content: center;
    height: 300px;
}

.spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--gray - 200);
    border - top - color: var(--primary);
    border - radius: 50 %;
    animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Cards ──────────────────────────────────────────────────── */
.card {
    background: var(--surface);
    border - radius: var(--r - lg);
    border: 1px solid var(--gray - 200);
    box - shadow: var(--shadow - sm);
    overflow: hidden;
}
.card - header {
    display: flex;
    align - items: center;
    justify - content: space - between;
    padding: 18px 20px 14px;
    border - bottom: 1px solid var(--gray - 100);
}
.card - title {
    font - size: 14px;
    font - weight: 700;
    color: var(--gray - 800);
}
.card - body { padding: 20px; }
.card - actions { display: flex; gap: 8px; }

/* ─── Stats Cards ────────────────────────────────────────────── */
.stats - grid {
    display: grid;
    grid - template - columns: repeat(4, 1fr);
    gap: 16px;
    margin - bottom: 20px;
}

.stat - card {
    background: var(--surface);
    border - radius: var(--r - lg);
    padding: 20px;
    border: 1px solid var(--gray - 200);
    box - shadow: var(--shadow - sm);
    display: flex;
    align - items: flex - start;
    gap: 16px;
    transition: transform var(--t - fast), box - shadow var(--t - fast);
}
.stat - card:hover { transform: translateY(-2px); box - shadow: var(--shadow - md); }

.stat - icon {
    width: 48px;
    height: 48px;
    border - radius: var(--r - md);
    display: flex;
    align - items: center;
    justify - content: center;
    font - size: 20px;
    flex - shrink: 0;
}
.stat - icon.blue   { background: #dbeafe; color: var(--primary); }
.stat - icon.green  { background: #d1fae5; color: var(--success); }
.stat - icon.yellow { background: #fef3c7; color: var(--warning); }
.stat - icon.red    { background: #fee2e2; color: var(--danger); }
.stat - icon.purple { background: #ede9fe; color: var(--purple); }
.stat - icon.cyan   { background: #e0f2fe; color: var(--accent); }

.stat - info { flex: 1; }
.stat - value {
    font - size: 26px;
    font - weight: 800;
    color: var(--gray - 900);
    line - height: 1;
    margin - bottom: 4px;
    letter - spacing: -0.5px;
}
.stat - label {
    font - size: 12px;
    color: var(--gray - 500);
    font - weight: 500;
}
.stat - change {
    font - size: 11px;
    font - weight: 600;
    margin - top: 6px;
    display: flex;
    align - items: center;
    gap: 4px;
}
.stat - change.up   { color: var(--success); }
.stat - change.down { color: var(--danger); }

/* ─── Grids / Tables ─────────────────────────────────────────── */
.content - grid {
    display: grid;
    grid - template - columns: 1fr 1fr;
    gap: 16px;
    margin - bottom: 16px;
}
.content - grid.full { grid - template - columns: 1fr; }
.content - grid.three { grid - template - columns: 1fr 1fr 1fr; }

/* ─── Page Header ─────────────────────────────────────────────── */
.page - header {
    display: flex;
    align - items: center;
    justify - content: space - between;
    margin - bottom: 20px;
}
.page - header - left h1 {
    font - size: 22px;
    font - weight: 800;
    color: var(--gray - 900);
    letter - spacing: -0.5px;
}
.page - header - left p {
    font - size: 13px;
    color: var(--gray - 500);
    margin - top: 2px;
}
.page - header - right { display: flex; gap: 10px; }

/* ─── Buttons ────────────────────────────────────────────────── */
.btn {
    display: inline - flex;
    align - items: center;
    gap: 7px;
    padding: 8px 16px;
    border - radius: var(--r - md);
    font - size: 13px;
    font - weight: 600;
    font - family: var(--font - body);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all var(--t - fast);
    white - space: nowrap;
}
.btn - primary {
    background: var(--primary);
    color: #fff;
    border - color: var(--primary);
}
.btn - primary:hover { background: var(--primary - hover); }
.btn - secondary {
    background: var(--surface);
    color: var(--gray - 700);
    border - color: var(--gray - 300);
}
.btn - secondary:hover { background: var(--gray - 100); }
.btn - success { background: var(--success); color: #fff; border - color: var(--success); }
.btn - danger  { background: var(--danger); color: #fff; border - color: var(--danger); }
.btn - warning { background: var(--warning); color: #fff; border - color: var(--warning); }
.btn - sm { padding: 5px 10px; font - size: 12px; }
.btn - icon { padding: 8px; width: 34px; height: 34px; justify - content: center; }

/* ─── Badges ─────────────────────────────────────────────────── */
.badge {
    display: inline - flex;
    align - items: center;
    gap: 4px;
    padding: 3px 9px;
    border - radius: var(--r - full);
    font - size: 11px;
    font - weight: 600;
}
.badge - success { background: #d1fae5; color: #065f46; }
.badge - warning { background: #fef3c7; color: #92400e; }
.badge - danger  { background: #fee2e2; color: #991b1b; }
.badge - info    { background: #dbeafe; color: #1e40af; }
.badge - gray    { background: var(--gray - 100); color: var(--gray - 600); }
.badge - purple  { background: #ede9fe; color: #5b21b6; }

/* ─── Forms ──────────────────────────────────────────────────── */
.form - group { margin - bottom: 16px; }
.form - label {
    display: block;
    font - size: 12.5px;
    font - weight: 600;
    color: var(--gray - 700);
    margin - bottom: 6px;
}
.form - label.req { color: var(--danger); margin - left: 2px; }
.form - control {
    width: 100 %;
    padding: 9px 12px;
    border: 1px solid var(--gray - 300);
    border - radius: var(--r - sm);
    font - size: 13.5px;
    color: var(--gray - 800);
    background: #fff;
    outline: none;
    transition: border - color var(--t - fast), box - shadow var(--t - fast);
    font - family: var(--font - body);
}
.form - control:focus {
    border - color: var(--primary);
    box - shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.form - control.is - invalid { border - color: var(--danger); }
.form - error { font - size: 11.5px; color: var(--danger); margin - top: 4px; }
.form - row { display: grid; grid - template - columns: 1fr 1fr; gap: 16px; }
.form - row.three { grid - template - columns: 1fr 1fr 1fr; }

/* ─── DevExpress Grid Override ───────────────────────────────── */
.dx - datagrid {
    font - family: var(--font - body)!important;
    font - size: 13.5px!important;
    border - radius: var(--r - lg)!important;
    border: 1px solid var(--gray - 200)!important;
    overflow: hidden;
}
.dx - datagrid - headers {
    background: var(--gray - 50)!important;
    font - weight: 700!important;
    font - size: 12px!important;
    color: var(--gray - 600)!important;
    text - transform: uppercase;
    letter - spacing: 0.5px;
}
.dx - datagrid - rowsview.dx - row: hover > td {
    background: var(--primary - light)!important;
}
.dx - datagrid.dx - toolbar {
    background: #fff!important;
    padding: 12px 16px!important;
}
.dx - datagrid - pager {
    border - top: 1px solid var(--gray - 200)!important;
    background: var(--gray - 50)!important;
    padding: 8px!important;
}
.dx - button.dx - button -default {
    background: var(--primary)!important;
    border - color: var(--primary)!important;
}
.dx - button.dx - button - danger {
    background: var(--danger)!important;
    border - color: var(--danger)!important;
}

/* ─── Modal ──────────────────────────────────────────────────── */
.modal - overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop - filter: blur(4px);
    z - index: 1000;
    display: flex;
    align - items: center;
    justify - content: center;
    padding: 24px;
    animation: fadeIn 0.2s ease;
}
.modal - overlay.hidden { display: none; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal - container {
    background: var(--surface);
    border - radius: var(--r - xl);
    box - shadow: var(--shadow - xl);
    width: 100 %;
    max - width: 680px;
    max - height: 90vh;
    display: flex;
    flex - direction: column;
    animation: slideUp 0.25s cubic - bezier(0.4, 0, 0.2, 1);
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal - header {
    display: flex;
    align - items: center;
    justify - content: space - between;
    padding: 20px 24px 16px;
    border - bottom: 1px solid var(--gray - 200);
}
.modal - header h3 {
    font - size: 16px;
    font - weight: 700;
    color: var(--gray - 900);
}
.modal - body {
    padding: 24px;
    overflow - y: auto;
    flex: 1;
}

.modal - footer {
    display: flex;
    justify - content: flex - end;
    gap: 10px;
    padding: 16px 24px;
    border - top: 1px solid var(--gray - 100);
}

/* ─── Toast ──────────────────────────────────────────────────── */
.toast - container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z - index: 2000;
    display: flex;
    flex - direction: column;
    gap: 10px;
}

.toast {
    display: flex;
    align - items: center;
    gap: 12px;
    background: var(--gray - 900);
    color: #fff;
    padding: 12px 16px;
    border - radius: var(--r - lg);
    box - shadow: var(--shadow - lg);
    font - size: 13.5px;
    font - weight: 500;
    min - width: 280px;
    max - width: 380px;
    animation: toastIn 0.3s cubic - bezier(0.4, 0, 0.2, 1);
}
@keyframes toastIn { from { transform: translateX(100 %); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.toast.success { background: var(--success); }
.toast.error   { background: var(--danger); }
.toast.warning { background: var(--warning); color: var(--gray - 900); }
.toast i { font - size: 16px; }

/* ─── Page Transition ────────────────────────────────────────── */
.page - enter { animation: pageEnter 0.3s cubic - bezier(0.4, 0, 0.2, 1); }
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Tabs ───────────────────────────────────────────────────── */
.tab - bar {
    display: flex;
    gap: 4px;
    border - bottom: 2px solid var(--gray - 200);
    margin - bottom: 20px;
}
.tab - item {
    padding: 10px 18px;
    font - size: 13px;
    font - weight: 600;
    color: var(--gray - 500);
    cursor: pointer;
    border - bottom: 2px solid transparent;
    margin - bottom: -2px;
    transition: color var(--t - fast), border - color var(--t - fast);
}
.tab - item:hover { color: var(--gray - 800); }
.tab - item.active { color: var(--primary); border - color: var(--primary); }

/* ─── Employee Avatar ────────────────────────────────────────── */
.emp - avatar {
    width: 36px;
    height: 36px;
    border - radius: var(--r - full);
    display: inline - flex;
    align - items: center;
    justify - content: center;
    font - weight: 700;
    font - size: 13px;
    color: white;
    flex - shrink: 0;
}

/* ─── Chart Container ────────────────────────────────────────── */
.chart - wrap {
    position: relative;
    height: 250px;
}

/* ─── Empty State ────────────────────────────────────────────── */
.empty - state {
    display: flex;
    flex - direction: column;
    align - items: center;
    justify - content: center;
    padding: 60px 24px;
    text - align: center;
}
.empty - state i {
    font - size: 48px;
    color: var(--gray - 300);
    margin - bottom: 16px;
}
.empty - state h3 {
    font - size: 16px;
    font - weight: 700;
    color: var(--gray - 600);
    margin - bottom: 6px;
}
.empty - state p { font - size: 13px; color: var(--gray - 400); }

/* ─── Responsive ─────────────────────────────────────────────── */
@media(max - width: 1200px) {
  .stats - grid { grid - template - columns: repeat(2, 1fr); }
}
@media(max - width: 768px) {
  .sidebar { position: absolute; z - index: 200; transform: translateX(-100 %); transition: transform var(--t - slow); }
  .sidebar.mobile - open { transform: translateX(0); }
  .stats - grid { grid - template - columns: 1fr 1fr; }
  .content - grid { grid - template - columns: 1fr; }
  .form - row { grid - template - columns: 1fr; }
}

/* ─── Utility ────────────────────────────────────────────────── */
.hidden { display: none!important; }
.text - right { text - align: right; }
.text - center { text - align: center; }
.mt - 4 { margin - top: 4px; }
.mt - 8 { margin - top: 8px; }
.mt - 16 { margin - top: 16px; }
.mb - 16 { margin - bottom: 16px; }
.flex { display: flex; }
.flex - center { display: flex; align - items: center; justify - content: center; }
.gap - 8 { gap: 8px; }
.gap - 12 { gap: 12px; }
.w - full { width: 100 %; }

/* ─── Dashboard Specific ─────────────────────────────────────── */
.activity - list { list - style: none; }
.activity - item {
    display: flex;
    align - items: flex - start;
    gap: 12px;
    padding: 12px 0;
    border - bottom: 1px solid var(--gray - 100);
}
.activity - item: last - child { border - bottom: none; }
.activity - dot {
    width: 8px;
    height: 8px;
    border - radius: 50 %;
    margin - top: 5px;
    flex - shrink: 0;
}
.activity - text { font - size: 13px; color: var(--gray - 700); line - height: 1.5; }
.activity - time { font - size: 11.5px; color: var(--gray - 400); margin - top: 2px; }

/* Leave Balance Bar */
.balance - row {
    display: flex;
    align - items: center;
    gap: 12px;
    margin - bottom: 14px;
}
.balance - label { font - size: 12.5px; font - weight: 600; color: var(--gray - 700); width: 120px; min - width: 120px; }
.balance - bar - wrap { flex: 1; background: var(--gray - 100); border - radius: var(--r - full); height: 7px; overflow: hidden; }
.balance - bar { height: 100 %; border - radius: var(--r - full); transition: width 0.6s ease; }
.balance - nums { font - size: 12px; color: var(--gray - 500); min - width: 50px; text - align: right; }

/* Payroll Summary */
.payroll - line {
    display: flex;
    justify - content: space - between;
    align - items: center;
    padding: 8px 0;
    border - bottom: 1px solid var(--gray - 100);
    font - size: 13px;
}
.payroll - line: last - child { border - bottom: none; }
.payroll - line.total { font - weight: 700; color: var(--gray - 900); font - size: 14px; }
.payroll - deduction { color: var(--danger); }
.payroll - addition { color: var(--success); }

/* ─── User Card Toggle (Sidebar) ────────────────────────── */
.user - card {
    cursor: pointer;
    position: relative;
}
.user - chevron {
    font - size: 10px;
    color: var(--gray - 500);
    margin - left: auto;
    transition: transform 0.2s ease;
    flex - shrink: 0;
}

/* ─── User Dropdown (Sidebar) ───────────────────────────── */
.user - dropdown {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border - radius: var(--r - md);
    margin: 6px 0 0 0;
    overflow: hidden;
    animation: slideUp 0.2s ease;
}

.user - dropdown - header {
    padding: 12px 14px 10px;
    border - bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.ud - name {
    display: block;
    font - size: 13px;
    font - weight: 700;
    color: #fff;
}
.ud - username {
    font - size: 11.5px;
    color: var(--gray - 500);
}
.ud - divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: 2px 0;
}
.ud - item {
    display: flex;
    align - items: center;
    gap: 10px;
    padding: 9px 14px;
    font - size: 13px;
    color: var(--gray - 400);
    cursor: pointer;
    width: 100 %;
    background: none;
    border: none;
    font - family: var(--font - body);
    text - align: left;
    transition: background var(--t - fast), color var(--t - fast);
    text - decoration: none;
}
.ud - item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
}
.ud - logout {
    color: #fca5a5!important;
}
.ud - logout:hover {
    background: rgba(239, 68, 68, 0.15)!important;
    color: #f87171!important;
}

/* ─── Top-bar User Button ───────────────────────────────── */
.topbar - user {
    display: flex;
    align - items: center;
    gap: 8px;
    padding: 5px 10px 5px 5px;
    border - radius: var(--r - full);
    cursor: pointer;
    transition: background var(--t - fast);
    position: relative;
}
.topbar - user:hover { background: var(--gray - 100); }

.topbar - avatar {
    width: 32px;
    height: 32px;
    border - radius: var(--r - full);
    background: linear - gradient(135deg, var(--primary), var(--accent));
    color: #fff;
    font - size: 12px;
    font - weight: 700;
    display: flex;
    align - items: center;
    justify - content: center;
    flex - shrink: 0;
}
.topbar - name {
    font - size: 13px;
    font - weight: 600;
    color: var(--gray - 700);
    max - width: 120px;
    white - space: nowrap;
    overflow: hidden;
    text - overflow: ellipsis;
}

/* ─── Top-bar Dropdown ──────────────────────────────────── */
.topbar - dropdown {
    position: absolute;
    top: calc(100 % + 8px);
    right: 0;
    background: var(--surface);
    border: 1px solid var(--gray - 200);
    border - radius: var(--r - lg);
    box - shadow: var(--shadow - xl);
    min - width: 220px;
    z - index: 500;
    overflow: hidden;
    animation: slideDown 0.15s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Position relative on top-bar-right for dropdown */
.top - bar - right { position: relative; }

.td - header {
    display: flex;
    align - items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--gray - 50);
    border - bottom: 1px solid var(--gray - 200);
}
.td - avatar {
    width: 38px; height: 38px;
    border - radius: var(--r - full);
    background: linear - gradient(135deg, var(--primary), var(--accent));
    color: #fff;
    font - size: 13px;
    font - weight: 700;
    display: flex; align - items: center; justify - content: center;
    flex - shrink: 0;
}
.td - name {
    font - size: 13.5px;
    font - weight: 700;
    color: var(--gray - 900);
}
.td - role {
    font - size: 11.5px;
    color: var(--gray - 500);
    margin - top: 1px;
}
.td - divider {
    height: 1px;
    background: var(--gray - 100);
    margin: 2px 0;
}
.td - item {
    display: flex;
    align - items: center;
    gap: 10px;
    padding: 10px 16px;
    font - size: 13.5px;
    color: var(--gray - 700);
    cursor: pointer;
    width: 100 %;
    background: none;
    border: none;
    font - family: var(--font - body);
    text - align: left;
    transition: background var(--t - fast);
    text - decoration: none;
}
.td - item:hover { background: var(--gray - 50); }
.td - logout { color: var(--danger)!important; }
.td - logout:hover { background: #fef2f2!important; }