const pool = require('../config/database');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const [notifications] = await pool.query(
        `SELECT 
          n.*,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar
         FROM notifications n
         LEFT JOIN users u ON u.id = n.user_id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
      );

      const [unreadCount] = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      res.json({
        success: true,
        notifications: notifications.map(notif => ({
          ...notif,
          data: notif.data ? JSON.parse(notif.data) : null
        })),
        unreadCount: unreadCount[0]?.count || 0,
        total: notifications.length
      });
    } catch (error) {
      console.error('❌ Erreur getNotifications:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const [result] = await pool.query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Notification non trouvée' });
      }

      if (req.io) {
        req.io.to(`user_${userId}`).emit('notification_read', { notificationId });
      }

      res.json({ success: true, message: 'Notification marquée comme lue' });
    } catch (error) {
      console.error('❌ Erreur markAsRead:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await pool.query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      if (req.io) {
        req.io.to(`user_${userId}`).emit('all_notifications_read');
      }

      res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
    } catch (error) {
      console.error('❌ Erreur markAllAsRead:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const [result] = await pool.query(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Notification non trouvée' });
      }

      res.json({ success: true, message: 'Notification supprimée' });
    } catch (error) {
      console.error('❌ Erreur deleteNotification:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  async createNotification(req, res) {
    try {
      const { userId, title, message, type = 'info', priority = 'medium', data = {} } = req.body;

      const [result] = await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, priority, data) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, message, type, priority, JSON.stringify(data)]
      );

      if (req.io) {
        const notification = {
          id: result.insertId,
          user_id: userId,
          title,
          message,
          type,
          priority,
          is_read: false,
          data,
          created_at: new Date().toISOString()
        };
        req.io.to(`user_${userId}`).emit('new_notification', notification);
      }

      res.json({
        success: true,
        message: 'Notification créée',
        notificationId: result.insertId
      });
    } catch (error) {
      console.error('❌ Erreur createNotification:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}

module.exports = new NotificationController();
