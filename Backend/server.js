require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Connexion à la base de données
const pool = require('./config/database');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling']
});

// Middlewares globaux
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Middleware pour ajouter io aux requêtes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import des middlewares et contrôleurs
const { protect } = require('./middleware/auth');

// Routes principales
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications'); // Correction ici

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/notifications', protect, notificationRoutes); // Correction ici

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur en ligne',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MySQL'
  });
});

// Route pour tester les notifications (debug)
app.get('/api/test-notifications', protect, async (req, res) => {
  try {
    // Créer une notification de test
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, priority, data) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        'Notification de test',
        'Ceci est une notification de test envoyée depuis l\'API',
        'info',
        'medium',
        JSON.stringify({ test: true, time: new Date().toISOString() })
      ]
    );

    // Envoyer via WebSocket
    io.to(`user_${req.user.id}`).emit('new_notification', {
      id: result.insertId,
      user_id: req.user.id,
      title: 'Notification de test',
      message: 'Ceci est une notification de test envoyée depuis l\'API',
      type: 'info',
      priority: 'medium',
      is_read: false,
      data: { test: true, time: new Date().toISOString() },
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Notification de test envoyée',
      notificationId: result.insertId
    });
  } catch (error) {
    console.error('❌ Erreur test notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Socket.io handler
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('✅ Client socket connecté:', socket.id);

  // Authentification du socket
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      connectedUsers.set(socket.id, userId);
      console.log(`👤 Utilisateur ${userId} authentifié sur socket ${socket.id}`);
    }
  });

  // Gestion des conversations
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Client ${socket.id} rejoint conversation_${conversationId}`);
  });

  // Gestion des messages
  socket.on('send_message', (data) => {
    console.log('📨 Socket send_message:', data);
    const { conversationId, message } = data || {};
    if (conversationId) {
      io.to(`conversation_${conversationId}`).emit('new_message', message);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId } = data || {};
    if (conversationId) {
      socket.to(`conversation_${conversationId}`).emit('user_typing', { conversationId, userId });
    }
  });

  // Écouter pour envoyer des notifications
  socket.on('send_notification', async (data) => {
    try {
      const { userId, title, message, type = 'info', priority = 'medium', data: extraData } = data;
      
      // Sauvegarder dans la base de données
      const [result] = await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, priority, data) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, message, type, priority, JSON.stringify(extraData || {})]
      );

      // Envoyer via WebSocket
      const notification = {
        id: result.insertId,
        user_id: userId,
        title,
        message,
        type,
        priority,
        is_read: false,
        data: extraData || {},
        created_at: new Date().toISOString()
      };

      io.to(`user_${userId}`).emit('new_notification', notification);
      console.log(`🔔 Notification envoyée à l'utilisateur ${userId}: ${title}`);
    } catch (error) {
      console.error('❌ Erreur envoi notification socket:', error);
    }
  });

  // Marquer notification comme lue
  socket.on('mark_notification_read', async (data) => {
    try {
      const { notificationId } = data;
      await pool.query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?',
        [notificationId]
      );
      console.log(`✅ Notification ${notificationId} marquée comme lue`);
    } catch (error) {
      console.error('❌ Erreur marquer notification comme lue:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      console.log(`👤 Utilisateur ${userId} déconnecté (socket: ${socket.id})`);
      connectedUsers.delete(socket.id);
    } else {
      console.log('❌ Client socket déconnecté:', socket.id);
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route non trouvée',
    path: req.url,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌍 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`⚙️ Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Routes disponibles:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/profile`);
  console.log(`   POST /api/messages`);
  console.log(`   GET  /api/messages/conversations`);
  console.log(`   GET  /api/notifications`);
  console.log(`   GET  /api/test-notifications`);
});