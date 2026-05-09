using EmployeeApp.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeApp.Controllers;

public class AuthController : Controller
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    // ── GET /auth/login ──────────────────────────────────────
    [HttpGet("/auth/login")]
    [AllowAnonymous]
    public IActionResult Login(string? returnUrl = null)
    {
        // Already logged in — go home
        if (User.Identity?.IsAuthenticated == true)
            return Redirect(returnUrl ?? "/");

        ViewData["ReturnUrl"] = returnUrl;
        return View();
    }

    // ── POST /auth/login ─────────────────────────────────────
    [HttpPost("/auth/login")]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(string username, string password,
        bool rememberMe = false, string? returnUrl = null)
    {
        var result = await _auth.LoginAsync(username, password);

        if (!result.Success)
        {
            ViewData["ReturnUrl"] = returnUrl;
            ViewData["Error"] = result.Error;
            ViewData["Username"] = username;
            return View();
        }

        var principal = AuthService.BuildPrincipal(result.User!);

        var authProps = new AuthenticationProperties
        {
            IsPersistent = rememberMe,
            ExpiresUtc = rememberMe
                ? DateTimeOffset.UtcNow.AddDays(30)
                : DateTimeOffset.UtcNow.AddHours(8),
            AllowRefresh = true
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            authProps);

        return Redirect(returnUrl ?? "/");
    }

    // ── POST /auth/logout ────────────────────────────────────
    [HttpPost("/auth/logout")]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _auth.LogoutAsync(HttpContext);
        return RedirectToAction("Login");
    }

    // ── GET /auth/logout (for simple link clicks) ────────────
    [HttpGet("/auth/logout")]
    public async Task<IActionResult> LogoutGet()
    {
        await _auth.LogoutAsync(HttpContext);
        return RedirectToAction("Login");
    }

    // ── GET /auth/me — returns current user info as JSON ─────
    [HttpGet("/auth/me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            Username = User.Identity?.Name,
            FullName = User.FindFirst("FullName")?.Value,
            Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            Role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
        });
    }
}
