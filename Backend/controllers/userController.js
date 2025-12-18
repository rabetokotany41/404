const User = require('../models/User');

// Obtenir tous les utilisateurs (Admin seulement)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await User.getAllUsers(page, limit);
        
        res.json({
            success: true,
            users: result.users,
            pagination: {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                limit: result.limit
            }
        });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                company: user.company,
                position: user.position,
                industry: user.industry,
                is_active: user.is_active,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('Erreur getUserById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// Obtenir tous les admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.getAllAdmins();
        
        res.json({
            success: true,
            admins: admins.map(admin => ({
                id: admin.id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                avatar: admin.avatar
            }))
        });
    } catch (error) {
        console.error('Erreur getAllAdmins:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des admins'
        });
    }
};