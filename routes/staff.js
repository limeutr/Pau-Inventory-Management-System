const express = require('express');
const router = express.Router();

module.exports = function(db) {
    // GET all staff with their schedules
    router.get('/', (req, res) => {
        console.log('GET /api/staff - Fetching all staff');
        console.log('Query parameters:', req.query);
        
        try {
            const { department, status, search } = req.query;
            
            let query = `
                SELECT s.*, 
                       GROUP_CONCAT(
                           CASE WHEN sc.day_of_week IS NOT NULL 
                           THEN CONCAT(sc.day_of_week, ':', sc.start_time, '-', sc.end_time) 
                           END SEPARATOR '|'
                       ) as schedule_data
                FROM staff s
                LEFT JOIN staff_schedules sc ON s.id = sc.staff_id
                WHERE 1=1
            `;
            
            const params = [];
            
            if (department) {
                query += ' AND s.department = ?';
                params.push(department);
            }
            
            if (status) {
                query += ' AND s.status = ?';
                params.push(status);
            }
            
            if (search) {
                query += ' AND (s.name LIKE ? OR s.id LIKE ? OR s.position LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            
            query += ' GROUP BY s.id ORDER BY s.id';
            
            db.query(query, params, (err, results) => {
                if (err) {
                    console.error('Error fetching staff:', err);
                    return res.status(500).json({ error: 'Failed to fetch staff data' });
                }
                
                // Transform schedule data back to object format
                const staff = results.map(row => {
                    const staffData = { ...row };
                    delete staffData.schedule_data;
                    
                    // Parse schedule data
                    const schedule = {};
                    if (row.schedule_data) {
                        console.log('Processing schedule_data for staff:', staffData.name, row.schedule_data);
                        const scheduleEntries = row.schedule_data.split('|');
                        scheduleEntries.forEach(entry => {
                            if (entry && entry.includes(':')) {
                                // Split only on the first colon to separate day from time range
                                const colonIndex = entry.indexOf(':');
                                const day = entry.substring(0, colonIndex);
                                const timeRange = entry.substring(colonIndex + 1);
                                
                                console.log(`Processing ${day}: ${timeRange}`);
                                
                                if (timeRange && timeRange !== 'null-null' && timeRange.includes('-')) {
                                    const [start, end] = timeRange.split('-');
                                    schedule[day] = { 
                                        start: start || '', 
                                        end: end || '' 
                                    };
                                    console.log(`Set ${day}:`, schedule[day]);
                                } else {
                                    schedule[day] = { start: '', end: '' };
                                    console.log(`Empty schedule for ${day}`);
                                }
                            }
                        });
                    }
                    
                    // Ensure all days are present
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    days.forEach(day => {
                        if (!schedule[day]) {
                            schedule[day] = { start: '', end: '' };
                        }
                    });
                    
                    staffData.schedule = schedule;
                    return staffData;
                });
                
                res.json(staff);
            });
        } catch (error) {
            console.error('Error in GET /staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // DEBUG endpoint to check raw schedule data
    router.get('/debug/schedule/:id', (req, res) => {
        const staffId = req.params.id;
        
        const query = `
            SELECT staff_id, day_of_week, start_time, end_time 
            FROM staff_schedules 
            WHERE staff_id = ?
            ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        `;
        
        db.query(query, [staffId], (err, results) => {
            if (err) {
                console.error('Error fetching schedule debug:', err);
                return res.status(500).json({ error: 'Failed to fetch schedule debug data' });
            }
            
            res.json({
                staffId: staffId,
                scheduleRows: results,
                concatenated: results.map(row => `${row.day_of_week}:${row.start_time}-${row.end_time}`).join('|')
            });
        });
    });

    // GET single staff member by ID
    router.get('/:id', (req, res) => {
        const staffId = req.params.id;
        
        const query = `
            SELECT s.*, 
                   GROUP_CONCAT(
                       CASE WHEN sc.day_of_week IS NOT NULL 
                       THEN CONCAT(sc.day_of_week, ':', sc.start_time, '-', sc.end_time) 
                       END SEPARATOR '|'
                   ) as schedule_data
            FROM staff s
            LEFT JOIN staff_schedules sc ON s.id = sc.staff_id
            WHERE s.id = ?
            GROUP BY s.id
        `;
        
        db.query(query, [staffId], (err, results) => {
            if (err) {
                console.error('Error fetching staff member:', err);
                return res.status(500).json({ error: 'Failed to fetch staff data' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            
            const row = results[0];
            const staffData = { ...row };
            delete staffData.schedule_data;
            
            // Parse schedule data
            const schedule = {};
            if (row.schedule_data) {
                console.log('Processing schedule_data for individual staff:', staffData.name, row.schedule_data);
                const scheduleEntries = row.schedule_data.split('|');
                scheduleEntries.forEach(entry => {
                    if (entry && entry.includes(':')) {
                        // Split only on the first colon to separate day from time range
                        const colonIndex = entry.indexOf(':');
                        const day = entry.substring(0, colonIndex);
                        const timeRange = entry.substring(colonIndex + 1);
                        
                        console.log(`Processing ${day}: ${timeRange}`);
                        
                        if (timeRange && timeRange !== 'null-null' && timeRange.includes('-')) {
                            const [start, end] = timeRange.split('-');
                            schedule[day] = { 
                                start: start || '', 
                                end: end || '' 
                            };
                            console.log(`Set ${day}:`, schedule[day]);
                        } else {
                            schedule[day] = { start: '', end: '' };
                            console.log(`Empty schedule for ${day}`);
                        }
                    }
                });
            }
            
            // Ensure all days are present
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            days.forEach(day => {
                if (!schedule[day]) {
                    schedule[day] = { start: '', end: '' };
                }
            });
            
            staffData.schedule = schedule;
            res.json(staffData);
        });
    });

    // POST - Create new staff member
    router.post('/', (req, res) => {
        console.log('POST /api/staff - Creating new staff member');
        console.log('Request body:', req.body);
        
        const {
            id, name, department, position, shift, status = 'Active',
            phone, email, hire_date, salary, specialties, experience,
            certifications, responsibilities, outlet, focus, training, schedule
        } = req.body;
        
        if (!id || !name || !department || !position || !shift) {
            console.log('Missing required fields:', { id, name, department, position, shift });
            return res.status(400).json({ error: 'Missing required fields: id, name, department, position, shift' });
        }
        
        // Insert staff member
        const staffQuery = `
            INSERT INTO staff (
                id, name, department, position, shift, status, phone, email, 
                hire_date, salary, specialties, experience, certifications, 
                responsibilities, outlet, focus, training
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const staffValues = [
            id, name, department, position, shift, status, phone, email,
            hire_date, salary, specialties, experience, certifications,
            responsibilities, outlet, focus, training
        ];
        
        console.log('Executing staff insert query with values:', staffValues);
        
        db.query(staffQuery, staffValues, (err, result) => {
            if (err) {
                console.error('Error creating staff member:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Staff ID already exists' });
                }
                return res.status(500).json({ error: 'Failed to create staff member' });
            }
            
            console.log('Staff member inserted successfully:', result);
            
            // Insert schedule if provided
            if (schedule && typeof schedule === 'object') {
                console.log('Inserting schedule:', schedule);
                insertSchedule(id, schedule, (scheduleErr) => {
                    if (scheduleErr) {
                        console.error('Error inserting schedule:', scheduleErr);
                        // Staff was created but schedule failed - still return success
                    } else {
                        console.log('Schedule inserted successfully');
                    }
                    res.status(201).json({ message: 'Staff member created successfully', id });
                });
            } else {
                res.status(201).json({ message: 'Staff member created successfully', id });
            }
        });
    });

    // PUT - Update staff member
    router.put('/:id', (req, res) => {
        const staffId = req.params.id;
        const {
            name, department, position, shift, status,
            phone, email, hire_date, salary, specialties, experience,
            certifications, responsibilities, outlet, focus, training, schedule
        } = req.body;
        
        const updateQuery = `
            UPDATE staff SET 
                name = ?, department = ?, position = ?, shift = ?, status = ?,
                phone = ?, email = ?, hire_date = ?, salary = ?, specialties = ?,
                experience = ?, certifications = ?, responsibilities = ?, outlet = ?,
                focus = ?, training = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const updateValues = [
            name, department, position, shift, status, phone, email,
            hire_date, salary, specialties, experience, certifications,
            responsibilities, outlet, focus, training, staffId
        ];
        
        db.query(updateQuery, updateValues, (err, result) => {
            if (err) {
                console.error('Error updating staff member:', err);
                return res.status(500).json({ error: 'Failed to update staff member' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            
            // Update schedule if provided
            if (schedule && typeof schedule === 'object') {
                updateSchedule(staffId, schedule, (scheduleErr) => {
                    if (scheduleErr) {
                        console.error('Error updating schedule:', scheduleErr);
                    }
                    res.json({ message: 'Staff member updated successfully' });
                });
            } else {
                res.json({ message: 'Staff member updated successfully' });
            }
        });
    });

    // PUT - Update staff schedule
    router.put('/:id/schedule', (req, res) => {
        const staffId = req.params.id;
        const { schedule } = req.body;
        
        if (!schedule || typeof schedule !== 'object') {
            return res.status(400).json({ error: 'Invalid schedule data' });
        }
        
        updateSchedule(staffId, schedule, (err) => {
            if (err) {
                console.error('Error updating schedule:', err);
                return res.status(500).json({ error: 'Failed to update schedule' });
            }
            res.json({ message: 'Schedule updated successfully' });
        });
    });

    // DELETE staff member
    router.delete('/:id', (req, res) => {
        const staffId = req.params.id;
        
        const deleteQuery = 'DELETE FROM staff WHERE id = ?';
        
        db.query(deleteQuery, [staffId], (err, result) => {
            if (err) {
                console.error('Error deleting staff member:', err);
                return res.status(500).json({ error: 'Failed to delete staff member' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            
            res.json({ message: 'Staff member deleted successfully' });
        });
    });

    // GET staff statistics
    router.get('/stats/overview', (req, res) => {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_staff,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_staff,
                COUNT(CASE WHEN status = 'On Leave' THEN 1 END) as on_leave_staff,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_staff,
                COUNT(CASE WHEN department IN ('PAU Production', 'Filling Preparation', 'Quality Control', 'Packaging & Distribution', 'Inventory Management') THEN 1 END) as factory_staff
            FROM staff
        `;
        
        db.query(statsQuery, (err, results) => {
            if (err) {
                console.error('Error fetching staff statistics:', err);
                return res.status(500).json({ error: 'Failed to fetch statistics' });
            }
            
            res.json(results[0]);
        });
    });

    // Helper function to insert schedule
    function insertSchedule(staffId, schedule, callback) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const scheduleValues = [];
        
        days.forEach(day => {
            if (schedule[day] && schedule[day].start && schedule[day].end) {
                scheduleValues.push([staffId, day, schedule[day].start, schedule[day].end]);
            }
        });
        
        if (scheduleValues.length === 0) {
            return callback(null);
        }
        
        const insertQuery = 'INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time) VALUES ?';
        db.query(insertQuery, [scheduleValues], callback);
    }

    // Helper function to update schedule
    function updateSchedule(staffId, schedule, callback) {
        // First delete existing schedule
        const deleteQuery = 'DELETE FROM staff_schedules WHERE staff_id = ?';
        
        db.query(deleteQuery, [staffId], (err) => {
            if (err) return callback(err);
            
            // Then insert new schedule
            insertSchedule(staffId, schedule, callback);
        });
    }

    // GET next staff ID
    router.get('/utils/next-id', (req, res) => {
        const query = 'SELECT id FROM staff ORDER BY id DESC LIMIT 1';
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error getting next ID:', err);
                return res.status(500).json({ error: 'Failed to generate next ID' });
            }
            
            let nextId = 'STF001';
            if (results.length > 0) {
                const lastId = results[0].id;
                const num = parseInt(lastId.replace('STF', ''));
                nextId = 'STF' + String(num + 1).padStart(3, '0');
            }
            
            res.json({ nextId });
        });
    });

    return router;
};
