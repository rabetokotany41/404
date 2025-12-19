require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Import des configurations
const pool = require('./config/database');
const { uploadDir } = require('./config/multer');

// Import des routes
const authRoutes = require('./routes/auth');
const checkRoutes = require('./routes/check');
const learningRoutes = require('./routes/learning');
const shareAlertsRoutes = require('./routes/shareAlerts');
const aiRoutes = require('./routes/ai');
const imageRoutes = require('./routes/image');
// aiChatRoutes supprimé

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';

// =======================
// SOCKET.IO
// =======================
const io = new Server(server, {
  cors: { 
    origin: CLIENT_URL.split(','), 
    methods: ['GET', 'POST'], 
    credentials: true 
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

// =======================
// MIDDLEWARES
// =======================
app.use(helmet());
app.use(cors({ 
  origin: CLIENT_URL.split(','), 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => { 
  req.io = io; 
  next(); 
});

// =======================
// ROUTES PRINCIPALES
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/learning-modules', learningRoutes);
app.use('/api/share-alerts', shareAlertsRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/check', imageRoutes); 
// aiChatRoutes supprimé

// =======================
// SERVIR LES IMAGES UPLOADÉES
// =======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// HEALTH CHECK
// =======================
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    success: true,
    message: '✅ Serveur en ligne',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0',
    services: {
      database: 'checking',
      socket_io: 'active',
      file_system: 'checking'
    }
  };

  try {
    await pool.query('SELECT 1');
    healthCheck.services.database = 'connected';
    
    healthCheck.services.file_system = fs.existsSync(uploadDir) ? 'ready' : 'upload_dir_missing';
    
    res.json(healthCheck);
  } catch (err) {
    healthCheck.success = false;
    healthCheck.status = 'unhealthy';
    healthCheck.message = '❌ Problèmes détectés';
    healthCheck.services.database = err.message;
    
    res.status(500).json(healthCheck);
  }
});

// =======================
// TEST ENDPOINT
// =======================
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API Mpanolo-tsaina fonctionnelle',
    endpoints: {
      analyze: 'POST /api/ai/analyze',
      generate_image: 'POST /api/ai/generate-image',
      check_image: 'POST /api/check/image (avec fichier image)',
      health: 'GET /api/health',
      uploads: 'GET /uploads/:filename'
    },
    server_info: {
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    }
  });
});

// =======================
// SOCKET.IO HANDLERS
// =======================
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connecté:', socket.id, socket.handshake.address);

  socket.on('authenticate', ({ userId }) => {
    if (!userId) {
      socket.emit('auth_error', { message: 'User ID requis' });
      return;
    }
    socket.userId = userId;
    socket.join(`user_${userId}`);
    connectedUsers.set(socket.id, userId);
    console.log(`👤 User ${userId} authentifié via socket`);
    socket.emit('authenticated', { success: true, userId, socketId: socket.id });
  });

  socket.on('check_completed', ({ userId, checkId, result }) => {
    if (!userId || userId !== socket.userId) {
      socket.emit('error', { message: 'Non autorisé' });
      return;
    }
    io.to(`user_${userId}`).emit('check_result_ready', { checkId, result, timestamp: new Date().toISOString(), delivered_to: socket.id });
    console.log(`📊 Résultat check ${checkId} envoyé à user ${userId}`);
  });

  socket.on('disconnect', (reason) => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      console.log(`👋 User ${userId} déconnecté (${reason})`);
      connectedUsers.delete(socket.id);
    } else {
      console.log('❌ Socket déconnecté sans auth:', socket.id, reason);
    }
  });

  socket.on('error', (error) => console.error('Socket error:', socket.id, error));
});

// =======================
// 404 & ERROR HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée', requested_url: req.originalUrl, method: req.method });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ success: false, message: 'Erreur serveur interne', error: process.env.NODE_ENV === 'development' ? err.message : undefined, timestamp: new Date().toISOString() });
});

// =======================
// START SERVER
// =======================
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ============================================
  SERVEUR MPANOLO-TSAINA AI DÉMARRÉ 🚀
  ============================================
  API: http://localhost:${PORT}
  Client: ${CLIENT_URL}
  Environnement: ${process.env.NODE_ENV || 'development'}
  
  ENDPOINTS PRINCIPAUX:
  - POST http://localhost:${PORT}/api/ai/analyze
  - POST http://localhost:${PORT}/api/ai/generate-image
  - POST http://localhost:${PORT}/api/check/image (upload)
  - GET  http://localhost:${PORT}/api/health
  - GET  http://localhost:${PORT}/api/test
  
  SOCKET.IO: ws://localhost:${PORT}
  UPLOAD DIR: ${uploadDir}
  
  BASE DE DONNÉES: MySQL
  HUGGING FACE: ${process.env.HF_TOKEN ? 'Connecté' : 'Mode simulation'}
  ============================================
  `);
});

// =======================
// Gestion propre de l'arrêt
// =======================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu, fermeture propre...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    pool.end(() => {
      console.log('✅ Pool MySQL fermé');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT reçu (Ctrl+C)');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});