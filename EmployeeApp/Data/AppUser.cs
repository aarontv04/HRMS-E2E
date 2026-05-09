using System.ComponentModel.DataAnnotations;

namespace EmployeeApp.Data;

public class AppUser
{
    [Key]
    public int UserId { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(256)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Role { get; set; } = "Staff"; // Admin, HR, Staff

    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}