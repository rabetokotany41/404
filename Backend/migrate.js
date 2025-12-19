const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateUsers() {
    let connection;

    try {
        console.log('DÉMARRAGE DE LA MIGRATION DE LA TABLE USERS');

        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'L3_L2_L1';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        console.log(`✅ Base de données '${dbName}' créée/connectée`);

        // Création de la table users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(100) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),

                phone VARCHAR(20),
                company VARCHAR(255),
                position VARCHAR(100),
                user_type ENUM('student','teacher','researcher','admin') DEFAULT 'student',
                language_preference ENUM('mg','fr','en') DEFAULT 'mg',
                education_level VARCHAR(50),
                school_name VARCHAR(255),
                region VARCHAR(100),

                total_checks INT DEFAULT 0,
                correct_guesses INT DEFAULT 0,
                learning_score INT DEFAULT 0,
                streak_days INT DEFAULT 0,

                receive_alerts BOOLEAN DEFAULT TRUE,
                share_public_data BOOLEAN DEFAULT FALSE,
                theme VARCHAR(20) DEFAULT 'light',

                email_verified BOOLEAN DEFAULT FALSE,
                verification_token VARCHAR(255),
                reset_token VARCHAR(255),
                reset_token_expires TIMESTAMP NULL,

                last_login TIMESTAMP NULL,
                last_activity TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,

                INDEX idx_email (email),
                INDEX idx_username (username),
                INDEX idx_user_type (user_type),
                INDEX idx_region (region),
                INDEX idx_created_at (created_at)
            );
        `);

        console.log('✅ Table users créée ou déjà existante');

        // Vérification et ajout des colonnes manquantes (pour MySQL < 8)
        const extraColumns = [
            { name: 'phone', type: 'VARCHAR(20)' },
            { name: 'company', type: 'VARCHAR(255)' },
            { name: 'position', type: 'VARCHAR(100)' },
            { name: 'full_name', type: 'VARCHAR(255)' }
        ];

        for (const col of extraColumns) {
            try {
                await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (err) {
                console.log(`ℹ️ Colonne '${col.name}' déjà existante ou non supportée`);
            }
        }

        console.log('🎉 Migration de la table users terminée');

    } catch (error) {
        console.error('❌ Erreur lors de la migration de users:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connexion MySQL fermée');
        }
    }
}

migrateUsers();