const express = require('express');
const router = express.Router();

function setupProductionRoutes(db) {
  // GET all production entries
  router.get('/', (req, res) => {
    const query = `
      SELECT 
        id,
        date,
        time,
        type,
        item,
        quantity,
        unit,
        destination_source,
        batch,
        staff,
        notes,
        created_at as createdAt
      FROM production_tracking 
      ORDER BY date DESC, time DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching production data:', err);
        res.status(500).json({ error: 'Failed to fetch production data' });
        return;
      }
      
      // Transform data to match frontend format
      const transformedResults = results.map(entry => ({
        id: entry.id,
        itemName: entry.item,
        quantity: entry.quantity,
        unit: entry.unit,
        type: entry.type,
        destination: entry.destination_source,
        sourceOutlet: entry.destination_source,
        batchNumber: entry.batch,
        staff: entry.staff,
        notes: entry.notes,
        createdAt: entry.createdAt,
        date: entry.date,
        time: entry.time
      }));
      
      res.json(transformedResults);
    });
  });

  // POST new production entry
  router.post('/', (req, res) => {
    const { type, itemName, quantity, unit, timestamp, destination, sourceOutlet, batchNumber, staff, notes } = req.body;
    
    console.log('Received production entry data:', {
      type, itemName, quantity, unit, timestamp, destination, sourceOutlet, batchNumber, staff, notes
    });
    
    // Extract date and time from timestamp without timezone conversion
    const dateObj = new Date(timestamp);
    
    // Format date as YYYY-MM-DD in local timezone
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    // Format time as HH:MM:SS in local timezone
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    
    console.log('Converted date/time:', { date, time, originalTimestamp: timestamp });
    
    // Determine destination_source based on type
    const destinationSource = type === 'outbound' ? destination : sourceOutlet;
    
    const query = `
      INSERT INTO production_tracking (date, time, type, item, quantity, unit, destination_source, batch, staff, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [date, time, type, itemName, quantity, unit || 'pcs', destinationSource, batchNumber, staff, notes], (err, result) => {
      if (err) {
        console.error('Error creating production entry:', err);
        res.status(500).json({ error: 'Failed to create production entry' });
        return;
      }
      
      res.status(201).json({ 
        message: 'Production entry created successfully',
        id: result.insertId
      });
    });
  });

  // PUT update production entry
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { type, itemName, quantity, unit, timestamp, destination, sourceOutlet, batchNumber, staff, notes } = req.body;
    
    // Extract date and time from timestamp without timezone conversion
    const dateObj = new Date(timestamp);
    
    // Format date as YYYY-MM-DD in local timezone
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    // Format time as HH:MM:SS in local timezone
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    const destinationSource = type === 'outbound' ? destination : sourceOutlet;
    
    const query = `
      UPDATE production_tracking 
      SET date = ?, time = ?, type = ?, item = ?, quantity = ?, unit = ?, destination_source = ?, batch = ?, staff = ?, notes = ?
      WHERE id = ?
    `;
    
    db.query(query, [date, time, type, itemName, quantity, unit, destinationSource, batchNumber, staff, notes, id], (err, result) => {
      if (err) {
        console.error('Error updating production entry:', err);
        res.status(500).json({ error: 'Failed to update production entry' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Production entry not found' });
        return;
      }
      
      res.json({ message: 'Production entry updated successfully' });
    });
  });

  // DELETE production entry
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM production_tracking WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting production entry:', err);
        res.status(500).json({ error: 'Failed to delete production entry' });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Production entry not found' });
        return;
      }
      
      res.json({ message: 'Production entry deleted successfully' });
    });
  });

  return router;
}

module.exports = setupProductionRoutes;
