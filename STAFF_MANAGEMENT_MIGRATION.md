# Staff Management Database Migration Guide

This guide explains how to migrate the PAU Inventory Management System's staff management from localStorage to a MySQL database.

## Overview

The staff management system has been updated to use a database backend instead of localStorage for better data persistence, concurrent access, and data integrity.

## Database Schema

### 1. `staff` Table
Stores main staff information with the following structure:

```sql
CREATE TABLE staff (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department ENUM('PAU Production', 'Filling Preparation', 'Quality Control', 'Packaging & Distribution', 'Outlet Management', 'Inventory Management', 'Administration') NOT NULL,
    position VARCHAR(100) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
    phone VARCHAR(20),
    email VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10, 2),
    specialties TEXT,
    experience TEXT,
    certifications TEXT,
    responsibilities TEXT,
    outlet VARCHAR(100),
    focus TEXT,
    training TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `staff_schedules` Table
Stores weekly schedule information with proper normalization:

```sql
CREATE TABLE staff_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(10) NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_day (staff_id, day_of_week)
);
```

## Migration Steps

### Step 1: Run Database Migration
1. Ensure XAMPP is running with MySQL service
2. Open a terminal in the project directory
3. Run the migration script:
   ```bash
   node migrate-staff.js
   ```

This will:
- Create the `staff` and `staff_schedules` tables
- Insert sample staff data
- Set up proper indexes and foreign key constraints

### Step 2: Start the Server
The server now includes staff management endpoints:
```bash
node server.js
```

### Step 3: Verify the Migration
Open the staff management page and verify:
- Staff data loads correctly
- You can add/edit/delete staff members
- Schedule management works
- Statistics are calculated properly

## API Endpoints

The following endpoints are now available:

- `GET /api/staff` - Get all staff with filters
- `GET /api/staff/:id` - Get specific staff member
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member
- `PUT /api/staff/:id/schedule` - Update staff schedule
- `GET /api/staff/stats/overview` - Get staff statistics
- `GET /api/staff/utils/next-id` - Get next available staff ID

## Key Changes Made

### Frontend Changes (staff-management.js)
1. **Replaced localStorage with API calls**:
   - `loadStaffDataFromAPI()` replaces localStorage loading
   - Form submission now uses POST/PUT requests
   - Delete operations use DELETE requests
   - Schedule updates use dedicated endpoint

2. **Added async/await support**:
   - Main initialization function is now async
   - All data operations are asynchronous
   - Proper error handling with try/catch blocks

3. **Improved error handling**:
   - Network error notifications
   - Fallback mechanisms for API failures
   - User-friendly error messages

### Backend Changes
1. **New route file**: `routes/staff.js`
2. **Updated server.js** to include staff routes
3. **Database migration script**: `migrate-staff.js`
4. **SQL migration file**: `config/staff_migration.sql`

## Benefits of Database Migration

1. **Data Persistence**: Staff data survives browser cache clears and system restarts
2. **Concurrent Access**: Multiple users can manage staff data simultaneously
3. **Data Integrity**: Foreign key constraints ensure schedule data consistency
4. **Scalability**: Database can handle larger datasets efficiently
5. **Backup & Recovery**: Standard database backup procedures apply
6. **Audit Trail**: Created/updated timestamps for all records
7. **Data Validation**: Database-level constraints prevent invalid data

## Troubleshooting

### Common Issues

1. **Migration fails with connection error**:
   - Ensure XAMPP MySQL service is running
   - Check database credentials in config/database.js
   - Verify the 'pauinv' database exists

2. **Staff data doesn't load**:
   - Check browser console for API errors
   - Verify server is running on port 3000
   - Check that migration completed successfully

3. **Schedule updates fail**:
   - Ensure foreign key constraints are properly set up
   - Check that staff_id exists in staff table

### Rollback (if needed)
If you need to rollback to localStorage:
1. Comment out the database API calls in staff-management.js
2. Uncomment the original localStorage functions
3. The original data structure is preserved

## Data Migration from localStorage

If you have existing staff data in localStorage that you want to preserve:

1. Before running the migration, export your current staff data using the export function
2. Run the database migration
3. Manually import the data through the web interface or create a custom import script

## Security Considerations

1. **Input Validation**: All API endpoints validate required fields
2. **SQL Injection Prevention**: Uses parameterized queries
3. **Error Handling**: Doesn't expose sensitive database information
4. **Data Types**: Enforces proper data types at database level

## Future Enhancements

Consider these improvements:
1. Add user authentication to API endpoints
2. Implement role-based access control
3. Add audit logging for all changes
4. Implement soft deletes instead of hard deletes
5. Add full-text search capabilities
6. Implement data export/import features
