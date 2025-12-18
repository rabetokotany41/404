const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        // DEBUG: Afficher les headers complets
        console.log('\n🔍 ========== DÉBUT AUTHENTIFICATION ==========');
        console.log('📋 Méthode:', req.method);
        console.log('📍 URL:', req.originalUrl);
        console.log('📦 Headers reçus:');
        console.log('- Authorization:', req.headers.authorization ? 'PRÉSENT' : 'ABSENT');
        console.log('- Content-Type:', req.headers['content-type']);
        console.log('- User-Agent:', req.headers['user-agent']);

        // Méthode 1: Header Authorization standard (Bearer token)
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            console.log('📌 Header Authorization complet:', authHeader);
            
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Enlever "Bearer "
                console.log('✅ Token extrait (avec Bearer):', token.substring(0, 30) + '...');
            } else {
                // Peut-être que "Bearer" est mal écrit ou absent
                token = authHeader;
                console.log('⚠️ Token extrait (sans Bearer):', token.substring(0, 30) + '...');
            }
        }

        // Méthode 2: Header personnalisé
        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
            console.log('✅ Token extrait de x-auth-token:', token.substring(0, 30) + '...');
        }

        // Méthode 3: Query parameter (pour debug)
        if (!token && req.query.token) {
            token = req.query.token;
            console.log('✅ Token extrait de query:', token.substring(0, 30) + '...');
        }

        if (!token) {
            console.log('❌ ERREUR: Aucun token trouvé !');
            console.log('Méthodes vérifiées:');
            console.log('1. Authorization header:', req.headers.authorization ? 'PRÉSENT' : 'ABSENT');
            console.log('2. x-auth-token header:', req.headers['x-auth-token'] ? 'PRÉSENT' : 'ABSENT');
            console.log('3. Query token:', req.query.token ? 'PRÉSENT' : 'ABSENT');
            console.log('===========================================\n');
            
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé. Token manquant.',
                details: 'Le token JWT n\'a pas été trouvé dans les en-têtes.'
            });
        }

        // Nettoyer le token
        token = token.trim();
        console.log('🧹 Token nettoyé:', token.substring(0, 50) + '...');
        console.log('📏 Longueur du token:', token.length);

        // Supprimer les guillemets éventuels
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
            console.log('🧹 Guillemets doubles retirés');
        }
        if (token.startsWith("'") && token.endsWith("'")) {
            token = token.slice(1, -1);
            console.log('🧹 Guillemets simples retirés');
        }

        // Vérifier la longueur minimale d'un JWT
        if (token.length < 50) {
            console.log('❌ Token trop court pour être un JWT valide');
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
                details: 'Le token est trop court.'
            });
        }

        // Vérifier le token JWT
        const jwtSecret = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';
        console.log('🔑 JWT Secret utilisé:', jwtSecret.substring(0, 10) + '...');
        
        try {
            const decoded = jwt.verify(token, jwtSecret);
            console.log('✅ Token JWT valide !');
            console.log('📊 Données décodées:', {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
            });

            // Récupérer l'utilisateur
            const user = await User.findById(decoded.id);
            
            if (!user) {
                console.log('❌ Utilisateur non trouvé pour ID:', decoded.id);
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérifier si le compte est actif
            if (user.is_active === 0 || user.is_active === false) {
                console.log('❌ Compte désactivé pour:', user.email);
                return res.status(401).json({
                    success: false,
                    message: 'Votre compte est désactivé'
                });
            }

            // Attacher l'utilisateur à la requête
            req.user = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role || 'user'
            };

            console.log('✅ Authentification réussie pour:', req.user.email);
            console.log('===========================================\n');
            
            next();

        } catch (jwtError) {
            console.error('❌ Erreur JWT:', jwtError.name, '-', jwtError.message);
            
            if (jwtError.name === 'JsonWebTokenError') {
                console.error('Détails JWT error:', jwtError.message);
                return res.status(401).json({
                    success: false,
                    message: 'Token JWT invalide',
                    details: jwtError.message
                });
            }
            
            if (jwtError.name === 'TokenExpiredError') {
                console.error('Token expiré le:', new Date(jwtError.expiredAt).toISOString());
                return res.status(401).json({
                    success: false,
                    message: 'Token expiré',
                    details: 'Veuillez vous reconnecter'
                });
            }
            
            throw jwtError;
        }

    } catch (error) {
        console.error('❌ Erreur générale dans protect middleware:', error.message);
        console.error('Stack:', error.stack);
        console.log('===========================================\n');
        
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { protect };