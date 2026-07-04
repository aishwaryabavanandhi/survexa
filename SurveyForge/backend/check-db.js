const fs = require('fs');
const path = require('path');
const { initDatabase, query } = require('./database/database'); // Try resolving database

async function checkDatabase() {
    console.log('--- Database Connection Check ---');
    try {
        await initDatabase();
        console.log('✅ Database connection initialized successfully.');
        
        const tables = [
            'users', 
            'surveys', 
            'questions', 
            'responses', 
            'activity_logs', 
            'admin_settings'
        ];
        
        console.log('\\n--- Table Row Counts ---');
        for (const table of tables) {
            try {
                const res = query("SELECT COUNT(*) as count FROM " + table);
                console.log("✅ " + table + ": " + res[0].count + " rows");
            } catch (err) {
                console.log("❌ " + table + ": Error - " + err.message);
            }
        }
        
    } catch (e) {
        console.error('❌ Failed to connect to database: ', e.message);
    }
}

checkDatabase().catch(console.error);
