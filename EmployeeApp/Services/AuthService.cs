using System.Security.Claims;
using EmployeeApp.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace EmployeeApp.Services;

// ──────────────────────────────────────────────────────────────
// ViewModels
// ──────────────────────────────────────────────────────────────
public class LoginViewModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
    public string? ReturnUrl { get; set; }
}

public class LoginResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public AppUser? User { get; set; }
}

// ──────────────────────────────────────────────────────────────
// Auth Service
// ──────────────────────────────────────────────────────────────
public interface IAuthService
{
    Task<LoginResult> LoginAsync(string username, string password);
    Task LogoutAsync(HttpContext httpContext);
    Task<AppUser?> GetUserAsync(string username);
    Task<bool> CreateUserAsync(string username, string email, string fullName, string password, string role);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db = db;

    public async Task<LoginResult> LoginAsync(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return new LoginResult { Success = false, Error = "Username and password are required." };

        var user = await _db.AppUsers
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

        if (user is null)
            return new LoginResult { Success = false, Error = "Invalid username or password." };

        // Verify BCrypt password hash
        bool valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!valid)
            return new LoginResult { Success = false, Error = "Invalid username or password." };

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new LoginResult { Success = true, User = user };
    }

    public async Task LogoutAsync(HttpContext httpContext)
    {
        await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    }

    public async Task<AppUser?> GetUserAsync(string username) =>
        await _db.AppUsers.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<bool> CreateUserAsync(string username, string email, string fullName, string password, string role)
    {
        if (await _db.AppUsers.AnyAsync(u => u.Username == username || u.Email == email))
            return false;

        var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 11);
        _db.AppUsers.Add(new AppUser
        {
            Username = username,
            Email = email,
            FullName = fullName,
            PasswordHash = hash,
            Role = role,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return true;
    }

    // Build ClaimsPrincipal from AppUser for cookie sign-in
    public static ClaimsPrincipal BuildPrincipal(AppUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name,           user.Username),
            new(ClaimTypes.Email,          user.Email),
            new("FullName",                user.FullName),
            new(ClaimTypes.Role,           user.Role),
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        return new ClaimsPrincipal(identity);
    }
}