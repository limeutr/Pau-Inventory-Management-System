# Issue Reporting System - Database Integration

This document explains the database integration for the PAU Inventory Management System's Issue Reporting module.

## Database Table Structure

### `issues` Table

The issues are stored in a MySQL table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(10) PRIMARY KEY | Unique issue ID (e.g., ISS001, ISS002) |
| `title` | VARCHAR(255) NOT NULL | Issue title/summary |
| `type` | ENUM('equipment', 'quality', 'supplier', 'process', 'safety', 'other') | Issue category |
| `priority` | ENUM('low', 'medium', 'high', 'critical') | Issue priority level |
| `status` | ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') | Current status |
| `reported_by` | VARCHAR(100) NOT NULL | Username who reported the issue |
| `reported_date` | DATE NOT NULL | Date when issue was reported |
| `location` | VARCHAR(100) NOT NULL | Location where issue occurred |
| `equipment` | VARCHAR(255) | Equipment/item involved |
| `description` | TEXT NOT NULL | Detailed description of the issue |
| `steps_to_reproduce` | TEXT | Steps to reproduce the issue |
| `impact` | TEXT | Impact assessment |
| `urgency` | ENUM('low', 'medium', 'high', 'critical') | Urgency level |
| `department` | ENUM('pau_production', 'filling_preparation', 'quality_control', 'inventory_management', 'outlet_management', 'maintenance', 'other') | Responsible department |
| `assigned_to` | VARCHAR(100) | User assigned to resolve the issue |
| `resolved_date` | DATE | Date when issue was resolved |
| `resolution` | TEXT | Resolution details |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Indexes

The table includes indexes for optimal query performance:
- `idx_status` on `status`
- `idx_priority` on `priority`
- `idx_reported_by` on `reported_by`
- `idx_reported_date` on `reported_date`
- `idx_type` on `type`
- `idx_department` on `department`
- `idx_assigned_to` on `assigned_to`

## API Endpoints

The system provides RESTful API endpoints for issue management:

### Issues CRUD Operations

#### Get All Issues
```
GET /api/issues
```

**Query Parameters:**
- `status` - Filter by status (open, in_progress, resolved, etc.)
- `priority` - Filter by priority (low, medium, high, critical)
- `type` - Filter by type (equipment, quality, supplier, etc.)
- `reported_by` - Filter by reporter username
- `department` - Filter by department
- `date_from` - Filter by start date (YYYY-MM-DD)
- `date_to` - Filter by end date (YYYY-MM-DD)
- `search` - Search in title, description, and equipment

**Example:**
```
GET /api/issues?status=open&priority=high
```

#### Get Single Issue
```
GET /api/issues/:id
```

#### Create New Issue
```
POST /api/issues
```

**Request Body:**
```json
{
    "title": "Issue Title",
    "type": "equipment",
    "priority": "high",
    "location": "factory",
    "equipment": "PAU Steamer",
    "description": "Detailed description",
    "steps_to_reproduce": "Steps to reproduce",
    "impact": "Impact assessment",
    "urgency": "high",
    "department": "pau_production",
    "reported_by": "username"
}
```

#### Update Issue
```
PUT /api/issues/:id
```

**Request Body:** (partial updates supported)
```json
{
    "status": "resolved",
    "resolution": "Fixed by replacing faulty component"
}
```

#### Cancel Issue (Soft Delete)
```
DELETE /api/issues/:id
```

### Statistics Endpoints

#### Get Issue Overview Statistics
```
GET /api/issues/stats/overview
```

**Response:**
```json
{
    "total": 15,
    "open": 5,
    "in_progress": 3,
    "resolved": 7,
    "critical": 2,
    "critical_open": 1
}
```

#### Get Issues by Department
```
GET /api/issues/stats/by-department
```

#### Get Next Available Issue ID
```
GET /api/issues/utils/next-id
```

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the table:

```bash
# Option 1: Run setup script (requires Node.js)
node config/setup_issues_table.js

# Option 2: Import SQL file directly into MySQL
mysql -u root -p pauinv < config/issues_table.sql
```

### 2. Server Configuration

The issues routes are automatically included in `server.js`. Make sure your server is running:

```bash
node server.js
```

### 3. Frontend Integration

The frontend (`report-issue.js`) has been updated to use the database API instead of hardcoded data. Key changes:

- `loadIssuesFromDatabase()` - Loads issues from API
- `createIssue()` - Creates new issues via API
- `updateIssue()` - Updates issues via API
- `updateIssueStatusAPI()` - Quick status updates via API
- `loadStatisticsFromAPI()` - Loads statistics from API

### 4. Error Handling

The system includes comprehensive error handling:
- Fallback to sample data if database connection fails
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation for offline scenarios

## Business Rules Implemented

1. **Validation Rules:**
   - Description must be at least 20 characters
   - Critical issues must include impact assessment
   - Safety issues should be high priority or critical

2. **Access Control:**
   - Users can only edit their own reported issues
   - Only supervisors can update issue status
   - Status updates automatically set timestamps

3. **Data Integrity:**
   - Automatic ID generation (ISS001, ISS002, etc.)
   - Timestamps for audit trail
   - Status validation and transitions

4. **Performance Optimization:**
   - Database indexes for fast queries
   - Efficient filtering and searching
   - Minimal data transfer

## Sample Data

The setup includes sample issues representing common PAU production scenarios:
- Equipment malfunctions (steamers, filling machines)
- Quality control issues (contaminated ingredients)
- Supplier problems (delivery delays, quality issues)
- Outlet management issues (display equipment)

## Integration Benefits

1. **Data Persistence:** Issues are stored permanently in database
2. **Multi-user Support:** Real-time updates across multiple users
3. **Scalability:** Can handle large numbers of issues efficiently
4. **Reporting:** Rich statistics and filtering capabilities
5. **Audit Trail:** Complete history of issue lifecycle
6. **Data Integrity:** Consistent data structure and validation

## Migration Notes

If migrating from the old hardcoded system:

1. Existing sample data is preserved as fallback
2. Frontend remains compatible with existing HTML structure
3. All business logic and validation rules are maintained
4. API provides backward compatibility for future enhancements

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check MySQL server is running
   - Verify database credentials in `config/database.js`
   - Ensure `pauinv` database exists

2. **API Endpoints Not Working:**
   - Verify server is running on port 3000
   - Check browser console for errors
   - Ensure routes are properly loaded in server.js

3. **Issues Not Loading:**
   - Check network tab in browser developer tools
   - Verify API responses are returning valid JSON
   - System will fallback to sample data automatically

### Validation:

Test the integration by:
1. Creating a new issue through the web interface
2. Checking the database to confirm the record was saved
3. Refreshing the page to ensure data persistence
4. Testing filters and search functionality

For additional support or customization needs, refer to the main project documentation or contact the development team.
