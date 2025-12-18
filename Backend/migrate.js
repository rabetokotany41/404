const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runMigration() {
    let connection;

    try {
        console.log('🚀 DÉMARRAGE DE LA MIGRATION COMPLÈTE');
        console.log('='.repeat(50));

        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('✅ Connecté à MySQL');

        const dbName = process.env.DB_NAME || 'nexus_chat';

        // 1. CRÉER LA BASE DE DONNÉES
        console.log('\n1. Création de la base de données...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);
        console.log(`✅ Base de données '${dbName}' créée/connectée`);

        // 2. TABLE USERS
        console.log('\n👤 2. Création de la table users...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                company VARCHAR(255),
                position VARCHAR(100),
                industry VARCHAR(100),
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                avatar VARCHAR(500) DEFAULT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table users créée');

        // 3. TABLE CONVERSATIONS
        console.log('\n💬 3. Création de la table conversations...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                admin_id INT DEFAULT NULL,
                title VARCHAR(255) DEFAULT 'Nouvelle conversation',
                status ENUM('pending', 'open', 'closed', 'archived') DEFAULT 'pending',
                last_message TEXT DEFAULT NULL,
                last_message_time TIMESTAMP NULL,
                is_pinned BOOLEAN DEFAULT FALSE,
                is_archived BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user_status (user_id, status),
                INDEX idx_admin_status (admin_id, status),
                INDEX idx_updated (updated_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table conversations créée');

        // 4. TABLE MESSAGES
        console.log('\n📨 4. Création de la table messages...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                file_url VARCHAR(500) DEFAULT NULL,
                file_name VARCHAR(255) DEFAULT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                read_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_conversation (conversation_id),
                INDEX idx_sender (sender_id),
                INDEX idx_conversation_read (conversation_id, is_read),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table messages créée');

        // 5. TABLE MESSAGE_READ_STATUS
        console.log('\n👁️ 5. Création de la table message_read_status...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS message_read_status (
                id INT PRIMARY KEY AUTO_INCREMENT,
                message_id INT NOT NULL,
                user_id INT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                read_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_message_user (message_id, user_id),
                FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_read (user_id, is_read),
                INDEX idx_message (message_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table message_read_status créée');

        // 6. TABLE NOTIFICATIONS
        console.log('\n🔔 6. Création de la table notifications...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('message', 'order', 'user', 'system', 'alert', 'info', 'success', 'warning') DEFAULT 'info',
                priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                is_read BOOLEAN DEFAULT FALSE,
                data JSON DEFAULT NULL,
                read_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_read (user_id, is_read),
                INDEX idx_user_type (user_id, type),
                INDEX idx_priority (priority),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table notifications créée');

        // 7. CRÉER UN UTILISATEUR ADMIN PAR DÉFAUT
        console.log('\n👑 7. Création d\'un administrateur par défaut...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        try {
            await connection.query(`
                INSERT INTO users (first_name, last_name, email, password, role) 
                VALUES ('Admin', 'System', 'admin@nexus.com', ?, 'admin')
                ON DUPLICATE KEY UPDATE email = email
            `, [hashedPassword]);
            console.log('✅ Administrateur par défaut créé (email: admin@nexus.com, mot de passe: admin123)');
        } catch (error) {
            console.log('ℹ️  Administrateur existe déjà ou erreur lors de la création:', error.message);
        }

        // 8. CRÉER QUELQUES NOTIFICATIONS DE TEST
        console.log('\n🔔 8. Création de notifications de test...');
        try {
            // Trouver l'ID de l'admin
            const [adminRows] = await connection.query(
                'SELECT id FROM users WHERE email = ?',
                ['admin@nexus.com']
            );
            
            if (adminRows.length > 0) {
                const adminId = adminRows[0].id;
                
                const testNotifications = [
                    {
                        user_id: adminId,
                        title: 'Bienvenue sur Nexus Chat',
                        message: 'Bienvenue dans votre espace administrateur',
                        type: 'system',
                        priority: 'low',
                        is_read: false,
                        data: JSON.stringify({ action: '/dashboard', icon: '👋' })
                    },
                    {
                        user_id: adminId,
                        title: 'Système prêt',
                        message: 'Le système a été initialisé avec succès',
                        type: 'success',
                        priority: 'low',
                        is_read: false,
                        data: JSON.stringify({ action: '/dashboard/system', icon: '✅' })
                    },
                    {
                        user_id: adminId,
                        title: 'Nouvelle version disponible',
                        message: 'Mise à jour v2.5 disponible - Améliorations de sécurité',
                        type: 'alert',
                        priority: 'medium',
                        is_read: false,
                        data: JSON.stringify({ version: '2.5', action: '/dashboard/updates' })
                    }
                ];
                
                for (const notif of testNotifications) {
                    await connection.query(
                        `INSERT INTO notifications (user_id, title, message, type, priority, is_read, data) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE title = title`,
                        [notif.user_id, notif.title, notif.message, notif.type, notif.priority, notif.is_read, notif.data]
                    );
                }
                console.log('✅ Notifications de test créées');
            }
        } catch (error) {
            console.log('ℹ️  Erreur lors de la création des notifications de test:', error.message);
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 MIGRATION TERMINÉE AVEC SUCCÈS !');
        console.log('='.repeat(50));
        console.log('\n📋 RÉCAPITULATIF:');
        console.log('✅ Base de données: ' + dbName);
        console.log('✅ Tables créées: users, conversations, messages, message_read_status, notifications');
        console.log('✅ Admin par défaut: admin@nexus.com / admin123');
        console.log('✅ Notifications de test créées');
        console.log('\n🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');

    } catch (error) {
        console.error('\n❌ ERREUR DE MIGRATION:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion MySQL fermée');
        }
    }
}

// Exécuter la migration
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;