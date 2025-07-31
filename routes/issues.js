const express = require('express');
const router = express.Router();

// Helper function to generate next issue ID
function generateNextIssueId(db) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM issues ORDER BY id DESC LIMIT 1';
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            
            let nextId = 1;
            if (results.length > 0) {
                const lastId = results[0].id;
                const lastNum = parseInt(lastId.replace('ISS', ''));
                nextId = lastNum + 1;
            }
            
            const newId = `ISS${String(nextId).padStart(3, '0')}`;
            resolve(newId);
        });
    });
}

// Routes for issues management
function setupIssuesRoutes(db) {
    
    // GET issue statistics (must be before /:id route)
    router.get('/stats/overview', (req, res) => {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN status = 'open' AND priority = 'critical' THEN 1 ELSE 0 END) as critical_open
            FROM issues
            WHERE status != 'cancelled'
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching issue statistics:', err);
                res.status(500).json({ error: 'Failed to fetch statistics' });
                return;
            }
            
            res.json(results[0]);
        });
    });
    
    // GET issues by department
    router.get('/stats/by-department', (req, res) => {
        const query = `
            SELECT 
                department,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM issues
            WHERE status != 'cancelled'
            GROUP BY department
            ORDER BY total DESC
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching department statistics:', err);
                res.status(500).json({ error: 'Failed to fetch statistics' });
                return;
            }
            
            res.json(results);
        });
    });
    
    // GET next available issue ID (utility endpoint)
    router.get('/utils/next-id', async (req, res) => {
        try {
            const nextId = await generateNextIssueId(db);
            res.json({ nextId });
        } catch (error) {
            console.error('Error generating next ID:', error);
            res.status(500).json({ error: 'Failed to generate next ID' });
        }
    });
    
    // GET all issues with optional filters
    router.get('/', (req, res) => {
        let query = `
            SELECT 
                id, title, type, priority, status, reported_by, reported_date, 
                location, equipment, description, steps_to_reproduce, impact, 
                urgency, department, assigned_to, resolved_date, resolution,
                created_at, updated_at
            FROM issues
        `;
        
        const conditions = [];
        const params = [];
        
        // Add filters based on query parameters
        if (req.query.status) {
            conditions.push('status = ?');
            params.push(req.query.status);
        }
        
        if (req.query.priority) {
            conditions.push('priority = ?');
            params.push(req.query.priority);
        }
        
        if (req.query.type) {
            conditions.push('type = ?');
            params.push(req.query.type);
        }
        
        if (req.query.reported_by) {
            conditions.push('reported_by = ?');
            params.push(req.query.reported_by);
        }
        
        if (req.query.department) {
            conditions.push('department = ?');
            params.push(req.query.department);
        }
        
        if (req.query.date_from) {
            conditions.push('reported_date >= ?');
            params.push(req.query.date_from);
        }
        
        if (req.query.date_to) {
            conditions.push('reported_date <= ?');
            params.push(req.query.date_to);
        }
        
        if (req.query.search) {
            conditions.push('(title LIKE ? OR description LIKE ? OR equipment LIKE ?)');
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY reported_date DESC, priority DESC';
        
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error fetching issues:', err);
                res.status(500).json({ error: 'Failed to fetch issues' });
                return;
            }
            res.json(results);
        });
    });
    
    // GET single issue by ID
    router.get('/:id', (req, res) => {
        const query = `
            SELECT 
                id, title, type, priority, status, reported_by, reported_date, 
                location, equipment, description, steps_to_reproduce, impact, 
                urgency, department, assigned_to, resolved_date, resolution,
                created_at, updated_at
            FROM issues 
            WHERE id = ?
        `;
        
        db.query(query, [req.params.id], (err, results) => {
            if (err) {
                console.error('Error fetching issue:', err);
                res.status(500).json({ error: 'Failed to fetch issue' });
                return;
            }
            
            if (results.length === 0) {
                res.status(404).json({ error: 'Issue not found' });
                return;
            }
            
            res.json(results[0]);
        });
    });
    
    // POST new issue
    router.post('/', async (req, res) => {
        try {
            const issueId = await generateNextIssueId(db);
            
            const {
                title, type, priority, reported_by, location, equipment,
                description, steps_to_reproduce, impact, urgency, department
            } = req.body;
            
            // Validation
            if (!title || !type || !priority || !reported_by || !location || !description || !urgency || !department) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            
            const query = `
                INSERT INTO issues (
                    id, title, type, priority, status, reported_by, reported_date,
                    location, equipment, description, steps_to_reproduce, impact,
                    urgency, department
                ) VALUES (?, ?, ?, ?, 'open', ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                issueId, title, type, priority, reported_by, location,
                equipment || null, description, steps_to_reproduce || null,
                impact || null, urgency, department
            ];
            
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error creating issue:', err);
                    res.status(500).json({ error: 'Failed to create issue' });
                    return;
                }
                
                res.status(201).json({
                    message: 'Issue created successfully',
                    issueId: issueId
                });
            });
            
        } catch (error) {
            console.error('Error generating issue ID:', error);
            res.status(500).json({ error: 'Failed to create issue' });
        }
    });
    
    // PUT update issue
    router.put('/:id', (req, res) => {
        const {
            title, type, priority, location, equipment, description,
            steps_to_reproduce, impact, urgency, department, status,
            assigned_to, resolution
        } = req.body;
        
        // Build dynamic update query
        const updateFields = [];
        const values = [];
        
        if (title !== undefined) {
            updateFields.push('title = ?');
            values.push(title);
        }
        if (type !== undefined) {
            updateFields.push('type = ?');
            values.push(type);
        }
        if (priority !== undefined) {
            updateFields.push('priority = ?');
            values.push(priority);
        }
        if (location !== undefined) {
            updateFields.push('location = ?');
            values.push(location);
        }
        if (equipment !== undefined) {
            updateFields.push('equipment = ?');
            values.push(equipment);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            values.push(description);
        }
        if (steps_to_reproduce !== undefined) {
            updateFields.push('steps_to_reproduce = ?');
            values.push(steps_to_reproduce);
        }
        if (impact !== undefined) {
            updateFields.push('impact = ?');
            values.push(impact);
        }
        if (urgency !== undefined) {
            updateFields.push('urgency = ?');
            values.push(urgency);
        }
        if (department !== undefined) {
            updateFields.push('department = ?');
            values.push(department);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            values.push(status);
            
            // If status is being changed to resolved, set resolved_date
            if (status === 'resolved') {
                updateFields.push('resolved_date = CURDATE()');
            }
        }
        if (assigned_to !== undefined) {
            updateFields.push('assigned_to = ?');
            values.push(assigned_to);
        }
        if (resolution !== undefined) {
            updateFields.push('resolution = ?');
            values.push(resolution);
        }
        
        if (updateFields.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        
        values.push(req.params.id);
        
        const query = `UPDATE issues SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating issue:', err);
                res.status(500).json({ error: 'Failed to update issue' });
                return;
            }
            
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Issue not found' });
                return;
            }
            
            res.json({ message: 'Issue updated successfully' });
        });
    });
    
    // DELETE issue (soft delete by changing status to cancelled)
    router.delete('/:id', (req, res) => {
        const query = 'UPDATE issues SET status = "cancelled" WHERE id = ?';
        
        db.query(query, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error deleting issue:', err);
                res.status(500).json({ error: 'Failed to delete issue' });
                return;
            }
            
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Issue not found' });
                return;
            }
            
            res.json({ message: 'Issue cancelled successfully' });
        });
    });
    
    return router;
}

module.exports = setupIssuesRoutes;
