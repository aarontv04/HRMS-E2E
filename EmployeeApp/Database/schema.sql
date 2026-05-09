-- =============================================
-- EmployeeApp Database Schema
-- SQL Server - EF Core Database First
-- =============================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EmployeeDB')
    CREATE DATABASE EmployeeDB;
GO

USE EmployeeDB;
GO

-- =============================================
-- Departments
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        DepartmentId    INT           IDENTITY(1,1) PRIMARY KEY,
        DepartmentCode  NVARCHAR(10)  NOT NULL UNIQUE,
        DepartmentName  NVARCHAR(100) NOT NULL,
        Description     NVARCHAR(500) NULL,
        ManagerId       INT           NULL,
        IsActive        BIT           NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- =============================================
-- Positions / Job Titles
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Positions')
BEGIN
    CREATE TABLE Positions (
        PositionId      INT           IDENTITY(1,1) PRIMARY KEY,
        PositionCode    NVARCHAR(10)  NOT NULL UNIQUE,
        PositionTitle   NVARCHAR(100) NOT NULL,
        DepartmentId    INT           NOT NULL,
        MinSalary       DECIMAL(18,2) NULL,
        MaxSalary       DECIMAL(18,2) NULL,
        IsActive        BIT           NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Positions_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId)
    );
END
GO

-- =============================================
-- Employees
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
BEGIN
    CREATE TABLE Employees (
        EmployeeId      INT           IDENTITY(1,1) PRIMARY KEY,
        EmployeeCode    NVARCHAR(20)  NOT NULL UNIQUE,
        FirstName       NVARCHAR(50)  NOT NULL,
        LastName        NVARCHAR(50)  NOT NULL,
        Email           NVARCHAR(100) NOT NULL UNIQUE,
        PhoneNumber     NVARCHAR(20)  NULL,
        DateOfBirth     DATE          NULL,
        Gender          NVARCHAR(10)  NULL,
        Address         NVARCHAR(300) NULL,
        City            NVARCHAR(100) NULL,
        Country         NVARCHAR(100) NULL DEFAULT 'USA',
        HireDate        DATE          NOT NULL,
        TerminationDate DATE          NULL,
        DepartmentId    INT           NOT NULL,
        PositionId      INT           NOT NULL,
        ManagerId       INT           NULL,
        EmploymentType  NVARCHAR(20)  NOT NULL DEFAULT 'FullTime',  -- FullTime, PartTime, Contract
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'Active',    -- Active, Inactive, OnLeave
        PhotoUrl        NVARCHAR(300) NULL,
        Notes           NVARCHAR(1000) NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Employees_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),
        CONSTRAINT FK_Employees_Positions   FOREIGN KEY (PositionId)   REFERENCES Positions(PositionId),
        CONSTRAINT FK_Employees_Manager     FOREIGN KEY (ManagerId)    REFERENCES Employees(EmployeeId)
    );
END
GO

-- Update Departments.ManagerId FK after Employees table exists
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys WHERE name = 'FK_Departments_Manager'
)
BEGIN
    ALTER TABLE Departments
        ADD CONSTRAINT FK_Departments_Manager FOREIGN KEY (ManagerId) REFERENCES Employees(EmployeeId);
END
GO

-- =============================================
-- Payroll
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PayrollRecords')
BEGIN
    CREATE TABLE PayrollRecords (
        PayrollId       INT           IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT           NOT NULL,
        PayPeriodStart  DATE          NOT NULL,
        PayPeriodEnd    DATE          NOT NULL,
        PayDate         DATE          NOT NULL,
        BasicSalary     DECIMAL(18,2) NOT NULL DEFAULT 0,
        HourlySalary    DECIMAL(18,2) NULL,
        RegularHours    DECIMAL(8,2)  NOT NULL DEFAULT 0,
        OvertimeHours   DECIMAL(8,2)  NOT NULL DEFAULT 0,
        OvertimeRate    DECIMAL(8,2)  NOT NULL DEFAULT 1.5,
        GrossPay        DECIMAL(18,2) NOT NULL DEFAULT 0,
        FederalTax      DECIMAL(18,2) NOT NULL DEFAULT 0,
        StateTax        DECIMAL(18,2) NOT NULL DEFAULT 0,
        SocialSecurity  DECIMAL(18,2) NOT NULL DEFAULT 0,
        Medicare        DECIMAL(18,2) NOT NULL DEFAULT 0,
        HealthInsurance DECIMAL(18,2) NOT NULL DEFAULT 0,
        Retirement401k  DECIMAL(18,2) NOT NULL DEFAULT 0,
        OtherDeductions DECIMAL(18,2) NOT NULL DEFAULT 0,
        Bonus           DECIMAL(18,2) NOT NULL DEFAULT 0,
        Commission      DECIMAL(18,2) NOT NULL DEFAULT 0,
        TotalDeductions DECIMAL(18,2) NOT NULL DEFAULT 0,
        NetPay          DECIMAL(18,2) NOT NULL DEFAULT 0,
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'Draft', -- Draft, Approved, Paid
        Notes           NVARCHAR(500) NULL,
        ProcessedBy     NVARCHAR(100) NULL,
        ProcessedAt     DATETIME2     NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Payroll_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId)
    );
END
GO

-- =============================================
-- Attendance
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AttendanceRecords')
BEGIN
    CREATE TABLE AttendanceRecords (
        AttendanceId    INT           IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT           NOT NULL,
        AttendanceDate  DATE          NOT NULL,
        CheckIn         TIME          NULL,
        CheckOut        TIME          NULL,
        WorkedHours     DECIMAL(5,2)  NULL,
        OvertimeHours   DECIMAL(5,2)  NULL DEFAULT 0,
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'Present', -- Present, Absent, Late, HalfDay, Holiday, Weekend
        IsLate          BIT           NOT NULL DEFAULT 0,
        LateMinutes     INT           NULL DEFAULT 0,
        EarlyDeparture  BIT           NOT NULL DEFAULT 0,
        Notes           NVARCHAR(300) NULL,
        ApprovedBy      INT           NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Attendance_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
        CONSTRAINT UQ_Attendance_EmployeeDate UNIQUE (EmployeeId, AttendanceDate)
    );
END
GO

-- =============================================
-- Leave Types
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LeaveTypes')
BEGIN
    CREATE TABLE LeaveTypes (
        LeaveTypeId     INT           IDENTITY(1,1) PRIMARY KEY,
        TypeCode        NVARCHAR(10)  NOT NULL UNIQUE,
        TypeName        NVARCHAR(100) NOT NULL,
        Description     NVARCHAR(500) NULL,
        MaxDaysPerYear  INT           NOT NULL DEFAULT 0,
        IsPaid          BIT           NOT NULL DEFAULT 1,
        RequiresApproval BIT          NOT NULL DEFAULT 1,
        IsActive        BIT           NOT NULL DEFAULT 1
    );
END
GO

-- =============================================
-- Leave Balances
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LeaveBalances')
BEGIN
    CREATE TABLE LeaveBalances (
        BalanceId       INT           IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT           NOT NULL,
        LeaveTypeId     INT           NOT NULL,
        Year            INT           NOT NULL,
        Allocated       DECIMAL(5,1)  NOT NULL DEFAULT 0,
        Used            DECIMAL(5,1)  NOT NULL DEFAULT 0,
        Pending         DECIMAL(5,1)  NOT NULL DEFAULT 0,
        Remaining       AS (Allocated - Used - Pending) PERSISTED,
        CarryOver       DECIMAL(5,1)  NOT NULL DEFAULT 0,
        CONSTRAINT FK_LeaveBalance_Employees  FOREIGN KEY (EmployeeId)  REFERENCES Employees(EmployeeId),
        CONSTRAINT FK_LeaveBalance_LeaveTypes FOREIGN KEY (LeaveTypeId) REFERENCES LeaveTypes(LeaveTypeId),
        CONSTRAINT UQ_LeaveBalance UNIQUE (EmployeeId, LeaveTypeId, Year)
    );
END
GO

-- =============================================
-- Leave Requests
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LeaveRequests')
BEGIN
    CREATE TABLE LeaveRequests (
        LeaveRequestId  INT           IDENTITY(1,1) PRIMARY KEY,
        EmployeeId      INT           NOT NULL,
        LeaveTypeId     INT           NOT NULL,
        StartDate       DATE          NOT NULL,
        EndDate         DATE          NOT NULL,
        TotalDays       DECIMAL(5,1)  NOT NULL,
        HalfDay         BIT           NOT NULL DEFAULT 0,
        HalfDayPeriod   NVARCHAR(10)  NULL,  -- AM, PM
        Reason          NVARCHAR(500) NOT NULL,
        Status          NVARCHAR(20)  NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
        ApprovedById    INT           NULL,
        ApprovedAt      DATETIME2     NULL,
        RejectedReason  NVARCHAR(300) NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_LeaveRequest_Employees  FOREIGN KEY (EmployeeId)    REFERENCES Employees(EmployeeId),
        CONSTRAINT FK_LeaveRequest_LeaveTypes FOREIGN KEY (LeaveTypeId)   REFERENCES LeaveTypes(LeaveTypeId),
        CONSTRAINT FK_LeaveRequest_Approver   FOREIGN KEY (ApprovedById)  REFERENCES Employees(EmployeeId)
    );
END
GO

-- =============================================
-- Seed Data
-- =============================================

-- Departments
IF NOT EXISTS (SELECT TOP 1 1 FROM Departments)
BEGIN
    INSERT INTO Departments (DepartmentCode, DepartmentName, Description) VALUES
    ('HR',   'Human Resources',      'Manages employee relations, recruitment, and HR policies'),
    ('IT',   'Information Technology','Manages technology infrastructure and software development'),
    ('FIN',  'Finance',              'Manages financial operations and accounting'),
    ('SALES','Sales',                'Manages sales operations and customer relations'),
    ('OPS',  'Operations',           'Manages day-to-day business operations'),
    ('MKT',  'Marketing',            'Manages marketing campaigns and brand strategy');
END
GO

-- Positions
IF NOT EXISTS (SELECT TOP 1 1 FROM Positions)
BEGIN
    INSERT INTO Positions (PositionCode, PositionTitle, DepartmentId, MinSalary, MaxSalary) VALUES
    ('HR-MGR', 'HR Manager',              1, 60000, 90000),
    ('HR-SPEC','HR Specialist',           1, 40000, 60000),
    ('IT-MGR', 'IT Manager',              2, 80000, 120000),
    ('DEV-SR', 'Senior Developer',        2, 70000, 100000),
    ('DEV-JR', 'Junior Developer',        2, 45000, 65000),
    ('FIN-MGR','Finance Manager',         3, 75000, 110000),
    ('ACCT',   'Accountant',              3, 50000, 75000),
    ('SALES-MGR','Sales Manager',         4, 65000, 95000),
    ('SALES-REP','Sales Representative',  4, 40000, 60000),
    ('OPS-MGR','Operations Manager',      5, 70000, 100000),
    ('MKT-MGR','Marketing Manager',       6, 65000, 95000),
    ('MKT-SPEC','Marketing Specialist',   6, 45000, 65000);
END
GO

-- Leave Types
IF NOT EXISTS (SELECT TOP 1 1 FROM LeaveTypes)
BEGIN
    INSERT INTO LeaveTypes (TypeCode, TypeName, Description, MaxDaysPerYear, IsPaid, RequiresApproval) VALUES
    ('AL',  'Annual Leave',      'Paid annual vacation leave',           15, 1, 1),
    ('SL',  'Sick Leave',        'Paid leave for medical reasons',       10, 1, 1),
    ('ML',  'Maternity Leave',   'Paid maternity leave for new mothers', 90, 1, 1),
    ('PL',  'Paternity Leave',   'Paid paternity leave for new fathers', 15, 1, 1),
    ('UL',  'Unpaid Leave',      'Unpaid leave for personal reasons',    30, 0, 1),
    ('BL',  'Bereavement Leave', 'Leave for family bereavement',         5,  1, 0),
    ('CL',  'Compensatory Leave','Leave in lieu of overtime worked',     10, 1, 1);
END
GO

-- Sample Employees
IF NOT EXISTS (SELECT TOP 1 1 FROM Employees)
BEGIN
    INSERT INTO Employees (EmployeeCode, FirstName, LastName, Email, PhoneNumber, DateOfBirth, Gender, HireDate, DepartmentId, PositionId, EmploymentType, Status, Address, City, Country) VALUES
    ('EMP001', 'Sarah',    'Johnson',  'sarah.johnson@company.com',  '555-0101', '1985-03-15', 'Female', '2018-01-15', 1, 1, 'FullTime', 'Active', '123 Oak Street',   'New York',     'USA'),
    ('EMP002', 'Michael',  'Chen',     'michael.chen@company.com',   '555-0102', '1988-07-22', 'Male',   '2019-03-01', 2, 3, 'FullTime', 'Active', '456 Maple Ave',    'San Francisco','USA'),
    ('EMP003', 'Emily',    'Williams', 'emily.williams@company.com', '555-0103', '1990-11-08', 'Female', '2020-06-15', 2, 4, 'FullTime', 'Active', '789 Pine Road',    'Austin',       'USA'),
    ('EMP004', 'James',    'Brown',    'james.brown@company.com',    '555-0104', '1982-05-30', 'Male',   '2017-09-10', 3, 6, 'FullTime', 'Active', '321 Elm Street',   'Chicago',      'USA'),
    ('EMP005', 'Lisa',     'Davis',    'lisa.davis@company.com',     '555-0105', '1992-09-17', 'Female', '2021-02-01', 4, 8, 'FullTime', 'Active', '654 Cedar Lane',   'Dallas',       'USA'),
    ('EMP006', 'Robert',   'Martinez', 'robert.martinez@company.com','555-0106', '1987-12-03', 'Male',   '2019-11-15', 2, 5, 'FullTime', 'Active', '987 Birch Blvd',   'Seattle',      'USA'),
    ('EMP007', 'Jennifer', 'Taylor',   'jennifer.taylor@company.com','555-0107', '1993-04-25', 'Female', '2022-01-10', 1, 2, 'PartTime', 'Active', '147 Walnut Way',   'Boston',       'USA'),
    ('EMP008', 'David',    'Anderson', 'david.anderson@company.com', '555-0108', '1986-08-14', 'Male',   '2018-07-20', 5, 10,'FullTime', 'Active', '258 Spruce Court',  'Denver',      'USA'),
    ('EMP009', 'Amanda',   'White',    'amanda.white@company.com',   '555-0109', '1991-01-19', 'Female', '2020-09-05', 3, 7, 'FullTime', 'Active', '369 Aspen Drive',  'Miami',        'USA'),
    ('EMP010', 'Kevin',    'Harris',   'kevin.harris@company.com',   '555-0110', '1989-06-28', 'Male',   '2021-04-12', 6, 11,'FullTime', 'Active', '741 Willow Path',  'Phoenix',      'USA');
END
GO

-- Sample Payroll Records
IF NOT EXISTS (SELECT TOP 1 1 FROM PayrollRecords)
BEGIN
    INSERT INTO PayrollRecords (EmployeeId, PayPeriodStart, PayPeriodEnd, PayDate, BasicSalary, RegularHours, OvertimeHours, GrossPay, FederalTax, StateTax, SocialSecurity, Medicare, HealthInsurance, Retirement401k, TotalDeductions, NetPay, Status, ProcessedBy)
    SELECT
        e.EmployeeId,
        DATEADD(MONTH, -1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)),
        DATEADD(DAY, -1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)),
        DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1),
        p.MinSalary / 12,
        160,
        CASE WHEN e.EmployeeId % 3 = 0 THEN 8 ELSE 0 END,
        (p.MinSalary / 12) + (CASE WHEN e.EmployeeId % 3 = 0 THEN (p.MinSalary / 12 / 160) * 8 * 1.5 ELSE 0 END),
        (p.MinSalary / 12) * 0.12,
        (p.MinSalary / 12) * 0.05,
        (p.MinSalary / 12) * 0.062,
        (p.MinSalary / 12) * 0.0145,
        250.00,
        (p.MinSalary / 12) * 0.04,
        ((p.MinSalary / 12) * 0.12) + ((p.MinSalary / 12) * 0.05) + ((p.MinSalary / 12) * 0.062) + ((p.MinSalary / 12) * 0.0145) + 250.00 + ((p.MinSalary / 12) * 0.04),
        (p.MinSalary / 12) - (((p.MinSalary / 12) * 0.12) + ((p.MinSalary / 12) * 0.05) + ((p.MinSalary / 12) * 0.062) + ((p.MinSalary / 12) * 0.0145) + 250.00 + ((p.MinSalary / 12) * 0.04)),
        'Paid',
        'System'
    FROM Employees e
    JOIN Positions p ON e.PositionId = p.PositionId;
END
GO

-- Sample Attendance Records (last 30 days)
IF NOT EXISTS (SELECT TOP 1 1 FROM AttendanceRecords)
BEGIN
    DECLARE @EmpId INT = 1;
    DECLARE @Date DATE;
    DECLARE @DayOfWeek INT;

    WHILE @EmpId <= 10
    BEGIN
        SET @Date = DATEADD(DAY, -29, CAST(GETDATE() AS DATE));
        WHILE @Date <= CAST(GETDATE() AS DATE)
        BEGIN
            SET @DayOfWeek = DATEPART(WEEKDAY, @Date);
            IF @DayOfWeek NOT IN (1, 7)  -- Skip weekends
            BEGIN
                INSERT INTO AttendanceRecords (EmployeeId, AttendanceDate, CheckIn, CheckOut, WorkedHours, Status, IsLate, LateMinutes)
                VALUES (
                    @EmpId,
                    @Date,
                    CASE WHEN @EmpId % 4 = 0 AND DAY(@Date) % 5 = 0 THEN '09:15:00' ELSE '09:00:00' END,
                    CASE WHEN @EmpId % 5 = 0 AND DAY(@Date) % 3 = 0 THEN '17:30:00' ELSE '17:00:00' END,
                    8.0,
                    CASE WHEN @EmpId % 4 = 0 AND DAY(@Date) % 5 = 0 THEN 'Late' ELSE 'Present' END,
                    CASE WHEN @EmpId % 4 = 0 AND DAY(@Date) % 5 = 0 THEN 1 ELSE 0 END,
                    CASE WHEN @EmpId % 4 = 0 AND DAY(@Date) % 5 = 0 THEN 15 ELSE 0 END
                );
            END
            SET @Date = DATEADD(DAY, 1, @Date);
        END
        SET @EmpId = @EmpId + 1;
    END
END
GO

-- Leave Balances for current year
IF NOT EXISTS (SELECT TOP 1 1 FROM LeaveBalances)
BEGIN
    INSERT INTO LeaveBalances (EmployeeId, LeaveTypeId, Year, Allocated, Used, Pending)
    SELECT
        e.EmployeeId,
        lt.LeaveTypeId,
        YEAR(GETDATE()),
        lt.MaxDaysPerYear,
        FLOOR(RAND(CHECKSUM(NEWID())) * (lt.MaxDaysPerYear * 0.4)),
        0
    FROM Employees e
    CROSS JOIN LeaveTypes lt
    WHERE lt.IsActive = 1;
END
GO

PRINT 'EmployeeDB schema and seed data created successfully.';
GO

-- =============================================
-- App Users (Cookie Authentication)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppUsers')
BEGIN
    CREATE TABLE AppUsers (
        UserId          INT           IDENTITY(1,1) PRIMARY KEY,
        Username        NVARCHAR(50)  NOT NULL UNIQUE,
        Email           NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(256) NOT NULL,
        FullName        NVARCHAR(100) NOT NULL,
        Role            NVARCHAR(30)  NOT NULL DEFAULT 'Staff',  -- Admin, HR, Staff
        IsActive        BIT           NOT NULL DEFAULT 1,
        LastLoginAt     DATETIME2     NULL,
        CreatedAt       DATETIME2     NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Seed default users (passwords are BCrypt hashed)
-- Admin: admin / Admin@123
-- HR:    hrmanager / Hr@123
-- Staff: staff / Staff@123
IF NOT EXISTS (SELECT TOP 1 1 FROM AppUsers)
BEGIN
    INSERT INTO AppUsers (Username, Email, PasswordHash, FullName, Role) VALUES
    ('admin',     'admin@company.com',      '$2a$11$rBnqBCmCFOBOEkjxMHr0pOQpZzLkL0BcJH4FWVY5.4Yh2Q9rXFvCu', 'System Administrator', 'Admin'),
    ('hrmanager', 'hrmanager@company.com',  '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHFy', 'HR Manager',           'HR'),
    ('staff',     'staff@company.com',      '$2a$11$YcmYr5dKLLVy.MePCwFt5.mAfbzmKGF9kGxXlBwTMrQGn3tg68yCy', 'Staff User',           'Staff');
END
GO
PRINT 'AppUsers table created.';
GO