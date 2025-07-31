const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database connection
const db = require('./config/database');

// Import route modules
const setupInventoryRoutes = require('./routes/inventory');
const setupProductionRoutes = require('./routes/production');
const setupWastageRoutes = require('./routes/wastage');
const setupSupplyRequestRoutes = require('./routes/supplyRequests');
const setupStaffRoutes = require('./routes/staff');
const setupIssuesRoutes = require('./routes/issues');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup API routes first
app.use('/api/inventory', setupInventoryRoutes(db));
app.use('/api/production', setupProductionRoutes(db));
app.use('/api/wastage', setupWastageRoutes(db));
app.use('/api/supply-requests', setupSupplyRequestRoutes(db));
app.use('/api/staff', setupStaffRoutes(db));
app.use('/api/issues', setupIssuesRoutes(db));

// Static files after API routes
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PAU Inventory Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PAU Inventory Management System`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available API endpoints:`);
  console.log(`   - GET/POST/PUT/DELETE /api/inventory`);
  console.log(`   - GET/POST/PUT/DELETE /api/production`);
  console.log(`   - GET/POST/PUT/DELETE /api/wastage`);
  console.log(`   - GET              /api/wastage/stats`);
  console.log(`   - GET              /api/wastage/by-outlet`);
  console.log(`   - GET/POST/PUT/DELETE /api/supply-requests`);
  console.log(`   - GET/POST/PUT/DELETE /api/staff`);
  console.log(`   - GET              /api/staff/stats/overview`);
  console.log(`   - GET              /api/staff/utils/next-id`);
  console.log(`   - GET/POST/PUT/DELETE /api/issues`);
  console.log(`   - GET              /api/issues/stats/overview`);
  console.log(`   - GET              /api/issues/stats/by-department`);
  console.log(`   - GET              /api/issues/utils/next-id`);
  console.log(`   - GET              /api/health`);
  console.log(`Database: Connected to MySQL (pauinv)`);
});