const express = require('express');
const router = express.Router();

function setupWastageRoutes(db) {
  // GET all wastage entries
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        id,
        item_id,
        item_name,
        quantity,
        location,
        outlet_location,
        reason,
        custom_reason,
        notes,
        timestamp,
        logged_by,
        reported_by,
        value_lost
      FROM wastage_log 
      ORDER BY timestamp DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching wastage data:', err);
        res.status(500).json({ error: 'Failed to fetch wastage data' });
        return;
      }
      
      res.json(results);
    });
  });

  // GET wastage statistics
  router.get('/stats', (req, res) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const queries = {
      todayTotal: `SELECT COUNT(*) as count FROM wastage_log WHERE DATE(timestamp) = ?`,
      todayFactory: `SELECT COUNT(*) as count FROM wastage_log WHERE DATE(timestamp) = ? AND location = 'factory'`,
      todayOutlet: `SELECT COUNT(*) as count FROM wastage_log WHERE DATE(timestamp) = ? AND location = 'outlet'`,
      todayValue: `SELECT COALESCE(SUM(value_lost), 0) as total FROM wastage_log WHERE DATE(timestamp) = ?`
    };
    
    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
      db.query(query, [todayStr], (err, results) => {
        if (err) {
          console.error(`Error fetching ${key}:`, err);
          stats[key] = 0;
        } else {
          stats[key] = key === 'todayValue' ? parseFloat(results[0].total) || 0 : results[0].count;
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          res.json(stats);
        }
      });
    });
  });

  // GET wastage by outlet
  router.get('/by-outlet', (req, res) => {
    const query = `
      SELECT 
        outlet_location,
        COUNT(*) as count,
        SUM(value_lost) as total_value_lost,
        AVG(value_lost) as avg_value_lost
      FROM wastage_log 
      WHERE location = 'outlet' AND outlet_location IS NOT NULL
      GROUP BY outlet_location
      ORDER BY total_value_lost DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching outlet wastage data:', err);
        res.status(500).json({ error: 'Failed to fetch outlet wastage data' });
        return;
      }
      
      res.json(results);
    });
  });

  // POST new wastage entry
  router.post('/', (req, res) => {
    console.log('POST /api/wastage route called with body:', req.body);
    const {
      id,
      item_id,
      item_name,
      quantity,
      location,
      outlet_location,
      reason,
      custom_reason,
      notes,
      timestamp,
      logged_by,
      reported_by,
      value_lost
    } = req.body;
    
    console.log('Extracted fields:', {
      id,
      item_id,
      item_name,
      quantity,
      location,
      outlet_location,
      reason,
      custom_reason,
      notes,
      timestamp,
      logged_by,
      reported_by,
      value_lost
    });
    
    // Validate required fields (removed unit from validation)
    const missingFields = [];
    if (!id) missingFields.push('id');
    if (!item_id) missingFields.push('item_id');
    if (!item_name) missingFields.push('item_name');
    if (!quantity) missingFields.push('quantity');
    if (!location) missingFields.push('location');
    if (!reason) missingFields.push('reason');
    if (!timestamp) missingFields.push('timestamp');
    if (!logged_by) missingFields.push('logged_by');
    if (value_lost === undefined) missingFields.push('value_lost');
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ error: 'Missing required fields: ' + missingFields.join(', ') });
    }

    // Start a transaction to ensure both wastage log and inventory update succeed or fail together
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }

      // First, insert the wastage entry
      const wastageQuery = `
        INSERT INTO wastage_log (
          id, item_id, item_name, quantity, location, outlet_location,
          reason, custom_reason, notes, timestamp, logged_by, reported_by, value_lost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const wastageParams = [
        id, item_id, item_name, quantity, location, outlet_location,
        reason, custom_reason, notes, timestamp, logged_by, reported_by, value_lost
      ];

      db.query(wastageQuery, wastageParams, (err, wastageResult) => {
        if (err) {
          console.error('Error creating wastage entry:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to create wastage entry' });
          });
        }
        
        // Now update the inventory by subtracting the wasted quantity
        // Extract numeric ID from prefixed ID (e.g., "INV039" -> "39")
        const numericItemId = item_id.replace(/^INV0*/, '');
        
        const updateInventoryQuery = `
          UPDATE inventory 
          SET quantity = quantity - ? 
          WHERE id = ?
        `;

        console.log(`Updating inventory: subtracting ${quantity} from item ${item_id} (numeric ID: ${numericItemId})`);

        db.query(updateInventoryQuery, [quantity, numericItemId], (err, inventoryResult) => {
          if (err) {
            console.error('Error updating inventory:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Failed to update inventory' });
            });
          }

          console.log(`Inventory update result:`, inventoryResult);

          // Check if the item should be removed (quantity <= 0)
          const checkQuantityQuery = 'SELECT quantity FROM inventory WHERE id = ?';
          
          db.query(checkQuantityQuery, [numericItemId], (err, quantityResult) => {
            if (err) {
              console.error('Error checking inventory quantity:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Failed to check inventory quantity' });
              });
            }

            console.log(`Current quantity after update:`, quantityResult);

            // If quantity is 0 or less, remove the item from inventory
            if (quantityResult.length > 0 && quantityResult[0].quantity <= 0) {
              const deleteItemQuery = 'DELETE FROM inventory WHERE id = ?';
              
              db.query(deleteItemQuery, [numericItemId], (err, deleteResult) => {
                if (err) {
                  console.error('Error removing item from inventory:', err);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to remove depleted item from inventory' });
                  });
                }

                // Commit the transaction
                db.commit((err) => {
                  if (err) {
                    console.error('Error committing transaction:', err);
                    return db.rollback(() => {
                      res.status(500).json({ error: 'Failed to commit transaction' });
                    });
                  }
                  
                  console.log(`Wastage logged and item ${item_id} removed from inventory (depleted)`);
                  res.status(201).json({ 
                    message: 'Wastage entry created successfully and item removed from inventory (depleted)',
                    id: id,
                    inventory_action: 'item_removed',
                    remaining_quantity: 0
                  });
                });
              });
            } else {
              // Just commit the transaction (item quantity updated but not removed)
              db.commit((err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to commit transaction' });
                  });
                }
                
                const remainingQuantity = quantityResult.length > 0 ? quantityResult[0].quantity : 0;
                console.log(`Wastage logged and inventory updated. Remaining quantity: ${remainingQuantity}`);
                res.status(201).json({ 
                  message: 'Wastage entry created successfully and inventory updated',
                  id: id,
                  inventory_action: 'quantity_updated',
                  remaining_quantity: remainingQuantity
                });
              });
            }
          });
        });
      });
    });
  });

  // PUT update wastage entry
  router.put('/:id', (req, res) => {
    const entryId = req.params.id;
    const {
      item_id,
      item_name,
      quantity,
      location,
      outlet_location,
      reason,
      custom_reason,
      notes,
      timestamp,
      logged_by,
      reported_by,
      value_lost
    } = req.body;

    const query = `
      UPDATE wastage_log 
      SET item_id = ?, item_name = ?, quantity = ?, location = ?, outlet_location = ?,
          reason = ?, custom_reason = ?, notes = ?, timestamp = ?, logged_by = ?, reported_by = ?, value_lost = ?
      WHERE id = ?
    `;

    const params = [
      item_id, item_name, quantity, location, outlet_location,
      reason, custom_reason, notes, timestamp, logged_by, reported_by, value_lost, entryId
    ];

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error updating wastage entry:', err);
        res.status(500).json({ error: 'Failed to update wastage entry' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Wastage entry not found' });
        return;
      }
      
      res.json({ message: 'Wastage entry updated successfully' });
    });
  });

  // DELETE wastage entry
  router.delete('/:id', (req, res) => {
    const entryId = req.params.id;
    
    const query = 'DELETE FROM wastage_log WHERE id = ?';
    
    db.query(query, [entryId], (err, result) => {
      if (err) {
        console.error('Error deleting wastage entry:', err);
        res.status(500).json({ error: 'Failed to delete wastage entry' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Wastage entry not found' });
        return;
      }
      
      res.json({ message: 'Wastage entry deleted successfully' });
    });
  });

  return router;
}

module.exports = setupWastageRoutes;
