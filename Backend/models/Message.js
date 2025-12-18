const pool = require('../config/database');

class Message {
    static async create(conversationId, senderId, content, fileUrl = null, fileName = null) {
        try {
            // Vérifier si la conversation existe
            const [convRows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [conversationId]);
            if (convRows.length === 0) {
                throw new Error('Conversation non trouvée');
            }

            const [result] = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, content, file_url, file_name, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [conversationId, senderId, content, fileUrl, fileName]
            );

            const message = await this.findById(result.insertId);
            return message;
        } catch (error) {
            console.error('Erreur create message:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT m.*, 
                        u.first_name as sender_first_name, 
                        u.last_name as sender_last_name,
                        u.email as sender_email,
                        u.avatar as sender_avatar,
                        u.role as sender_role
                 FROM messages m
                 LEFT JOIN users u ON m.sender_id = u.id
                 WHERE m.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Erreur findById:', error);
            throw error;
        }
    }

    static async findByConversationId(conversationId) {
        try {
            const [rows] = await pool.query(
                `SELECT m.*, 
                        u.first_name as sender_first_name, 
                        u.last_name as sender_last_name,
                        u.email as sender_email,
                        u.avatar as sender_avatar,
                        u.role as sender_role
                 FROM messages m
                 LEFT JOIN users u ON m.sender_id = u.id
                 WHERE m.conversation_id = ?
                 ORDER BY m.created_at ASC`,
                [conversationId]
            );
            return rows;
        } catch (error) {
            console.error('Erreur findByConversationId:', error);
            throw error;
        }
    }

    static async countUnread(conversationId, userId) {
        try {
            const [rows] = await pool.query(
                `SELECT COUNT(*) as count 
                 FROM messages m
                 WHERE m.conversation_id = ? 
                    AND m.sender_id != ?
                    AND m.is_read = FALSE`,
                [conversationId, userId]
            );
            return rows[0].count;
        } catch (error) {
            console.error('Erreur countUnread:', error);
            throw error;
        }
    }

    static async markAsRead(messageId, userId) {
        try {
            await pool.query(
                `UPDATE messages 
                 SET is_read = TRUE, read_at = NOW() 
                 WHERE id = ? AND sender_id != ?`,
                [messageId, userId]
            );

            // Mettre à jour la table message_read_status
            await pool.query(
                `INSERT INTO message_read_status (message_id, user_id, is_read, read_at) 
                 VALUES (?, ?, TRUE, NOW())
                 ON DUPLICATE KEY UPDATE is_read = TRUE, read_at = NOW()`,
                [messageId, userId]
            );
        } catch (error) {
            console.error('Erreur markAsRead:', error);
            throw error;
        }
    }

    static async markAllAsRead(conversationId, userId) {
        try {
            // Marquer tous les messages comme lus dans la table messages
            await pool.query(
                `UPDATE messages 
                 SET is_read = TRUE, read_at = NOW() 
                 WHERE conversation_id = ? 
                    AND sender_id != ? 
                    AND is_read = FALSE`,
                [conversationId, userId]
            );

            // Marquer dans message_read_status
            const [messages] = await pool.query(
                `SELECT id FROM messages 
                 WHERE conversation_id = ? AND sender_id != ?`,
                [conversationId, userId]
            );

            for (const message of messages) {
                await pool.query(
                    `INSERT INTO message_read_status (message_id, user_id, is_read, read_at) 
                     VALUES (?, ?, TRUE, NOW())
                     ON DUPLICATE KEY UPDATE is_read = TRUE, read_at = NOW()`,
                    [message.id, userId]
                );
            }
        } catch (error) {
            console.error('Erreur markAllAsRead:', error);
            throw error;
        }
    }

    static async getConversationLastMessage(conversationId) {
        try {
            const [rows] = await pool.query(
                `SELECT m.*, 
                        u.first_name as sender_first_name, 
                        u.last_name as sender_last_name
                 FROM messages m
                 LEFT JOIN users u ON m.sender_id = u.id
                 WHERE m.conversation_id = ?
                 ORDER BY m.created_at DESC
                 LIMIT 1`,
                [conversationId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Erreur getConversationLastMessage:', error);
            throw error;
        }
    }
}

module.exports = Message;