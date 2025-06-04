// config/db.js - Updated for cloud deployment
require("dotenv").config();
const mysql = require("mysql2/promise");

let connection;

const connectDB = async () => {
  try {
    // Use RDS environment variables in production, fallback to local in development
    const dbConfig = {
      host: process.env.RDS_HOSTNAME || process.env.DB_HOST || 'localhost',
      user: process.env.RDS_USERNAME || process.env.DB_USER || 'root',
      password: process.env.RDS_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'repair_shop',
      port: process.env.RDS_PORT || process.env.DB_PORT || 3306,
      // Add connection pool settings for better performance
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    };

    console.log(`Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    
    console.log("✅ Connected to MySQL Database");
    
    // Test the connection
    await connection.execute('SELECT 1');
    console.log("✅ Database connection test successful");
    
    return connection;
  } catch (err) {
    console.error("❌ Error connecting to MySQL:", err);
    // In production, you might want to retry instead of exiting
    if (process.env.NODE_ENV === 'production') {
      console.log("Retrying database connection in 5 seconds...");
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

// Initialize connection
connectDB();

// Export connection with error handling
module.exports = {
  execute: async (...args) => {
    try {
      if (!connection) {
        console.log("Reconnecting to database...");
        await connectDB();
      }
      return await connection.execute(...args);
    } catch (error) {
      console.error("Database execution error:", error);
      // Try to reconnect
      await connectDB();
      return await connection.execute(...args);
    }
  }
};