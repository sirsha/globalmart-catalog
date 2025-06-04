const dbPromise = require("../config/db");

const Todo = {
    getAll: async (callback) => {
        try {
            const db = await dbPromise;
            const [results] = await db.query("SELECT * FROM repair_jobs ORDER BY created_at DESC");
            callback(null, results);
        } catch (error) {
            callback(error, null);
        }
    },

    create: async (jobData, callback) => {
        try {
            const db = await dbPromise;
            const { 
                title, 
                customer_name, 
                repair_type = 'General Maintenance', 
                priority = 'Medium', 
                estimated_cost = null 
            } = jobData;
            
            const [result] = await db.query(
                `INSERT INTO repair_jobs (title, customer_name, repair_type, priority, estimated_cost, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`,
                [title, customer_name, repair_type, priority, estimated_cost]
            );
            callback(null, result);
        } catch (error) {
            callback(error, null);
        }
    },

    updateStatus: async (id, status, callback) => {
        try {
            const db = await dbPromise;
            const [result] = await db.query(
                "UPDATE repair_jobs SET status = ? WHERE id = ?",
                [status, id]
            );
            callback(null, result);
        } catch (error) {
            callback(error, null);
        }
    },

    delete: async (id, callback) => {
        try {
            const db = await dbPromise;
            const [result] = await db.query("DELETE FROM repair_jobs WHERE id = ?", [id]);
            callback(null, result);
        } catch (error) {
            callback(error, null);
        }
    }
};

// Create the updated table
const createTable = async () => {
    try {
        const db = await dbPromise;
        
        // First, check if the old todos table exists and rename it
        await db.query(`
            CREATE TABLE IF NOT EXISTS repair_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                repair_type VARCHAR(100) DEFAULT 'General Maintenance',
                priority ENUM('Low', 'Medium', 'High', 'Emergency') DEFAULT 'Medium',
                status ENUM('Pending', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Pending',
                estimated_cost DECIMAL(10,2) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log("✅ 'repair_jobs' table created or already exists.");
    } catch (error) {
        console.error("❌ Error creating table:", error);
    }
};

createTable();

module.exports = Todo;