const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nexus_chat',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4'
});

// Test de la connexion
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        console.log('Assurez-vous que:');
        console.log('1. MySQL est installé et démarré');
        console.log('2. La base de données "nexus_chat" existe');
        console.log('3. Les informations de connexion dans .env sont correctes');
    } else {
        console.log('✅ Connecté à la base de données MySQL');
        connection.release();
    }
});

// Convertir en promesses
const promisePool = pool.promise();

module.exports = promisePool;