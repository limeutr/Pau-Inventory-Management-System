const express = require('express');
const router = express.Router();

// Helper functions
function calculateItemStatus(quantity, expiryDate, minStockLevel = 5) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!expiryDate) return quantity <= minStockLevel ? 'low' : 'good';
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 14) {
    return 'expiring';
  } else if (quantity <= minStockLevel) {
    return 'low';
  } else {
    return 'good';
  }
}

function getMinStockLevel(type) {
  switch (type) {
    case 'raw_ingredient':
      return 5;
    case 'finished_product':
      return 10;
    default:
      return 5;
  }
}

function getSupplier(type) {
  switch (type) {
    case 'raw_ingredient':
      return 'Various Suppliers';
    case 'finished_product':
      return 'In-house Production';
    default:
      return 'Unknown';
  }
}

// Routes - using router instead of app
function setupInventoryRoutes(db) {
  // GET all inventory items
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        id,
        item_name as name,
        type,
        location,
        quantity,
        unit,
        expiry_date as expiryDate,
        supplier,
        min_stock_level as minStockLevel,
        created_at as createdAt
      FROM inventory 
      ORDER BY created_at DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
        return;
      }
      
      // Transform data to match frontend format and calculate status automatically
      const transformedResults = results.map(item => {
        const minStockLevel = item.minStockLevel || getMinStockLevel(item.type);
        
        // Fix timezone issue by adding 1 day to expiry date for display AND status calculation
        let displayExpiryDate = null;
        let correctedExpiryDate = null;
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate);
          expiryDate.setDate(expiryDate.getDate() + 1); // Add 1 day to fix timezone display issue
          displayExpiryDate = expiryDate.toISOString().split('T')[0];
          correctedExpiryDate = expiryDate; // Use corrected date for status calculation
        }
        
        return {
          id: `INV${String(item.id).padStart(3, '0')}`,
          name: item.name,
          type: item.type,
          location: item.location,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: displayExpiryDate,
          supplier: item.supplier || getSupplier(item.type),
          status: calculateItemStatus(item.quantity, correctedExpiryDate, minStockLevel),
          createdAt: item.createdAt,
          minStockLevel: minStockLevel
        };
      });
      
      res.json(transformedResults);
    });
  });

  // POST new inventory item
  router.post('/', (req, res) => {
    const { name, type, location, quantity, unit, expiryDate, minStockLevel, supplier } = req.body;
    
    const finalMinStockLevel = minStockLevel || getMinStockLevel(type);
    const finalSupplier = supplier || getSupplier(type);
    
    const query = `
      INSERT INTO inventory (item_name, type, location, quantity, unit, expiry_date, supplier, min_stock_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [name, type, location, quantity, unit, expiryDate, finalSupplier, finalMinStockLevel], (err, result) => {
      if (err) {
        console.error('Error adding inventory item:', err);
        res.status(500).json({ error: 'Failed to add inventory item' });
        return;
      }
      
      const newItem = {
        id: `INV${String(result.insertId).padStart(3, '0')}`,
        name,
        type,
        location,
        quantity,
        unit,
        expiryDate,
        supplier: finalSupplier,
        status: calculateItemStatus(quantity, expiryDate, finalMinStockLevel),
        minStockLevel: finalMinStockLevel
      };
      
      res.status(201).json(newItem);
    });
  });

  // PUT update inventory item
  router.put('/:id', (req, res) => {
    const itemId = parseInt(req.params.id.replace('INV', ''));
    const { name, type, location, quantity, unit, expiryDate, minStockLevel, supplier } = req.body;
    
    const finalMinStockLevel = minStockLevel || getMinStockLevel(type);
    const finalSupplier = supplier || getSupplier(type);
    
    const query = `
      UPDATE inventory 
      SET item_name = ?, type = ?, location = ?, quantity = ?, unit = ?, expiry_date = ?, supplier = ?, min_stock_level = ?
      WHERE id = ?
    `;
    
    db.query(query, [name, type, location, quantity, unit, expiryDate, finalSupplier, finalMinStockLevel, itemId], (err, result) => {
      if (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ error: 'Failed to update inventory item' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json({ message: 'Item updated successfully' });
    });
  });

  // DELETE inventory item
  router.delete('/:id', (req, res) => {
    const itemId = parseInt(req.params.id.replace('INV', ''));
    
    const query = 'DELETE FROM inventory WHERE id = ?';
    
    db.query(query, [itemId], (err, result) => {
      if (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ error: 'Failed to delete inventory item' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json({ message: 'Item deleted successfully' });
    });
  });

  return router;
}

module.exports = setupInventoryRoutes;
