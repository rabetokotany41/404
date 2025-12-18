const pool = require('../config/database');

class Conversation {
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT c.*, 
                        u.first_name as user_first_name, u.last_name as user_last_name,
                        u.email as user_email, u.avatar as user_avatar, u.role as user_role,
                        a.first_name as admin_first_name, a.last_name as admin_last_name,
                        a.email as admin_email, a.avatar as admin_avatar
                 FROM conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 LEFT JOIN users a ON c.admin_id = a.id
                 WHERE c.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Erreur findById:', error);
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const [rows] = await pool.query(
                `SELECT c.*, 
                        u.first_name as user_first_name, u.last_name as user_last_name,
                        u.email as user_email, u.avatar as user_avatar, u.role as user_role,
                        a.first_name as admin_first_name, a.last_name as admin_last_name,
                        a.email as admin_email, a.avatar as admin_avatar
                 FROM conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 LEFT JOIN users a ON c.admin_id = a.id
                 WHERE c.user_id = ?
                 ORDER BY 
                    CASE 
                        WHEN c.is_pinned = TRUE THEN 0 
                        WHEN c.status = 'open' THEN 1
                        WHEN c.status = 'pending' THEN 2
                        ELSE 3 
                    END,
                    c.updated_at DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Erreur findByUserId:', error);
            throw error;
        }
    }

    static async findByAdminId(adminId) {
        try {
            const [rows] = await pool.query(
                `SELECT c.*, 
                        u.first_name as user_first_name, u.last_name as user_last_name,
                        u.email as user_email, u.avatar as user_avatar, u.role as user_role,
                        u.created_at as user_created_at,
                        a.first_name as admin_first_name, a.last_name as admin_last_name,
                        a.email as admin_email, a.avatar as admin_avatar
                 FROM conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 LEFT JOIN users a ON c.admin_id = a.id
                 WHERE (c.admin_id = ? OR c.admin_id IS NULL)
                    AND c.user_id IS NOT NULL
                    AND u.id IS NOT NULL
                 ORDER BY 
                    CASE 
                        WHEN c.is_pinned = TRUE THEN 0 
                        WHEN c.admin_id IS NULL THEN 1
                        WHEN c.status = 'open' THEN 2
                        WHEN c.status = 'pending' THEN 3
                        ELSE 4 
                    END,
                    c.updated_at DESC`,
                [adminId]
            );
            return rows;
        } catch (error) {
            console.error('Erreur findByAdminId:', error);
            throw error;
        }
    }

    static async findAllForAdmins() {
        try {
            const [rows] = await pool.query(
                `SELECT c.*, 
                        u.first_name as user_first_name, u.last_name as user_last_name,
                        u.email as user_email, u.avatar as user_avatar, u.role as user_role,
                        u.created_at as user_created_at,
                        a.first_name as admin_first_name, a.last_name as admin_last_name,
                        a.email as admin_email, a.avatar as admin_avatar
                 FROM conversations c
                 LEFT JOIN users u ON c.user_id = u.id
                 LEFT JOIN users a ON c.admin_id = a.id
                 WHERE c.user_id IS NOT NULL
                    AND u.id IS NOT NULL
                 ORDER BY 
                    CASE 
                        WHEN c.is_pinned = TRUE THEN 0 
                        WHEN c.admin_id IS NULL THEN 1
                        WHEN c.status = 'open' THEN 2
                        WHEN c.status = 'pending' THEN 3
                        ELSE 4 
                    END,
                    c.updated_at DESC`
            );
            return rows;
        } catch (error) {
            console.error('Erreur findAllForAdmins:', error);
            throw error;
        }
    }

    static async create(userId, adminId = null, title = 'Nouvelle conversation') {
        try {
            // Vérifier si l'utilisateur existe
            const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                throw new Error('Utilisateur non trouvé');
            }

            const user = userRows[0];

            // Si aucun admin n'est spécifié et que l'utilisateur n'est pas admin
            if (!adminId && user.role !== 'admin') {
                // Trouver un admin disponible
                const [admins] = await pool.query(
                    `SELECT u.*, 
                            (SELECT COUNT(*) FROM conversations c2 
                             WHERE c2.admin_id = u.id AND c2.status IN ('pending', 'open')) as conversation_count
                     FROM users u
                     WHERE u.role = 'admin' AND u.is_active = TRUE
                     ORDER BY conversation_count ASC
                     LIMIT 1`
                );
                
                if (admins.length > 0) {
                    adminId = admins[0].id;
                }
            }

            const [result] = await pool.query(
                `INSERT INTO conversations (user_id, admin_id, title, status, created_at, updated_at) 
                 VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
                [userId, adminId, title]
            );

            // Récupérer la conversation créée avec les informations utilisateur
            const conversation = await this.findById(result.insertId);
            return conversation;
        } catch (error) {
            console.error('Erreur create conversation:', error);
            throw error;
        }
    }

    static async updateLastMessage(conversationId, message) {
        try {
            await pool.query(
                `UPDATE conversations 
                 SET last_message = ?, last_message_time = NOW(), updated_at = NOW() 
                 WHERE id = ?`,
                [message, conversationId]
            );
        } catch (error) {
            console.error('Erreur updateLastMessage:', error);
            throw error;
        }
    }

    static async updateStatus(conversationId, status) {
        try {
            await pool.query(
                `UPDATE conversations 
                 SET status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [status, conversationId]
            );
        } catch (error) {
            console.error('Erreur updateStatus:', error);
            throw error;
        }
    }

    static async assignAdmin(conversationId, adminId) {
        try {
            // Vérifier si l'admin existe
            const [adminRows] = await pool.query(
                'SELECT * FROM users WHERE id = ? AND role = "admin"',
                [adminId]
            );
            
            if (adminRows.length === 0) {
                throw new Error('Administrateur non trouvé');
            }

            await pool.query(
                `UPDATE conversations 
                 SET admin_id = ?, status = 'open', updated_at = NOW() 
                 WHERE id = ?`,
                [adminId, conversationId]
            );

            return await this.findById(conversationId);
        } catch (error) {
            console.error('Erreur assignAdmin:', error);
            throw error;
        }
    }

    static async togglePin(conversationId) {
        try {
            await pool.query(
                `UPDATE conversations 
                 SET is_pinned = NOT is_pinned, updated_at = NOW() 
                 WHERE id = ?`,
                [conversationId]
            );
            
            const [rows] = await pool.query('SELECT is_pinned FROM conversations WHERE id = ?', [conversationId]);
            return rows[0]?.is_pinned || false;
        } catch (error) {
            console.error('Erreur togglePin:', error);
            throw error;
        }
    }

    static async toggleArchive(conversationId) {
        try {
            await pool.query(
                `UPDATE conversations 
                 SET is_archived = NOT is_archived, 
                     status = CASE WHEN is_archived = TRUE THEN 'open' ELSE 'archived' END,
                     updated_at = NOW() 
                 WHERE id = ?`,
                [conversationId]
            );
            
            const [rows] = await pool.query('SELECT is_archived FROM conversations WHERE id = ?', [conversationId]);
            return rows[0]?.is_archived || false;
        } catch (error) {
            console.error('Erreur toggleArchive:', error);
            throw error;
        }
    }

    static async getStats(adminId = null) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
                    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
                    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
                    COUNT(CASE WHEN admin_id IS NULL THEN 1 END) as unassigned,
                    COUNT(CASE WHEN is_pinned = TRUE THEN 1 END) as pinned
                FROM conversations
                WHERE user_id IS NOT NULL
            `;
            
            const params = [];
            
            if (adminId) {
                query += ` AND (admin_id = ? OR admin_id IS NULL)`;
                params.push(adminId);
            }
            
            const [rows] = await pool.query(query, params);
            return rows[0] || {};
        } catch (error) {
            console.error('Erreur getStats:', error);
            throw error;
        }
    }

    static async getUsersWithoutConversations(limit = 20) {
        try {
            const [rows] = await pool.query(
                `SELECT u.*, 
                        'no_conversation' as conversation_status,
                        u.created_at as conversation_created
                 FROM users u
                 WHERE u.role = 'user'
                    AND u.is_active = TRUE
                    AND NOT EXISTS (
                        SELECT 1 FROM conversations c 
                        WHERE c.user_id = u.id AND c.status != 'closed'
                    )
                 ORDER BY u.created_at DESC
                 LIMIT ?`,
                [limit]
            );
            return rows;
        } catch (error) {
            console.error('Erreur getUsersWithoutConversations:', error);
            throw error;
        }
    }
}

module.exports = Conversation;