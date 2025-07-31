const express = require('express');
const router = express.Router();

// current table
// CREATE TABLE `supply_requests` (
//   `request id` int(45) NOT NULL,
//   `item name` varchar(45) NOT NULL,
//   `quantity` int(255) NOT NULL,
//   `priority` varchar(255) NOT NULL,
//   `status` varchar(255) NOT NULL,
//   `requested by` varchar(255) NOT NULL,
//   `needed by` date DEFAULT NULL,
//   `justification` text DEFAULT NULL,
//   `preferred supplier` varchar(100) DEFAULT NULL,
//   `date` date NOT NULL
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
// COMMIT;

function setupSupplyRequestRoutes(db) {
  // GET all supply requests - Debug version
  router.get('/', (req, res) => {
    console.log('Supply request route hit!');
    
    // First, let's check what columns actually exist in the table
    const describeQuery = 'DESCRIBE supply_requests';
    
    db.query(describeQuery, (err, columns) => {
      if (err) {
        console.error('Error describing table:', err);
        res.status(500).json({ error: 'Failed to describe table', details: err.message });
        return;
      }
      
      console.log('Table columns:', columns);
      
      // Now try a simple SELECT * query
      const query = 'SELECT * FROM supply_requests LIMIT 5';
      
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching supply requests:', err);
          res.status(500).json({ error: 'Failed to fetch supply requests', details: err.message });
          return;
        }
        
        console.log('Query successful, results:', results);
        res.json({ 
          message: 'Debug info', 
          columns: columns,
          sampleData: results 
        });
      });
    });
  });

  // POST new supply request
  router.post('/', (req, res) => {
    const {
      itemName,
      quantityRequested,
      priority,
      requestedBy,
      neededBy,
      notes,
      supplierInfo
    } = req.body;
    
    const query = `
      INSERT INTO supply_requests (
        \`item name\`, \`quantity\`, \`priority\`, \`requested by\`, 
        \`needed by\`, \`justification\`, \`preferred supplier\`, \`status\`, \`date\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURDATE())
    `;
    
    const values = [
      itemName,
      quantityRequested,
      priority,
      requestedBy,
      neededBy,
      notes,
      supplierInfo
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error adding supply request:', err);
        res.status(500).json({ error: 'Failed to add supply request', details: err.message });
        return;
      }
      
      res.status(201).json({
        message: 'Supply request added successfully',
        id: result.insertId
      });
    });
  });

  return router;
}

module.exports = setupSupplyRequestRoutes;
