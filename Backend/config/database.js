const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'L3_L2_L1',
  
  // Options de pool
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Options de connexion (pas de timeout ici)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // Options de timeout spécifiques au pool
  // acquireTimeout: 60000, // Temporairement commenté pour éviter l'avertissement
  // timeout: 60000, // ENLEVER cette ligne - n'est pas une option valide pour le pool
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    
    // Tester une requête simple
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log(`📊 Test query result: ${rows[0].solution}`);
    
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();

module.exports = pool;