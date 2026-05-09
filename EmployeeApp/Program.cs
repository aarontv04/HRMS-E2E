using DevExtreme.AspNet.Data;
using EmployeeApp.Data;
using EmployeeApp.Infrastructure;
using EmployeeApp.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────
// MVC + JSON
// ──────────────────────────────────────────────────────────────
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(opt =>
    {
        opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        opt.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
        opt.SerializerSettings.ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver();
        opt.SerializerSettings.Converters.Add(new DateOnlyJsonConverter());
        opt.SerializerSettings.Converters.Add(new NullableDateOnlyJsonConverter());
    });

// ──────────────────────────────────────────────────────────────
// Cookie Authentication
// ──────────────────────────────────────────────────────────────
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(opt =>
    {
        opt.LoginPath = "/auth/login";
        opt.LogoutPath = "/auth/logout";
        opt.AccessDeniedPath = "/auth/login";
        opt.Cookie.Name = "HRMSuite.Auth";
        opt.Cookie.HttpOnly = true;
        opt.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.SameAsRequest;
        opt.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
        opt.ExpireTimeSpan = TimeSpan.FromHours(8);
        opt.SlidingExpiration = true;
        // Return 401 JSON for API routes instead of redirecting
        opt.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = ctx =>
            {
                if (ctx.Request.Path.StartsWithSegments("/api"))
                {
                    ctx.Response.StatusCode = 401;
                    return Task.CompletedTask;
                }
                ctx.Response.Redirect(ctx.RedirectUri);
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ──────────────────────────────────────────────────────────────
// EF Core – SQL Server
// ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure(3)
    )
);

// ──────────────────────────────────────────────────────────────
// Application Services
// ──────────────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

builder.Services.AddAutoMapper(typeof(Program));

// Session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(opt =>
{
    opt.IdleTimeout = TimeSpan.FromMinutes(60);
    opt.Cookie.HttpOnly = true;
    opt.Cookie.IsEssential = true;
});

// CORS
builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p =>
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()
    )
);

// Antiforgery (for login form CSRF protection)
builder.Services.AddAntiforgery(opt => opt.Cookie.Name = "HRMSuite.CSRF");

var app = builder.Build();

// ──────────────────────────────────────────────────────────────
// Middleware Pipeline
// ──────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseSession();

app.UseAuthentication();   // ← Must come before UseAuthorization
app.UseAuthorization();

// ──────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────

// Auth routes (no [Authorize] needed — handled in controller)
app.MapControllerRoute("auth", "auth/{action}", new { controller = "Auth" });

// API routes
app.MapControllerRoute("api-employees", "api/employees/{action}/{id?}", new { controller = "Employee" });
app.MapControllerRoute("api-payroll", "api/payroll/{action}/{id?}", new { controller = "Payroll" });
app.MapControllerRoute("api-attendance", "api/attendance/{action}/{id?}", new { controller = "Attendance" });
app.MapControllerRoute("api-leave", "api/leave/{action}/{id?}", new { controller = "Leave" });
app.MapControllerRoute("api-dashboard", "api/dashboard/{action}", new { controller = "Dashboard" });

// SPA module routes
app.MapControllerRoute("module-detail", "{module:regex(^(employees|payroll|attendance|leave)$)}/{action}/{id:int}", new { controller = "Spa", action = "Module" });
app.MapControllerRoute("module-action", "{module:regex(^(employees|payroll|attendance|leave)$)}/{action}", new { controller = "Spa", action = "Module" });
app.MapControllerRoute("module-root", "{module:regex(^(employees|payroll|attendance|leave)$)}", new { controller = "Spa", action = "Module" });

// Default
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");

// SPA fallback
app.MapFallbackToController("Index", "Home");

// ──────────────────────────────────────────────────────────────
// Auto-migrate in dev
// ──────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.Run();