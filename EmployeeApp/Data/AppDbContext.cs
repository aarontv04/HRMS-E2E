using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EmployeeApp.Data;

// ──────────────────────────────────────────────────────────────
// Entity Models (Database-First style with Fluent API)
// ──────────────────────────────────────────────────────────────

public class Department
{
    [Key]
    public int DepartmentId { get; set; }

    [Required, MaxLength(10)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string DepartmentName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? ManagerId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(ManagerId))]
    public virtual Employee? Manager { get; set; }
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public virtual ICollection<Position> Positions { get; set; } = new List<Position>();
}

public class Position
{
    [Key]
    public int PositionId { get; set; }

    [Required, MaxLength(10)]
    public string PositionCode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string PositionTitle { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxSalary { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(DepartmentId))]
    public virtual Department? Department { get; set; }
    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
}

public class Employee
{
    [Key]
    public int EmployeeId { get; set; }

    [MaxLength(20)]  // Auto-generated server-side in EmployeeService.CreateAsync — NOT required from client
    public string EmployeeCode { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required, MaxLength(100), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [MaxLength(10)]
    public string? Gender { get; set; }

    [MaxLength(300)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; } = "USA";

    [Required]
    public DateOnly HireDate { get; set; }

    public DateOnly? TerminationDate { get; set; }

    [Required]
    public int DepartmentId { get; set; }

    [Required]
    public int PositionId { get; set; }

    public int? ManagerId { get; set; }

    [Required, MaxLength(20)]
    public string EmploymentType { get; set; } = "FullTime";

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Active";

    [MaxLength(300)]
    public string? PhotoUrl { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Computed
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";

    // Navigation
    [ForeignKey(nameof(DepartmentId))]
    public virtual Department? Department { get; set; }

    [ForeignKey(nameof(PositionId))]
    public virtual Position? Position { get; set; }

    [ForeignKey(nameof(ManagerId))]
    public virtual Employee? Manager { get; set; }

    public virtual ICollection<Employee> DirectReports { get; set; } = new List<Employee>();
    public virtual ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
    public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public virtual ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
}

public class PayrollRecord
{
    [Key]
    public int PayrollId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    public DateOnly PayPeriodStart { get; set; }
    public DateOnly PayPeriodEnd { get; set; }
    public DateOnly PayDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BasicSalary { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? HourlySalary { get; set; }

    [Column(TypeName = "decimal(8,2)")]
    public decimal RegularHours { get; set; }

    [Column(TypeName = "decimal(8,2)")]
    public decimal OvertimeHours { get; set; }

    [Column(TypeName = "decimal(8,2)")]
    public decimal OvertimeRate { get; set; } = 1.5m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal GrossPay { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FederalTax { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal StateTax { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SocialSecurity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Medicare { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal HealthInsurance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Retirement401k { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal OtherDeductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Bonus { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Commission { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal NetPay { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Draft";

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(100)]
    public string? ProcessedBy { get; set; }

    public DateTime? ProcessedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(EmployeeId))]
    public virtual Employee? Employee { get; set; }
}

public class AttendanceRecord
{
    [Key]
    public int AttendanceId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    public DateOnly AttendanceDate { get; set; }

    public TimeOnly? CheckIn { get; set; }
    public TimeOnly? CheckOut { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? WorkedHours { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? OvertimeHours { get; set; } = 0;

    [MaxLength(20)]
    public string Status { get; set; } = "Present";

    public bool IsLate { get; set; }
    public int? LateMinutes { get; set; } = 0;
    public bool EarlyDeparture { get; set; }

    [MaxLength(300)]
    public string? Notes { get; set; }

    public int? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(EmployeeId))]
    public virtual Employee? Employee { get; set; }
}

public class LeaveType
{
    [Key]
    public int LeaveTypeId { get; set; }

    [Required, MaxLength(10)]
    public string TypeCode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string TypeName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int MaxDaysPerYear { get; set; }
    public bool IsPaid { get; set; } = true;
    public bool RequiresApproval { get; set; } = true;
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public virtual ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
}

public class LeaveBalance
{
    [Key]
    public int BalanceId { get; set; }

    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public int Year { get; set; }

    [Column(TypeName = "decimal(5,1)")]
    public decimal Allocated { get; set; }

    [Column(TypeName = "decimal(5,1)")]
    public decimal Used { get; set; }

    [Column(TypeName = "decimal(5,1)")]
    public decimal Pending { get; set; }

    [Column(TypeName = "decimal(5,1)")]
    public decimal CarryOver { get; set; }

    // Computed (not mapped to DB column if using DB computed column, else map it)
    [NotMapped]
    public decimal Remaining => Allocated - Used - Pending;

    // Navigation
    [ForeignKey(nameof(EmployeeId))]
    public virtual Employee? Employee { get; set; }

    [ForeignKey(nameof(LeaveTypeId))]
    public virtual LeaveType? LeaveType { get; set; }
}

public class LeaveRequest
{
    [Key]
    public int LeaveRequestId { get; set; }

    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    [Column(TypeName = "decimal(5,1)")]
    public decimal TotalDays { get; set; }

    public bool HalfDay { get; set; }

    [MaxLength(10)]
    public string? HalfDayPeriod { get; set; }

    [Required, MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public int? ApprovedById { get; set; }
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(300)]
    public string? RejectedReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(EmployeeId))]
    public virtual Employee? Employee { get; set; }

    [ForeignKey(nameof(LeaveTypeId))]
    public virtual LeaveType? LeaveType { get; set; }

    [ForeignKey(nameof(ApprovedById))]
    public virtual Employee? ApprovedBy { get; set; }
}

// ──────────────────────────────────────────────────────────────
// DbContext
// ──────────────────────────────────────────────────────────────

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Department> Departments { get; set; }
    public DbSet<Position> Positions { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<PayrollRecord> PayrollRecords { get; set; }
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    public DbSet<LeaveType> LeaveTypes { get; set; }
    public DbSet<LeaveBalance> LeaveBalances { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<AppUser> AppUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Department
        modelBuilder.Entity<Department>(e =>
        {
            e.HasIndex(d => d.DepartmentCode).IsUnique();
            e.HasOne(d => d.Manager)
             .WithMany()
             .HasForeignKey(d => d.ManagerId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Position
        modelBuilder.Entity<Position>(e =>
        {
            e.HasIndex(p => p.PositionCode).IsUnique();
            e.HasOne(p => p.Department)
             .WithMany(d => d.Positions)
             .HasForeignKey(p => p.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Employee self-referencing
        modelBuilder.Entity<Employee>(e =>
        {
            e.HasIndex(em => em.EmployeeCode).IsUnique();
            e.HasIndex(em => em.Email).IsUnique();
            e.HasOne(em => em.Manager)
             .WithMany(em => em.DirectReports)
             .HasForeignKey(em => em.ManagerId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(em => em.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(em => em.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(em => em.Position)
             .WithMany(p => p.Employees)
             .HasForeignKey(em => em.PositionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Attendance - unique per employee per date
        modelBuilder.Entity<AttendanceRecord>(e =>
        {
            e.HasIndex(a => new { a.EmployeeId, a.AttendanceDate }).IsUnique();
        });

        // LeaveBalance - unique per employee, type, year
        modelBuilder.Entity<LeaveBalance>(e =>
        {
            e.HasIndex(lb => new { lb.EmployeeId, lb.LeaveTypeId, lb.Year }).IsUnique();
        });

        // LeaveRequest - disable cascades to avoid cycles
        modelBuilder.Entity<LeaveRequest>(e =>
        {
            e.HasOne(lr => lr.ApprovedBy)
             .WithMany()
             .HasForeignKey(lr => lr.ApprovedById)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State is EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
        }
    }
}