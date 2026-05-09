using EmployeeApp.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeApp.Services;

// ──────────────────────────────────────────────────────────────
// DTOs / ViewModels used by services
// ──────────────────────────────────────────────────────────────
public record DashboardStats(
    int TotalEmployees,
    int ActiveEmployees,
    int OnLeaveToday,
    int PendingLeaveRequests,
    decimal TotalPayrollThisMonth,
    double AverageAttendancePercent,
    IEnumerable<DeptHeadcount> DeptBreakdown,
    IEnumerable<MonthlyPayroll> PayrollTrend
);

public record DeptHeadcount(string Department, int Count);
public record MonthlyPayroll(string Month, decimal Amount);

// ──────────────────────────────────────────────────────────────
// Employee Service
// ──────────────────────────────────────────────────────────────
public interface IEmployeeService
{
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee> CreateAsync(Employee employee);
    Task<Employee> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Department>> GetDepartmentsAsync();
    Task<IEnumerable<Position>> GetPositionsAsync(int? departmentId = null);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null);
}

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _db;
    public EmployeeService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Employee>> GetAllAsync() =>
        await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .AsNoTracking()
            .ToListAsync();

    public async Task<Employee?> GetByIdAsync(int id) =>
        await _db.Employees
            .Include(e => e.Department)
            .Include(e => e.Position)
            .Include(e => e.Manager)
            .FirstOrDefaultAsync(e => e.EmployeeId == id);

    public async Task<Employee> CreateAsync(Employee employee)
    {
        employee.EmployeeCode = await GenerateCodeAsync();
        employee.CreatedAt = employee.UpdatedAt = DateTime.UtcNow;
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<Employee> UpdateAsync(Employee employee)
    {
        employee.UpdatedAt = DateTime.UtcNow;
        _db.Employees.Update(employee);
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var emp = await _db.Employees.FindAsync(id);
        if (emp is null) return false;
        emp.Status = "Inactive";
        emp.TerminationDate = DateOnly.FromDateTime(DateTime.Today);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Department>> GetDepartmentsAsync() =>
        await _db.Departments.Where(d => d.IsActive).OrderBy(d => d.DepartmentName).ToListAsync();

    public async Task<IEnumerable<Position>> GetPositionsAsync(int? departmentId = null)
    {
        var q = _db.Positions.Where(p => p.IsActive);
        if (departmentId.HasValue) q = q.Where(p => p.DepartmentId == departmentId);
        return await q.OrderBy(p => p.PositionTitle).ToListAsync();
    }

    public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
    {
        var q = _db.Employees.Where(e => e.Email == email);
        if (excludeId.HasValue) q = q.Where(e => e.EmployeeId != excludeId);
        return await q.AnyAsync();
    }

    private async Task<string> GenerateCodeAsync()
    {
        var last = await _db.Employees
            .OrderByDescending(e => e.EmployeeId)
            .Select(e => e.EmployeeCode)
            .FirstOrDefaultAsync();

        if (last is null || !int.TryParse(last.Replace("EMP", ""), out int num))
            num = 0;

        return $"EMP{num + 1:D3}";
    }
}

// ──────────────────────────────────────────────────────────────
// Payroll Service
// ──────────────────────────────────────────────────────────────
public interface IPayrollService
{
    Task<IEnumerable<PayrollRecord>> GetAllAsync(int? employeeId = null, int? year = null);
    Task<PayrollRecord?> GetByIdAsync(int id);
    Task<PayrollRecord> CreateAsync(PayrollRecord record);
    Task<PayrollRecord> UpdateAsync(PayrollRecord record);
    Task<bool> DeleteAsync(int id);
    Task<PayrollRecord> ApproveAsync(int id, string approvedBy);
    Task<PayrollRecord> ProcessPaymentAsync(int id);
    decimal CalculateNetPay(PayrollRecord record);
}

public class PayrollService : IPayrollService
{
    private readonly AppDbContext _db;
    public PayrollService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<PayrollRecord>> GetAllAsync(int? employeeId = null, int? year = null)
    {
        var q = _db.PayrollRecords
            .Include(p => p.Employee).ThenInclude(e => e!.Department)
            .AsQueryable();
        if (employeeId.HasValue) q = q.Where(p => p.EmployeeId == employeeId);
        if (year.HasValue) q = q.Where(p => p.PayPeriodStart.Year == year);
        return await q.OrderByDescending(p => p.PayPeriodStart).AsNoTracking().ToListAsync();
    }

    public async Task<PayrollRecord?> GetByIdAsync(int id) =>
        await _db.PayrollRecords
            .Include(p => p.Employee).ThenInclude(e => e!.Department)
            .FirstOrDefaultAsync(p => p.PayrollId == id);

    public async Task<PayrollRecord> CreateAsync(PayrollRecord record)
    {
        record.TotalDeductions = record.FederalTax + record.StateTax + record.SocialSecurity
            + record.Medicare + record.HealthInsurance + record.Retirement401k + record.OtherDeductions;
        record.NetPay = CalculateNetPay(record);
        record.CreatedAt = record.UpdatedAt = DateTime.UtcNow;
        _db.PayrollRecords.Add(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<PayrollRecord> UpdateAsync(PayrollRecord record)
    {
        record.TotalDeductions = record.FederalTax + record.StateTax + record.SocialSecurity
            + record.Medicare + record.HealthInsurance + record.Retirement401k + record.OtherDeductions;
        record.NetPay = CalculateNetPay(record);
        record.UpdatedAt = DateTime.UtcNow;
        _db.PayrollRecords.Update(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var r = await _db.PayrollRecords.FindAsync(id);
        if (r is null) return false;
        _db.PayrollRecords.Remove(r);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<PayrollRecord> ApproveAsync(int id, string approvedBy)
    {
        var r = await _db.PayrollRecords.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = "Approved";
        r.ProcessedBy = approvedBy;
        r.ProcessedAt = DateTime.UtcNow;
        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return r;
    }

    public async Task<PayrollRecord> ProcessPaymentAsync(int id)
    {
        var r = await _db.PayrollRecords.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = "Paid";
        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return r;
    }

    public decimal CalculateNetPay(PayrollRecord r)
    {
        var overtimePay = r.HourlySalary.HasValue
            ? r.OvertimeHours * r.HourlySalary.Value * r.OvertimeRate
            : 0;
        return r.BasicSalary + overtimePay + r.Bonus + r.Commission - r.TotalDeductions;
    }
}

// ──────────────────────────────────────────────────────────────
// Attendance Service
// ──────────────────────────────────────────────────────────────
public interface IAttendanceService
{
    Task<IEnumerable<AttendanceRecord>> GetAllAsync(int? employeeId = null, DateOnly? from = null, DateOnly? to = null);
    Task<AttendanceRecord?> GetByIdAsync(int id);
    Task<AttendanceRecord> CreateAsync(AttendanceRecord record);
    Task<AttendanceRecord> UpdateAsync(AttendanceRecord record);
    Task<bool> DeleteAsync(int id);
    Task<AttendanceRecord> CheckInAsync(int employeeId);
    Task<AttendanceRecord> CheckOutAsync(int employeeId);
}

public class AttendanceService : IAttendanceService
{
    private readonly AppDbContext _db;
    public AttendanceService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<AttendanceRecord>> GetAllAsync(int? employeeId = null, DateOnly? from = null, DateOnly? to = null)
    {
        var q = _db.AttendanceRecords
            .Include(a => a.Employee).ThenInclude(e => e!.Department)
            .AsQueryable();
        if (employeeId.HasValue) q = q.Where(a => a.EmployeeId == employeeId);
        if (from.HasValue) q = q.Where(a => a.AttendanceDate >= from);
        if (to.HasValue) q = q.Where(a => a.AttendanceDate <= to);
        return await q.OrderByDescending(a => a.AttendanceDate).AsNoTracking().ToListAsync();
    }

    public async Task<AttendanceRecord?> GetByIdAsync(int id) =>
        await _db.AttendanceRecords
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(a => a.AttendanceId == id);

    public async Task<AttendanceRecord> CreateAsync(AttendanceRecord record)
    {
        record.CreatedAt = record.UpdatedAt = DateTime.UtcNow;
        if (record.CheckIn.HasValue && record.CheckOut.HasValue)
            record.WorkedHours = (decimal)(record.CheckOut.Value.ToTimeSpan() - record.CheckIn.Value.ToTimeSpan()).TotalHours;
        _db.AttendanceRecords.Add(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<AttendanceRecord> UpdateAsync(AttendanceRecord record)
    {
        if (record.CheckIn.HasValue && record.CheckOut.HasValue)
            record.WorkedHours = (decimal)(record.CheckOut.Value.ToTimeSpan() - record.CheckIn.Value.ToTimeSpan()).TotalHours;
        record.UpdatedAt = DateTime.UtcNow;
        _db.AttendanceRecords.Update(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var r = await _db.AttendanceRecords.FindAsync(id);
        if (r is null) return false;
        _db.AttendanceRecords.Remove(r);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<AttendanceRecord> CheckInAsync(int employeeId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var existing = await _db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == today);

        if (existing is not null)
        {
            existing.CheckIn = TimeOnly.FromDateTime(DateTime.Now);
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return existing;
        }

        var workStart = new TimeOnly(9, 0);
        var now = TimeOnly.FromDateTime(DateTime.Now);
        var lateMinutes = now > workStart ? (int)(now - workStart).TotalMinutes : 0;

        var record = new AttendanceRecord
        {
            EmployeeId = employeeId,
            AttendanceDate = today,
            CheckIn = now,
            Status = lateMinutes > 10 ? "Late" : "Present",
            IsLate = lateMinutes > 10,
            LateMinutes = lateMinutes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.AttendanceRecords.Add(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task<AttendanceRecord> CheckOutAsync(int employeeId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var record = await _db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == today)
            ?? throw new InvalidOperationException("No check-in found for today.");

        record.CheckOut = TimeOnly.FromDateTime(DateTime.Now);
        if (record.CheckIn.HasValue)
            record.WorkedHours = (decimal)(record.CheckOut.Value.ToTimeSpan() - record.CheckIn.Value.ToTimeSpan()).TotalHours;
        record.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return record;
    }
}

// ──────────────────────────────────────────────────────────────
// Leave Service
// ──────────────────────────────────────────────────────────────
public interface ILeaveService
{
    Task<IEnumerable<LeaveRequest>> GetAllAsync(int? employeeId = null, string? status = null);
    Task<LeaveRequest?> GetByIdAsync(int id);
    Task<LeaveRequest> CreateAsync(LeaveRequest request);
    Task<LeaveRequest> UpdateAsync(LeaveRequest request);
    Task<bool> DeleteAsync(int id);
    Task<LeaveRequest> ApproveAsync(int id, int approvedById);
    Task<LeaveRequest> RejectAsync(int id, string reason);
    Task<IEnumerable<LeaveType>> GetLeaveTypesAsync();
    Task<IEnumerable<LeaveBalance>> GetBalancesAsync(int employeeId, int? year = null);
}

public class LeaveService : ILeaveService
{
    private readonly AppDbContext _db;
    public LeaveService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<LeaveRequest>> GetAllAsync(int? employeeId = null, string? status = null)
    {
        var q = _db.LeaveRequests
            .Include(lr => lr.Employee).ThenInclude(e => e!.Department)
            .Include(lr => lr.LeaveType)
            .Include(lr => lr.ApprovedBy)
            .AsQueryable();
        if (employeeId.HasValue) q = q.Where(lr => lr.EmployeeId == employeeId);
        if (!string.IsNullOrEmpty(status)) q = q.Where(lr => lr.Status == status);
        return await q.OrderByDescending(lr => lr.CreatedAt).AsNoTracking().ToListAsync();
    }

    public async Task<LeaveRequest?> GetByIdAsync(int id) =>
        await _db.LeaveRequests
            .Include(lr => lr.Employee)
            .Include(lr => lr.LeaveType)
            .FirstOrDefaultAsync(lr => lr.LeaveRequestId == id);

    public async Task<LeaveRequest> CreateAsync(LeaveRequest request)
    {
        request.Status = "Pending";
        request.CreatedAt = request.UpdatedAt = DateTime.UtcNow;
        _db.LeaveRequests.Add(request);

        // Update pending balance
        var balance = await _db.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == request.EmployeeId
                && lb.LeaveTypeId == request.LeaveTypeId
                && lb.Year == DateTime.Today.Year);
        if (balance is not null)
        {
            balance.Pending += request.TotalDays;
        }

        await _db.SaveChangesAsync();
        return request;
    }

    public async Task<LeaveRequest> UpdateAsync(LeaveRequest request)
    {
        request.UpdatedAt = DateTime.UtcNow;
        _db.LeaveRequests.Update(request);
        await _db.SaveChangesAsync();
        return request;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var r = await _db.LeaveRequests.FindAsync(id);
        if (r is null) return false;
        if (r.Status == "Pending")
        {
            // Revert pending balance
            var balance = await _db.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == r.EmployeeId
                    && lb.LeaveTypeId == r.LeaveTypeId
                    && lb.Year == DateTime.Today.Year);
            if (balance is not null)
                balance.Pending -= r.TotalDays;
        }
        _db.LeaveRequests.Remove(r);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<LeaveRequest> ApproveAsync(int id, int approvedById)
    {
        var r = await _db.LeaveRequests.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = "Approved";
        r.ApprovedById = approvedById;
        r.ApprovedAt = DateTime.UtcNow;
        r.UpdatedAt = DateTime.UtcNow;

        // Move pending → used in balance
        var balance = await _db.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == r.EmployeeId
                && lb.LeaveTypeId == r.LeaveTypeId
                && lb.Year == DateTime.Today.Year);
        if (balance is not null)
        {
            balance.Pending -= r.TotalDays;
            balance.Used += r.TotalDays;
        }

        await _db.SaveChangesAsync();
        return r;
    }

    public async Task<LeaveRequest> RejectAsync(int id, string reason)
    {
        var r = await _db.LeaveRequests.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = "Rejected";
        r.RejectedReason = reason;
        r.UpdatedAt = DateTime.UtcNow;

        var balance = await _db.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == r.EmployeeId
                && lb.LeaveTypeId == r.LeaveTypeId
                && lb.Year == DateTime.Today.Year);
        if (balance is not null)
            balance.Pending -= r.TotalDays;

        await _db.SaveChangesAsync();
        return r;
    }

    public async Task<IEnumerable<LeaveType>> GetLeaveTypesAsync() =>
        await _db.LeaveTypes.Where(lt => lt.IsActive).OrderBy(lt => lt.TypeName).ToListAsync();

    public async Task<IEnumerable<LeaveBalance>> GetBalancesAsync(int employeeId, int? year = null)
    {
        var y = year ?? DateTime.Today.Year;
        return await _db.LeaveBalances
            .Include(lb => lb.LeaveType)
            .Where(lb => lb.EmployeeId == employeeId && lb.Year == y)
            .AsNoTracking()
            .ToListAsync();
    }
}

// ──────────────────────────────────────────────────────────────
// Dashboard Service
// ──────────────────────────────────────────────────────────────
public interface IDashboardService
{
    Task<DashboardStats> GetStatsAsync();
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;
    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardStats> GetStatsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var monthStart = new DateOnly(today.Year, today.Month, 1);

        var totalEmp = await _db.Employees.CountAsync();
        var activeEmp = await _db.Employees.CountAsync(e => e.Status == "Active");
        var onLeave = await _db.LeaveRequests
            .CountAsync(lr => lr.Status == "Approved" && lr.StartDate <= today && lr.EndDate >= today);
        var pendingLeave = await _db.LeaveRequests.CountAsync(lr => lr.Status == "Pending");
        var totalPayroll = await _db.PayrollRecords
            .Where(p => p.PayPeriodStart >= monthStart)
            .SumAsync(p => (decimal?)p.NetPay) ?? 0;

        // Attendance % for current month
        var workdays = await _db.AttendanceRecords
            .Where(a => a.AttendanceDate >= monthStart && a.AttendanceDate <= today)
            .CountAsync();
        var present = await _db.AttendanceRecords
            .Where(a => a.AttendanceDate >= monthStart && a.AttendanceDate <= today && a.Status != "Absent")
            .CountAsync();
        var attPct = workdays > 0 ? Math.Round((double)present / workdays * 100, 1) : 0;

        var deptBreakdown = await _db.Employees
            .Where(e => e.Status == "Active")
            .GroupBy(e => e.Department!.DepartmentName)
            .Select(g => new DeptHeadcount(g.Key, g.Count()))
            .ToListAsync();

        // Last 6 months payroll trend
        // Fetch raw data from DB first (GroupBy with string.Format can't be SQL-translated)
        var cutoff = DateOnly.FromDateTime(DateTime.Today.AddMonths(-5));
        var rawPayroll = await _db.PayrollRecords
            .Where(p => p.PayPeriodStart >= cutoff)
            .Select(p => new { p.PayPeriodStart.Year, p.PayPeriodStart.Month, p.NetPay })
            .ToListAsync(); // <-- evaluate in memory from here

        var payrollTrend = rawPayroll
            .GroupBy(p => new { p.Year, p.Month })
            .Select(g => new MonthlyPayroll(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Sum(p => p.NetPay)
            ))
            .OrderBy(p => p.Month)
            .ToList();

        return new DashboardStats(totalEmp, activeEmp, onLeave, pendingLeave,
            totalPayroll, attPct, deptBreakdown, payrollTrend);
    }
}