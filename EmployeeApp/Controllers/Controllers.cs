using EmployeeApp.Data;
using EmployeeApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeApp.Controllers;

// ──────────────────────────────────────────────────────────────
// Home / SPA Shell Controller
// ──────────────────────────────────────────────────────────────
[Authorize]
public class HomeController : Controller
{
    public IActionResult Index() => View();
    public IActionResult Error() => View();
}

// ──────────────────────────────────────────────────────────────
// SPA Dynamic Module Router
// ──────────────────────────────────────────────────────────────
[Authorize]
public class SpaController : Controller
{
    // All module routes fall through to the SPA shell
    public IActionResult Module(string module, string? action, int? id) => RedirectToAction("Index", "Home");
}

// ──────────────────────────────────────────────────────────────
// Dashboard Controller
// ──────────────────────────────────────────────────────────────
[Route("api/dashboard")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;
    public DashboardController(IDashboardService svc) => _svc = svc;

    [HttpGet("stats")]
    public async Task<IActionResult> Stats() =>
        Ok(await _svc.GetStatsAsync());
}

// ──────────────────────────────────────────────────────────────
// Employee Controller (API)
// ──────────────────────────────────────────────────────────────
[Route("api/employees")]
[ApiController]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _svc;
    public EmployeeController(IEmployeeService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var emp = await _svc.GetByIdAsync(id);
        return emp is null ? NotFound() : Ok(emp);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Employee employee)
    {
        // EmployeeCode is auto-generated server-side — remove it from validation
        ModelState.Remove(nameof(Employee.EmployeeCode));
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (await _svc.EmailExistsAsync(employee.Email))
            return BadRequest(new { error = "Email already exists." });
        var created = await _svc.CreateAsync(employee);
        return CreatedAtAction(nameof(GetById), new { id = created.EmployeeId }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Employee employee)
    {
        if (id != employee.EmployeeId) return BadRequest();
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (await _svc.EmailExistsAsync(employee.Email, id))
            return BadRequest(new { error = "Email already exists." });
        return Ok(await _svc.UpdateAsync(employee));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpGet("departments")]
    public async Task<IActionResult> Departments() => Ok(await _svc.GetDepartmentsAsync());

    [HttpGet("positions")]
    public async Task<IActionResult> Positions([FromQuery] int? departmentId) =>
        Ok(await _svc.GetPositionsAsync(departmentId));
}

// ──────────────────────────────────────────────────────────────
// Payroll Controller (API)
// ──────────────────────────────────────────────────────────────
[Route("api/payroll")]
[ApiController]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _svc;
    public PayrollController(IPayrollService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, [FromQuery] int? year) =>
        Ok(await _svc.GetAllAsync(employeeId, year));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _svc.GetByIdAsync(id);
        return r is null ? NotFound() : Ok(r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PayrollRecord record)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _svc.CreateAsync(record);
        return CreatedAtAction(nameof(GetById), new { id = created.PayrollId }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PayrollRecord record)
    {
        if (id != record.PayrollId) return BadRequest();
        return Ok(await _svc.UpdateAsync(record));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveRequest req) =>
        Ok(await _svc.ApproveAsync(id, req.ApprovedBy));

    [HttpPost("{id:int}/pay")]
    public async Task<IActionResult> ProcessPayment(int id) =>
        Ok(await _svc.ProcessPaymentAsync(id));
}

public record ApproveRequest(string ApprovedBy);
public record RejectRequest(string Reason);

// ──────────────────────────────────────────────────────────────
// Attendance Controller (API)
// ──────────────────────────────────────────────────────────────
[Route("api/attendance")]
[ApiController]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _svc;
    public AttendanceController(IAttendanceService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? employeeId,
        [FromQuery] string? from,
        [FromQuery] string? to)
    {
        DateOnly? f = from is not null ? DateOnly.Parse(from) : null;
        DateOnly? t = to is not null ? DateOnly.Parse(to) : null;
        return Ok(await _svc.GetAllAsync(employeeId, f, t));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _svc.GetByIdAsync(id);
        return r is null ? NotFound() : Ok(r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AttendanceRecord record)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _svc.CreateAsync(record);
        return CreatedAtAction(nameof(GetById), new { id = created.AttendanceId }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AttendanceRecord record)
    {
        if (id != record.AttendanceId) return BadRequest();
        return Ok(await _svc.UpdateAsync(record));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("checkin/{employeeId:int}")]
    public async Task<IActionResult> CheckIn(int employeeId) =>
        Ok(await _svc.CheckInAsync(employeeId));

    [HttpPost("checkout/{employeeId:int}")]
    public async Task<IActionResult> CheckOut(int employeeId) =>
        Ok(await _svc.CheckOutAsync(employeeId));
}

// ──────────────────────────────────────────────────────────────
// Leave Controller (API)
// ──────────────────────────────────────────────────────────────
[Route("api/leave")]
[ApiController]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _svc;
    public LeaveController(ILeaveService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? employeeId, [FromQuery] string? status) =>
        Ok(await _svc.GetAllAsync(employeeId, status));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var r = await _svc.GetByIdAsync(id);
        return r is null ? NotFound() : Ok(r);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LeaveRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = await _svc.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = created.LeaveRequestId }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] LeaveRequest request)
    {
        if (id != request.LeaveRequestId) return BadRequest();
        return Ok(await _svc.UpdateAsync(request));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveLeaveRequest req) =>
        Ok(await _svc.ApproveAsync(id, req.ApprovedById));

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectRequest req) =>
        Ok(await _svc.RejectAsync(id, req.Reason));

    [HttpGet("types")]
    public async Task<IActionResult> LeaveTypes() => Ok(await _svc.GetLeaveTypesAsync());

    [HttpGet("balances/{employeeId:int}")]
    public async Task<IActionResult> Balances(int employeeId, [FromQuery] int? year) =>
        Ok(await _svc.GetBalancesAsync(employeeId, year));
}

public record ApproveLeaveRequest(int ApprovedById);