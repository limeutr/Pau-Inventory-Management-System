# PAU Inventory Management System

A comprehensive web-based inventory management system with role-based access control and specialized dashboards for different user types.

## Features

- **Role-Based Authentication**: Separate login credentials and dashboards for Supervisors and Staff
- **Supervisor Dashboard**: Comprehensive management interface with financial data, analytics, and administrative tools
- **Staff Dashboard**: Streamlined interface focused on daily tasks, stock levels, and alerts
- **Inventory Management**: Complete CRUD operations for inventory items with role-based permissions
- **Ingredient Management**: Specialized ingredient tracking with supplier management and expiry monitoring
- **Production Tracking**: Monitor inbound and outbound production activities with automatic inventory updates
- **Wastage Logging**: Track and analyze inventory wastage for factory and outlets with automatic deduction
- **Sales Overview**: Advanced sales analytics, trends analysis, and demand forecasting (Supervisor-only)
- **Report Generation**: Comprehensive reporting with export capabilities and audit trails (Supervisor-only)
- **User Management**: Complete user lifecycle management with role assignment and audit trails (Supervisor-only)
- **Staff Management**: Comprehensive staff management with scheduling, department tracking, and performance monitoring
- **Business Rules Enforcement**: Stock level validation, expiry date monitoring, and data integrity
- **Visual Status Indicators**: Color-coded alerts for low stock, expired, and expiring items
- **Modern UI**: Clean, responsive design with role-specific color schemes
- **Real-time Updates**: Dynamic content and progress tracking
- **Intuitive Navigation**: Clickable logo for easy dashboard return from any module
- **Data Security**: Financial information and administrative functions restricted by role

## User Roles & Access

### Supervisors (Admin Access)
**Available Accounts:**
- `admin` / `admin`
- `supervisor` / `supervisor`

**Dashboard Features:**
- Key Performance Indicators (Revenue, Profit, Wastage, Efficiency)
- Comprehensive stock summary with financial values
- Sales analytics and trends
- Top-selling products analysis
- Sales Overview and demand forecasting
- Report Generation and export capabilities
- User Management and account administration
- Management tools (Inventory, Staff, Reports, Settings)
- Full system access

### Staff (Limited Access)
**Available Accounts:**
- `staff1` / `staff123`
- `john` / `john123`
- `mary` / `mary123`

**Dashboard Features:**
- Daily production tasks with progress tracking
- Current stock levels (quantities only, no financial data)
- Pending actions and alerts
- Quick actions (Report usage, Request supplies, View recipes, Report issues)
- Task-focused interface

## Files Structure

```
PIMS.1/
├── index.html                    # Login page with role-based authentication
├── styles.css                   # Login page styles
├── script.js                    # Login functionality with role routing
├── supervisor-dashboard.html     # Comprehensive supervisor interface
├── supervisor-dashboard.css      # Supervisor dashboard styles
├── supervisor-dashboard.js       # Supervisor dashboard functionality
├── staff-dashboard.html          # Streamlined staff interface
├── staff-dashboard.css           # Staff dashboard styles
├── staff-dashboard.js            # Staff dashboard functionality
├── inventory-management.html     # Inventory management interface
├── inventory-management.css      # Inventory management styles
├── inventory-management.js       # Inventory management functionality
├── ingredient-management.html    # Ingredient management interface
├── ingredient-management.css     # Ingredient management styles
├── ingredient-management.js      # Ingredient management functionality
├── production-tracking.html      # Production tracking interface
├── production-tracking.css       # Production tracking styles
├── production-tracking.js        # Production tracking functionality
├── wastage-logging.html          # Wastage logging interface
├── wastage-logging.css           # Wastage logging styles
├── wastage-logging.js            # Wastage logging functionality
├── sales-overview.html           # Sales analytics and demand forecasting (Supervisor-only)
├── sales-overview.css            # Sales overview styles
├── sales-overview.js             # Sales overview functionality
├── user-management.html          # User management interface (Supervisor-only)
├── user-management.css           # User management styles
├── user-management.js            # User management functionality
├── staff-management.html         # Staff management interface
├── staff-management.css          # Staff management styles
├── staff-management.js           # Staff management functionality
├── report-generation.html        # Report generation interface (Supervisor-only)
├── report-generation.css         # Report generation styles
├── report-generation.js          # Report generation functionality
└── README.md                    # This file
```

## How to Use

1. **Open the Application**:
   - Open `index.html` in your web browser
   - Or set up a local web server and navigate to the project directory

2. **Login**:
   - **For Supervisor Access**: Use `admin`/`admin` or `supervisor`/`supervisor`
   - **For Staff Access**: Use `staff1`/`staff123`, `john`/`john123`, or `mary`/`mary123`
   - Click "Login" button

3. **Role-Based Dashboards**:
   - **Supervisors** are redirected to a comprehensive management dashboard
   - **Staff** are redirected to a task-focused operational dashboard
   - Each dashboard is tailored to the user's role and responsibilities

4. **Dashboard Features**:
   - **Supervisor Dashboard**: View KPIs, manage inventory, access financial data, generate reports
   - **Staff Dashboard**: Complete daily tasks, monitor stock levels, respond to alerts
   - **Logout**: Click "Logout" to return to the login page

## Security Features

- **Role-Based Access Control**: Different access levels for Supervisors and Staff
- **Input validation** on login form
- **Session-based authentication** with role verification
- **Automatic role-based routing** to appropriate dashboards
- **Financial data protection**: Sensitive information hidden from Staff users
- **Password field security** (hidden input)
- **Error handling** for invalid credentials
- **Automatic logout protection**: Redirects to login if session invalid

## 📦 **Inventory Management Module**

### **Core Features**
- **Complete CRUD Operations**: Add, update, view, and delete inventory items
- **Unique Item Identification**: Auto-generated IDs (INV001, INV002, etc.)
- **Dual Item Types**: Raw ingredients and finished products
- **Storage Location Tracking**: Factory and outlet locations
- **Comprehensive Item Data**: Quantity, unit, expiry date, minimum stock levels, supplier info

### **Visual Status Indicators**
- 🟢 **Good Stock**: Adequate quantities, valid expiry dates
- 🟡 **Low Stock**: Below minimum threshold levels
- 🔴 **Expired Items**: Past expiry date with visual highlighting
- 🟣 **Expiring Soon**: Items expiring within 3 days

### **Business Rules Enforcement**
- ✅ **Non-negative Stock**: Prevents negative inventory quantities
- ✅ **Expiry Validation**: Flags and warns about expired/expiring items
- ✅ **Data Integrity**: Validates all required fields and formats
- ✅ **Role-based Access**: Supervisors have full CRUD, Staff have read-only access

### **Advanced Search & Filtering**
- **Search Functionality**: Find items by name, ID, or supplier
- **Location Filter**: Filter by factory or outlet storage
- **Status Filter**: View items by stock status (good, low, expired, expiring)
- **Real-time Updates**: Instant filtering and search results

### **Role-Based Permissions**
- **Supervisors**: Full access to add, edit, delete all inventory items
- **Staff**: Read-only access to view inventory details and status
- **Delete Protection**: Only supervisors can permanently delete items to prevent accidental data loss

## 📋 **Production Tracking Module**

A comprehensive production tracking system that enables staff to monitor and record daily production activities.

### **Key Features**
- **Inbound Production Tracking**: Record items added to factory inventory
- **Outbound Production Tracking**: Record items shipped to outlets
- **Real-time Statistics**: Daily production metrics and shipment tracking
- **Production History**: Complete audit trail of all production activities
- **Stock Integration**: Automatic inventory level updates

### **Inbound Operations**
- ✅ **Production Entries**: Record newly produced items entering inventory
- ✅ **Batch Tracking**: Optional batch numbers for production lots
- ✅ **Timestamp Logging**: Automatic date and time recording for each entry
- ✅ **Stock Increase**: Automatically increases factory inventory levels

### **Outbound Operations**
- ✅ **Outlet Shipments**: Record items sent to various outlet locations
- ✅ **Destination Tracking**: Track which outlet received specific shipments
- ✅ **Stock Validation**: Prevents over-shipping beyond available inventory
- ✅ **Stock Decrease**: Automatically reduces factory inventory levels

### **Statistics & Analytics**
- **Today's Metrics**: Real-time counts of inbound and outbound entries
- **Production Summary**: Total items produced and shipped daily
- **History Filtering**: Filter by date range and entry type
- **Staff Attribution**: Track which staff member made each entry

## 🗑️ **Wastage Logging Module**

A dedicated system for tracking and managing inventory wastage across factory and outlet locations.

### **Core Functionality**
- **Factory Wastage**: Log discarded items at the production facility
- **Outlet Wastage**: Track waste at retail locations
- **Automatic Deduction**: Instantly reduces inventory levels upon logging
- **Comprehensive Audit**: Complete traceability of all wastage entries

### **Wastage Entry Features**
- ✅ **Item Selection**: Choose from current inventory items
- ✅ **Quantity Tracking**: Precise wastage amount recording
- ✅ **Reason Categories**: Predefined wastage reasons with custom option
- ✅ **Location Specific**: Separate tracking for factory vs. outlet waste
- ✅ **Staff Attribution**: Record who logged the wastage entry
- ✅ **Timestamp Logging**: Automatic date and time recording

### **Wastage Reasons**
- **Expired/Past Due Date**: Items beyond safe consumption date
- **Damaged/Broken**: Physical damage during handling or transport
- **Contaminated**: Items exposed to contaminants
- **Quality Issues**: Items not meeting quality standards
- **Spoiled**: Natural spoilage of perishable items
- **Production Error**: Mistakes during manufacturing process
- **Customer Return**: Items returned by customers
- **Overproduction**: Excess production beyond demand
- **Equipment Failure**: Loss due to equipment malfunction
- **Custom Reason**: User-defined specific circumstances

### **Factory Wastage**
- **Direct Recording**: Log waste from production operations
- **Batch Information**: Optional batch number references
- **Production Context**: Link wastage to specific production activities

### **Outlet Wastage**
- **Multi-Location Support**: Track waste across different outlets
- **Outlet Selection**: Main Outlet, Downtown Branch, Mall Kiosk, Airport Branch
- **Reporter Tracking**: Record who reported the wastage at outlet
- **Chain of Responsibility**: Clear accountability for outlet waste

### **Financial Impact Tracking**
- **Value Calculation**: Automatic calculation of monetary loss
- **Cost Analysis**: Track total daily/weekly/monthly waste costs
- **Role-Based Visibility**: Financial data visible only to supervisors
- **Budget Impact**: Monitor waste impact on operational costs

### **Analytics & Reporting**
- **Daily Statistics**: Real-time waste metrics for current day
- **Location Breakdown**: Separate tracking for factory vs. outlet waste
- **Reason Analysis**: Identify primary causes of wastage
- **Historical Trends**: Filter waste entries by date ranges
- **Staff Performance**: Track waste logged by individual staff members

### **Inventory Integration**
- **Real-time Deduction**: Immediate reduction from available stock
- **Stock Validation**: Prevents logging more waste than available inventory
- **Impact Preview**: Shows stock levels before and after wastage entry
- **Warning System**: Alerts when waste will cause low stock situations

### **Data Integrity & Security**
- **Confirmation Process**: Mandatory confirmation before logging wastage
- **Audit Trail**: Complete history of all wastage entries
- **Role-Based Access**: Staff can log, supervisors can analyze financial impact
- **Data Persistence**: All entries stored for future analysis and compliance

### **User Interface Features**
- **Tabbed Interface**: Easy switching between factory and outlet wastage
- **Real-time Feedback**: Instant stock impact calculations
- **Filter System**: Multi-criteria filtering for historical data
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Indicators**: Color-coded status and warning displays

## 🥄 **Ingredient Management Module**

The Ingredient Management module provides specialized functionality for tracking cooking ingredients with enhanced supplier management and expiry monitoring capabilities.

### **Core Features**

#### **Ingredient Database Management**
- **Complete CRUD Operations**: Add, view, edit, and delete ingredient records
- **Unique Identification**: Auto-generated ingredient IDs (ING001, ING002, etc.)
- **Categorization**: Organized by ingredient types (Flour & Grains, Dairy, Sweeteners, etc.)
- **Standard Units**: Enforced unit standardization (kg, liters, grams, etc.)

#### **Supplier Management**
- **Supplier Association**: Each ingredient must be linked to a valid supplier
- **Predefined Suppliers**: Local Mills Ltd, Dairy Fresh Co, Sweet Supply Co, etc.
- **Custom Suppliers**: Ability to add new supplier names
- **Supplier Filtering**: Filter ingredients by supplier for procurement analysis

#### **Expiry Date Monitoring**
- **Mandatory Expiry Dates**: All ingredients require valid expiry dates
- **Visual Expiry Indicators**: Color-coded alerts for expired and expiring items
- **Date Validation**: System prevents adding ingredients with past expiry dates
- **Automatic Flagging**: Clearly mark expired ingredients in the database

### **Business Rules Implementation**

#### **Data Validation**
- **Required Fields**: Name, category, quantity, unit, supplier, expiry date, storage location
- **Positive Quantities**: All quantities must be non-negative values
- **Unit Standardization**: Restricted to predefined measurement units
- **Supplier Verification**: Must select from approved supplier list or specify custom supplier
- **Future Expiry Dates**: Expiry dates must be in the future (with confirmation for current/past dates)

#### **Stock Management**
- **Minimum Stock Levels**: Set reorder thresholds for each ingredient
- **Maximum Stock Levels**: Optional capacity limits for storage planning
- **Low Stock Alerts**: Automatic flagging when quantities fall below minimum levels
- **Stock Level Validation**: Maximum stock cannot be less than minimum stock

### **Search and Filter Capabilities**

#### **Advanced Search**
- **Multi-field Search**: Search by name, ID, supplier, or batch number
- **Real-time Filtering**: Instant results as you type
- **Case-insensitive**: Flexible search regardless of capitalization

#### **Filter Options**
- **Supplier Filter**: View ingredients from specific suppliers
- **Status Filter**: Filter by condition (Good, Low Stock, Expiring, Expired)
- **Unit Filter**: Group by measurement units
- **Category Filter**: Sort by ingredient categories
- **Clear Filters**: Quick reset to view all ingredients

### **Inventory Status System**

#### **Status Categories**
- **Good**: Adequate stock levels, not expiring soon
- **Low Stock**: Quantity at or below minimum threshold
- **Expiring Soon**: Items expiring within 7 days
- **Expired**: Items past their expiry date

#### **Visual Indicators**
- **Color-coded Badges**: Immediate visual status identification
- **Warning Icons**: ⚠️ for expired items, ⏰ for expiring soon
- **Status Dashboard**: Quick overview statistics

### **Data Export and Reporting**
- **CSV Export**: Complete ingredient database export
- **Comprehensive Data**: All fields including supplier, expiry, and status information
- **Timestamped Files**: Automatic date-based file naming
- **Excel Compatible**: Ready for further analysis in spreadsheet applications

### **Role-Based Permissions**

#### **Staff Users**
- **Add Ingredients**: Full capability to add new ingredients
- **Edit Ingredients**: Update existing ingredient information
- **View Access**: Complete read access to ingredient database
- **Limited Delete**: Deletion requires supervisor approval

#### **Supervisor Users**
- **Full Access**: Complete CRUD operations without restrictions
- **Deletion Authority**: Can delete ingredients without additional approval
- **Data Export**: Access to export functionality
- **System Management**: Full administrative capabilities

### **User Interface Features**
- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Form Validation**: Real-time input validation with helpful error messages
- **Modal Confirmations**: Secure deletion confirmation dialogs
- **Notification System**: Success/error notifications for user actions
- **Collapsible Forms**: Space-efficient add/edit forms
- **Statistics Dashboard**: Quick overview of ingredient status

## Future Enhancements

This is a comprehensive inventory management foundation. Future features could include:

- **Advanced Analytics**: Detailed consumption patterns and forecasting
- **Barcode Integration**: Scanning for quick item identification
- **Supplier Management**: Automated reordering and supplier contacts
- **Multi-location Support**: Advanced warehouse and outlet management
- **Mobile App**: Native mobile application for on-the-go access
- **API Integration**: Connect with external systems and POS
- **Advanced Reporting**: Custom reports with charts and graphs
- **Batch Management**: Track production batches and lot numbers
- **Temperature Monitoring**: Integration with cold storage systems
- **Audit Trail**: Complete history of all inventory changes

## 📈 **Sales Overview Module** *(Supervisor-Only)*

A comprehensive sales analytics and demand forecasting system that enables supervisors to analyze sales trends, identify top-selling products, and generate accurate demand forecasts for better business decision-making.

### **Core Features**

#### **Sales Dashboard & Analytics**
- **Real-time KPIs**: Total revenue, sales volume, average order value, active outlets
- **Period Analysis**: Today, week, month, quarter, yearly, and custom date range analysis
- **Performance Tracking**: Period-over-period comparison with trend indicators
- **Outlet Performance**: Individual outlet revenue, sales, and efficiency metrics

#### **Trend Analysis**
- **Sales Trends**: Interactive visualization of revenue, units sold, and transaction trends
- **Grouping Options**: Daily, weekly, and monthly trend aggregation
- **Visual Charts**: Professional chart displays with detailed data breakdowns
- **Historical Analysis**: Long-term pattern recognition and seasonal trend identification

#### **Top-Selling Products Analysis**
- **Multi-metric Ranking**: Sort by units sold, revenue generated, or transaction frequency
- **Customizable Limits**: View top 10, 20, or 50 performing products
- **Performance Metrics**: Comprehensive stats including revenue, frequency, and average pricing
- **Visual Progress Indicators**: Graphical representation of product performance

#### **Demand Forecasting**
- **Product-Specific Forecasts**: Generate demand predictions for individual products
- **Multiple Time Horizons**: 7, 14, 30, or 90-day forecast periods
- **Trend-Based Modeling**: Uses historical sales data for accurate predictions
- **Confidence Indicators**: Statistical confidence levels for forecast reliability
- **Revenue Projections**: Expected revenue calculations based on predicted demand

### **Advanced Analytics**

#### **Customer Insights**
- **Peak Hours Analysis**: Identify busiest time periods for optimal staffing
- **Transaction Patterns**: Average transaction size and customer behavior analysis
- **Repeat Customer Metrics**: Customer retention and frequency analysis

#### **Seasonal Analysis**
- **Seasonal Trends**: Quarterly and seasonal performance patterns
- **Product Seasonality**: Identify seasonal demand fluctuations
- **Holiday Impact**: Special event and holiday sales impact analysis

#### **Category Performance**
- **Product Category Analysis**: Revenue distribution across product categories
- **Category Trends**: Performance tracking by product type
- **Cross-selling Opportunities**: Identify complementary product relationships

### **Business Intelligence Features**

#### **Data Aggregation**
- **Multi-source Integration**: Combines data from inventory, production, and sales systems
- **Real-time Processing**: Live data updates and instant metric calculations
- **Data Accuracy**: Maintains data integrity across all system modules
- **Historical Data**: Comprehensive historical sales database for trend analysis

#### **Demand Forecasting Engine**
- **Trend Factor Analysis**: Mathematical trend calculation for future projections
- **Seasonal Adjustments**: Accounts for seasonal variations in demand patterns
- **Variance Analysis**: Statistical variance calculation for forecast accuracy
- **Confidence Scoring**: Algorithmic confidence assessment (85-95% accuracy range)

### **Export and Reporting**

#### **Report Generation**
- **Sales Reports**: Comprehensive CSV exports of transaction data
- **Forecast Exports**: Detailed demand forecast reports with confidence metrics
- **Custom Date Ranges**: Flexible reporting periods for specific analysis needs
- **Data Formatting**: Professional formatting suitable for executive presentations

#### **Quick Actions**
- **Inventory Alerts**: Generate stock replenishment recommendations based on sales velocity
- **Report Scheduling**: Set up automated recurring reports (feature preview)
- **Advanced Integration**: Direct access to comprehensive report generation module

### **Business Rules & Data Accuracy**

#### **Data Validation**
- **Date Range Validation**: Prevents future date selections and invalid ranges
- **Accuracy Maintenance**: All sales data aggregated and presented with precision
- **Cross-module Consistency**: Ensures data accuracy across inventory, production, and sales
- **Real-time Updates**: Live data refresh every 5 minutes for current information

#### **Demand Forecasting Rules**
- **Historical Data Requirements**: Minimum data threshold for reliable forecasting
- **Trend Analysis**: Multiple regression analysis for accurate trend prediction
- **Seasonal Factor Application**: Automatic seasonal adjustment based on historical patterns
- **Confidence Thresholds**: Statistical validation of forecast reliability

#### **Access Control**
- **Supervisor-Only Access**: Restricted to users with supervisor privileges
- **Role Verification**: Authentication validation before module access
- **Financial Data Security**: Protected sales and revenue information

### **User Interface Features**

#### **Interactive Dashboard**
- **Period Selector**: Easy switching between analysis periods
- **Dynamic Charts**: Interactive visualization with hover details and click-through functionality
- **Responsive Design**: Optimized for desktop and tablet viewing
- **Real-time Clock**: Live system time display for data freshness verification

#### **Forecast Modal System**
- **Detailed Forecast Display**: Comprehensive forecast results with daily breakdowns
- **Summary Statistics**: Key forecast metrics and trend direction indicators
- **Export Functionality**: Direct CSV export from forecast modal
- **Professional Presentation**: Executive-ready forecast formatting

## �‍💼 **Staff Management Module**

The Staff Management module provides comprehensive workforce management capabilities for tracking staff members, managing schedules, and monitoring department assignments across the organization.

### **Core Features**

#### **Staff Database Management**
- **Complete CRUD Operations**: Add, view, edit, and delete staff records
- **Unique Staff Identification**: Auto-generated staff IDs (STF001, STF002, etc.)
- **Department Organization**: Categorized by departments (Production, Quality Control, Packaging, Maintenance, Administration)
- **Position Tracking**: Detailed job positions and responsibilities
- **Shift Management**: Comprehensive shift scheduling (Morning, Afternoon, Night shifts)

#### **Staff Information Management**
- **Personal Details**: Full name, contact information, and hire date tracking
- **Employment Status**: Active, On Leave, and Inactive status management
- **Salary Management**: Confidential salary information for authorized personnel
- **Contact Information**: Phone numbers and email addresses for communication
- **Department Assignment**: Clear department and position assignments

#### **Schedule Management**
- **Weekly Scheduling**: Detailed weekly schedule management for each staff member
- **Flexible Time Slots**: Customizable start and end times for each day
- **Shift Pattern Tracking**: Monitor shift patterns and working hours
- **Schedule Validation**: Ensure proper coverage and shift assignments
- **Schedule History**: Track changes and maintain scheduling records

### **Statistics & Analytics**

#### **Staff Overview Dashboard**
- **Total Staff Count**: Complete headcount across all departments
- **Active Staff Tracking**: Real-time count of currently active staff members
- **Scheduled Staff**: Number of staff with assigned schedules
- **Factory Staff**: Count of production-related staff members
- **Visual KPIs**: Color-coded statistics cards for quick overview

#### **Department Analytics**
- **Department Distribution**: Staff allocation across different departments
- **Production Department**: Manufacturing and production staff tracking
- **Quality Control**: QC inspectors and quality assurance personnel
- **Packaging Department**: Packaging and finishing staff members
- **Maintenance Team**: Equipment and facility maintenance staff
- **Administration**: HR, finance, and administrative personnel

### **Advanced Search & Filtering**

#### **Multi-Criteria Search**
- **Name Search**: Find staff by full name or partial name matches
- **ID Search**: Direct lookup using staff ID numbers
- **Position Search**: Search by job title or position keywords
- **Real-time Filtering**: Instant results as search terms are entered

#### **Department & Status Filters**
- **Department Filter**: Filter staff by specific departments
- **Status Filter**: View staff by employment status (Active, On Leave, Inactive)
- **Combined Filtering**: Use multiple filters simultaneously for precise results
- **Clear Filters**: Quick reset to view all staff members

### **Schedule Management System**

#### **Weekly Schedule Interface**
- **Day-by-Day Scheduling**: Individual scheduling for each day of the week
- **Time Slot Management**: Flexible start and end time assignments
- **Schedule Templates**: Common shift patterns for quick assignment
- **Schedule Validation**: Prevent scheduling conflicts and ensure coverage

#### **Shift Management**
- **Morning Shift**: 6:00 AM - 2:00 PM coverage
- **Afternoon Shift**: 2:00 PM - 10:00 PM coverage
- **Night Shift**: 10:00 PM - 6:00 AM coverage
- **Custom Shifts**: Flexible scheduling for special requirements
- **Shift Handover**: Smooth transition between shift changes

### **Business Rules & Validation**

#### **Data Integrity**
- **Required Fields**: Name, department, position, shift, and status are mandatory
- **Unique Staff IDs**: Auto-generated unique identifiers for each staff member
- **Email Validation**: Proper email format enforcement for communication
- **Phone Validation**: Contact number format validation
- **Date Validation**: Proper date formats for hire dates and scheduling

#### **Employment Status Management**
- **Status Transitions**: Proper workflow for status changes
- **Leave Management**: Track and manage staff leave periods
- **Reactivation Process**: Procedures for reactivating inactive staff
- **Termination Handling**: Proper procedures for staff termination

### **Export & Reporting**

#### **Staff Data Export**
- **CSV Export**: Complete staff database export in CSV format
- **Filtered Exports**: Export only currently filtered/searched staff
- **Comprehensive Data**: Include all staff information, schedules, and contact details
- **Professional Formatting**: Ready for external analysis and HR systems

#### **Report Generation**
- **Staff Reports**: Detailed reports on staff demographics and distribution
- **Schedule Reports**: Weekly and monthly schedule summaries
- **Department Reports**: Department-wise staff allocation and analysis
- **Status Reports**: Employment status tracking and reporting

### **User Interface Features**

#### **Modern Staff Table**
- **Comprehensive Display**: All key staff information in organized table format
- **Status Indicators**: Color-coded badges for employment status
- **Action Buttons**: Edit, schedule, and delete actions for each staff member
- **Responsive Design**: Mobile-friendly table layout with horizontal scrolling
- **Sorting Options**: Click-to-sort functionality for different columns

#### **Modal Forms**
- **Staff Creation/Editing**: Clean form interface for staff data entry
- **Schedule Management**: Dedicated modal for weekly schedule assignment
- **Form Validation**: Real-time validation feedback with error messages
- **Confirmation Dialogs**: Secure confirmation for destructive actions

### **Security & Access Control**

#### **Role-Based Access**
- **Supervisor Access**: Full CRUD operations for all staff management functions
- **Manager Access**: Department-specific staff management capabilities
- **HR Access**: Specialized access for human resources functions
- **Data Protection**: Sensitive information (salary) restricted to authorized personnel

#### **Audit Trail**
- **Change Tracking**: Log all staff information changes
- **Schedule History**: Track schedule modifications and assignments
- **Access Logging**: Monitor who accessed and modified staff information
- **Compliance Support**: Maintain records for HR compliance requirements

### **Integration Capabilities**

#### **System Integration**
- **Dashboard Integration**: Direct access from supervisor and manager dashboards
- **Production Integration**: Link staff assignments to production tracking
- **Scheduling Integration**: Coordinate with production scheduling systems
- **Payroll Integration**: Export data for payroll processing systems

#### **Notification System**
- **Schedule Notifications**: Alerts for schedule changes and updates
- **Status Notifications**: Updates on staff status changes
- **Success Messages**: Confirmation for completed actions
- **Error Handling**: Clear error messages for troubleshooting

### **Performance Features**

#### **Pagination System**
- **Efficient Data Loading**: Load staff data in manageable chunks
- **Navigation Controls**: Easy navigation between data pages
- **Page Size Options**: Configurable number of items per page
- **Search Persistence**: Maintain search results across page navigation

#### **Responsive Design**
- **Mobile Optimization**: Fully functional on mobile devices
- **Tablet Support**: Optimized layout for tablet viewing
- **Desktop Experience**: Full-featured desktop interface
- **Cross-browser Compatibility**: Works across different web browsers

## �👥 **User Management Module**

The User Management module provides comprehensive user lifecycle management capabilities exclusively available to Supervisors for managing system access, user roles, and maintaining audit trails.

### **Core Features**

#### **User Account Management**
- **Complete CRUD Operations**: Create, view, edit, and delete user accounts
- **Unique User Identification**: Auto-generated user IDs with secure tracking
- **Account Status Control**: Activate and deactivate user accounts
- **Bulk Operations**: Mass activate, deactivate, or delete multiple users
- **Role Assignment**: Assign and modify user roles (Supervisor/Staff)

#### **User Dashboard & Statistics**
- **User Statistics Overview**: Total users, active users, inactive users, and supervisors
- **Real-time Updates**: Live statistics reflecting current user base
- **Visual Status Indicators**: Color-coded cards for different user metrics
- **Quick Actions**: Easy access to user creation and management functions

#### **Advanced Search & Filtering**
- **Multi-field Search**: Search by name, email, or user details
- **Role-based Filtering**: Filter users by role (Supervisor/Staff/All)
- **Status Filtering**: View active, inactive, or all users
- **Real-time Search**: Instant filtering as you type

### **Security & Validation**

#### **Data Validation**
- **Required Fields**: Name, email, and role are mandatory
- **Email Validation**: Proper email format enforcement
- **Unique Email Constraint**: Prevents duplicate email addresses
- **Input Sanitization**: XSS protection and data cleaning

#### **Role-Based Access Control**
- **Supervisor-Only Access**: Module restricted to users with supervisor privileges
- **Permission Verification**: Authentication checks before module access
- **Self-Protection**: Users cannot delete or deactivate their own accounts
- **Unauthorized Access Handling**: Graceful denial for non-supervisors

### **Audit Trail & Compliance**

#### **Comprehensive Audit Logging**
- **Action Tracking**: Log all user management activities (create, update, delete, activate, deactivate)
- **Audit Details**: Timestamp, action type, description, and performing user
- **Bulk Action Logging**: Individual entries for each bulk operation
- **Audit History**: Maintain last 1000 audit entries for compliance

#### **Audit Log Features**
- **Audit Log Viewer**: Dedicated modal for viewing audit history
- **Action Classification**: Color-coded badges for different action types
- **Export Capability**: CSV export of audit logs for external review
- **Real-time Updates**: Live audit trail as actions are performed

### **User Interface & Experience**

#### **Modern Data Table**
- **User Avatars**: Circular avatar with user initials
- **Detailed User Cards**: Name, email, role, and status in organized display
- **Action Buttons**: Edit, activate/deactivate, and delete actions per user
- **Status Badges**: Visual indicators for active/inactive status and roles
- **Responsive Design**: Mobile-friendly table layout

#### **Modal Forms**
- **User Creation/Editing**: Clean form interface for user data entry
- **Form Validation**: Real-time validation feedback
- **Modal Management**: Proper modal opening/closing with overlay
- **Error Handling**: User-friendly error messages and notifications

### **Business Rules Implementation**

#### **User Account Rules**
- **Email Uniqueness**: No duplicate email addresses allowed in the system
- **Role Validation**: Only valid roles (Supervisor/Staff) can be assigned
- **Status Management**: Clear active/inactive status with appropriate access control
- **Self-Protection**: Current user cannot perform destructive actions on own account

#### **Bulk Operation Rules**
- **Selection Validation**: Require user selection before bulk operations
- **Safety Checks**: Prevent bulk deletion/deactivation of current user
- **Confirmation Requirements**: User confirmation for destructive bulk actions
- **Operation Logging**: Detailed audit trail for all bulk operations

### **Export & Reporting**

#### **User Data Export**
- **CSV Export**: Complete user database export in CSV format
- **Filtered Exports**: Export only currently filtered/searched users
- **Comprehensive Data**: Include name, email, role, status, creation date, and login information
- **Professional Formatting**: Ready for external analysis and reporting

#### **Audit Log Export**
- **Complete Audit Trail**: Export full audit log history
- **Detailed Information**: Timestamps, actions, descriptions, and performing users
- **Compliance Ready**: Professional formatting for audit and compliance reviews
- **CSV Format**: Easy integration with external audit tools

### **System Integration**

#### **Dashboard Integration**
- **Navigation Links**: Direct access from supervisor dashboard
- **Consistent Design**: Matches overall system design language
- **Role Verification**: Automatic role checking and access control
- **Session Management**: Proper user session handling and logout functionality

#### **Notification System**
- **Success Notifications**: Confirmation of successful operations
- **Error Alerts**: Clear error messages for failed operations
- **Warning Messages**: Appropriate warnings for potentially destructive actions
- **Auto-dismiss**: Automatic notification cleanup after display

### **User Interface Features**

#### **Interactive Elements**
- **Real-time Statistics**: Live user count updates
- **Dynamic Filtering**: Instant table updates based on search/filter criteria
- **Responsive Notifications**: Toast notifications for user feedback
- **Loading States**: Visual feedback during operations

#### **Accessibility Features**
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Accessibility**: High contrast design for visibility
- **Clear Actions**: Intuitive button labels and icons

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript
- **Styling**: Modern CSS with gradients and animations
- **Responsive**: Works on desktop and mobile devices
- **Storage**: Browser sessionStorage for login state

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started for Development

1. Clone or download the project files
2. Open `index.html` in your preferred web browser
3. Use browser developer tools for debugging
4. Modify CSS for styling changes
5. Extend JavaScript for additional functionality

## Notes

- This is a client-side only application
- No backend server required for basic functionality
- Session data is stored in browser and cleared on browser close
- For production use, implement proper backend authentication
