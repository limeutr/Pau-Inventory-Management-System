const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection (same as in config/database.js)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP has no password
    database: 'pauinv',
    multipleStatements: true
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'config', 'staff_migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Running migration...');
        
        // Execute the migration
        db.query(migrationSQL, (err, results) => {
            if (err) {
                console.error('Migration failed:', err);
                process.exit(1);
            }
            
            console.log('Migration completed successfully!');
            console.log('Staff management tables created and sample data inserted.');
            
            db.end();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error reading migration file:', error);
        process.exit(1);
    }
}

// Run migration
console.log('PAU Inventory Management System - Staff Database Migration');
console.log('===========================================================');
runMigration();
