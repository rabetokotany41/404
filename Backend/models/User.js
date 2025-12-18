const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Erreur findById:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('Erreur findByEmail:', error);
            throw error;
        }
    }

    static async getAllAdmins() {
        try {
            const [rows] = await pool.query(
                `SELECT u.*, 
                        (SELECT COUNT(*) FROM conversations c 
                         WHERE c.admin_id = u.id AND c.status IN ('pending', 'open')) as conversation_count
                 FROM users u
                 WHERE u.role = 'admin' AND u.is_active = TRUE
                 ORDER BY u.first_name, u.last_name`
            );
            return rows;
        } catch (error) {
            console.error('Erreur getAllAdmins:', error);
            throw error;
        }
    }

    static async getAvailableAdmins() {
        try {
            const [rows] = await pool.query(
                `SELECT u.*, 
                        (SELECT COUNT(*) FROM conversations c 
                         WHERE c.admin_id = u.id AND c.status IN ('pending', 'open')) as conversation_count
                 FROM users u
                 WHERE u.role = 'admin' 
                    AND u.is_active = TRUE
                 ORDER BY conversation_count ASC`
            );
            return rows;
        } catch (error) {
            console.error('Erreur getAvailableAdmins:', error);
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { first_name, last_name, email, password, phone, company, position, industry, role = 'user' } = userData;
            
            // Vérifier si l'email existe déjà
            const existingUser = await this.findByEmail(email);
            if (existingUser) {
                throw new Error('Cet email est déjà utilisé');
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password, phone, company, position, industry, role, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [first_name, last_name, email, hashedPassword, phone, company, position, industry, role]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Erreur create user:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];
            
            // Construire dynamiquement la requête
            Object.keys(updateData).forEach(key => {
                if (key !== 'id') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (fields.length === 0) {
                return await this.findById(id);
            }
            
            values.push(id);
            
            await pool.query(
                `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
                values
            );
            
            return await this.findById(id);
        } catch (error) {
            console.error('Erreur update user:', error);
            throw error;
        }
    }

    static async updateLastLogin(id) {
        try {
            await pool.query(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Erreur updateLastLogin:', error);
            throw error;
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Erreur comparePassword:', error);
            throw error;
        }
    }

    static async getUsersWithStats(limit = 50, offset = 0) {
        try {
            const [rows] = await pool.query(
                `SELECT u.*,
                        (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) as conversation_count,
                        (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id) as message_count,
                        (SELECT MAX(created_at) FROM messages WHERE sender_id = u.id) as last_message_at,
                        (SELECT status FROM conversations WHERE user_id = u.id ORDER BY updated_at DESC LIMIT 1) as last_conversation_status
                 FROM users u
                 WHERE u.role = 'user'
                 ORDER BY u.created_at DESC
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Erreur getUsersWithStats:', error);
            throw error;
        }
    }

    static async searchUsers(searchTerm, role = null) {
        try {
            let query = `
                SELECT u.*,
                        (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) as conversation_count
                 FROM users u
                 WHERE (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
            `;
            
            const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
            
            if (role) {
                query += ` AND u.role = ?`;
                params.push(role);
            }
            
            query += ` ORDER BY u.created_at DESC LIMIT 50`;
            
            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Erreur searchUsers:', error);
            throw error;
        }
    }

    static async getRecentUsers(days = 7) {
        try {
            const [rows] = await pool.query(
                `SELECT u.*,
                        (SELECT COUNT(*) FROM conversations c WHERE c.user_id = u.id) as conversation_count
                 FROM users u
                 WHERE u.role = 'user' 
                    AND u.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                 ORDER BY u.created_at DESC`,
                [days]
            );
            return rows;
        } catch (error) {
            console.error('Erreur getRecentUsers:', error);
            throw error;
        }
    }
}

module.exports = User;