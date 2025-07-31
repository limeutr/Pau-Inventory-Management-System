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
  // GET all supply requests
  router.get('/', (req, res) => {
    console.log('Supply request route hit!');
    
    const query = `
      SELECT 
        \`request id\` as id,
        \`item name\` as itemName,
        \`quantity\` as quantityRequested,
        \`priority\`,
        \`status\`,
        \`requested by\` as requestedBy,
        \`needed by\` as neededBy,
        \`justification\` as notes,
        \`preferred supplier\` as supplierInfo,
        \`date\` as requestedDate
      FROM supply_requests
      ORDER BY \`date\` DESC
    `;
    
    console.log('Executing query:', query);
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching supply requests:', err);
        res.status(500).json({ error: 'Failed to fetch supply requests', details: err.message });
        return;
      }
      
      console.log('Query successful, found', results.length, 'supply requests');
      
      // Transform data to match frontend format
      const transformedResults = results.map(request => ({
        id: `SR${String(request.id).padStart(3, '0')}`,
        itemName: request.itemName,
        quantityRequested: request.quantityRequested,
        unit: 'pcs', // Default unit since not in schema
        priority: request.priority,
        requestedBy: request.requestedBy,
        requestedDate: request.requestedDate ? new Date(request.requestedDate).toISOString().split('T')[0] : null,
        neededBy: request.neededBy ? new Date(request.neededBy).toISOString().split('T')[0] : null,
        status: request.status,
        notes: request.notes,
        supplierInfo: request.supplierInfo,
        estimatedCost: null, // Not in schema
        approvedBy: null, // Not in schema
        approvedDate: null, // Not in schema
        createdAt: request.requestedDate
      }));
      
      res.json(transformedResults);
    });
  });

  // POST new supply request
  router.post('/', (req, res) => {
    console.log('POST supply request route hit!');
    console.log('Request body:', req.body);
    
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
    
    console.log('Executing INSERT query with values:', values);
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error adding supply request:', err);
        res.status(500).json({ error: 'Failed to add supply request', details: err.message });
        return;
      }
      
      console.log('Supply request added successfully, insert ID:', result.insertId);
      res.status(201).json({
        message: 'Supply request added successfully',
        id: result.insertId
      });
    });
  });

  // PUT update supply request
  router.put('/:id', (req, res) => {
    const requestId = req.params.id;
    console.log('PUT supply request route hit for ID:', requestId);
    
    const {
      itemName,
      quantityRequested,
      priority,
      requestedBy,
      neededBy,
      notes,
      supplierInfo,
      status
    } = req.body;
    
    const query = `
      UPDATE supply_requests 
      SET 
        \`item name\` = ?,
        \`quantity\` = ?,
        \`priority\` = ?,
        \`requested by\` = ?,
        \`needed by\` = ?,
        \`justification\` = ?,
        \`preferred supplier\` = ?,
        \`status\` = ?
      WHERE \`request id\` = ?
    `;
    
    const values = [
      itemName,
      quantityRequested,
      priority,
      requestedBy,
      neededBy,
      notes,
      supplierInfo,
      status,
      requestId
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating supply request:', err);
        res.status(500).json({ error: 'Failed to update supply request', details: err.message });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Supply request not found' });
        return;
      }
      
      res.json({ message: 'Supply request updated successfully' });
    });
  });

  // DELETE supply request
  router.delete('/:id', (req, res) => {
    const requestId = req.params.id;
    console.log('DELETE supply request route hit for ID:', requestId);
    
    const query = 'DELETE FROM supply_requests WHERE \`request id\` = ?';
    
    db.query(query, [requestId], (err, result) => {
      if (err) {
        console.error('Error deleting supply request:', err);
        res.status(500).json({ error: 'Failed to delete supply request', details: err.message });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Supply request not found' });
        return;
      }
      
      res.json({ message: 'Supply request deleted successfully' });
    });
  });

  return router;
}

module.exports = setupSupplyRequestRoutes;
