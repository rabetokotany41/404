const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
    try {
        console.log('\n📝 ========== INSCRIPTION ==========');
        console.log('Données reçues:', req.body);
        
        const { first_name, last_name, email, password } = req.body;

        // Validation
        if (!first_name || !last_name || !email || !password) {
            console.log('❌ Champs manquants');
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log('❌ Email déjà utilisé:', email);
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Créer l'utilisateur
        console.log('🔄 Création de l\'utilisateur...');
        const user = await User.create({
            first_name,
            last_name,
            email,
            password
        });

        // Générer le token JWT
        const jwtSecret = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';
        console.log('🔑 Génération du token avec secret:', jwtSecret.substring(0, 10) + '...');
        
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role || 'user'
            },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        console.log('✅ Token généré (premiers 50 chars):', token.substring(0, 50) + '...');
        console.log('📏 Longueur token:', token.length);

        // Mettre à jour le last_login
        await User.updateLastLogin(user.id);

        console.log('✅ Inscription réussie pour:', user.email);
        console.log('========================================\n');

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Erreur register:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        console.log('\n🔐 ========== CONNEXION ==========');
        console.log('Tentative de connexion pour:', req.body.email);
        
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            console.log('❌ Email ou mot de passe manquant');
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur
        console.log('🔍 Recherche de l\'utilisateur...');
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', email);
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        console.log('✅ Utilisateur trouvé:', user.email);

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect pour:', email);
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        console.log('✅ Mot de passe valide');

        // Vérifier si le compte est actif
        if (user.is_active === 0 || user.is_active === false) {
            console.log('❌ Compte désactivé:', email);
            return res.status(401).json({
                success: false,
                message: 'Votre compte est désactivé'
            });
        }

        // Générer le token JWT
        const jwtSecret = process.env.JWT_SECRET || 'votre-secret-jwt-par-defaut';
        console.log('🔑 Génération du token avec secret:', jwtSecret.substring(0, 10) + '...');
        
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role || 'user'
            },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        console.log('✅ Token généré (premiers 50 chars):', token.substring(0, 50) + '...');
        console.log('📏 Longueur token:', token.length);

        // Mettre à jour le last_login
        await User.updateLastLogin(user.id);

        console.log('✅ Connexion réussie pour:', user.email);
        console.log('========================================\n');

        res.json({
            success: true,
            message: 'Connexion réussie',
            token: token, // Token bien renvoyé
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        console.log('\n👤 ========== PROFIL ==========');
        console.log('Demande de profil pour user ID:', req.user.id);
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        console.log('✅ Profil trouvé:', user.email);
        console.log('========================================\n');

        res.json({
            success: true,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role || 'user',
                company: user.company,
                position: user.position,
                industry: user.industry,
                phone: user.phone,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('❌ Erreur getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        console.log('\n✏️ ========== MISE À JOUR PROFIL ==========');
        console.log('Données reçues:', req.body);
        console.log('User ID:', req.user.id);
        
        const { first_name, last_name, phone, company, position, industry } = req.body;
        
        // Validation
        if (!first_name || !last_name) {
            console.log('❌ Prénom ou nom manquant');
            return res.status(400).json({
                success: false,
                message: 'Le prénom et le nom sont requis'
            });
        }

        console.log('🔄 Mise à jour du profil...');
        const user = await User.updateProfile(req.user.id, {
            first_name,
            last_name,
            phone,
            company,
            position,
            industry
        });

        console.log('✅ Profil mis à jour pour:', user.email);
        console.log('========================================\n');

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role || 'user',
                company: user.company,
                position: user.position,
                industry: user.industry,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('❌ Erreur updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        console.log('\n🚪 ========== DÉCONNEXION ==========');
        console.log('Déconnexion pour user ID:', req.user?.id);
        console.log('========================================\n');
        
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('❌ Erreur logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};