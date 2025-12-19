const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const crypto = require('crypto');

// Validation pour l'inscription
exports.registerValidation = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('confirmPassword').optional().custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  })
];

// Validation pour la connexion
exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

// Inscription
exports.register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      password,
      languagePreference = 'mg',
      region,
      educationLevel,
      schoolName
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const full_name = `${firstName} ${lastName}`;
    
    const user = await userService.createUser({
      email,
      password_hash: passwordHash,
      full_name,
      phone: phone || null,
      company: company || null,
      position: position || null,
      language_preference: languagePreference,
      region: region || null,
      education_level: educationLevel || null,
      school_name: schoolName || null,
      user_type: 'student'
    });

    // Mettre à jour le dernier login
    await userService.update(user.id, { last_login: new Date() });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour le dernier login
    await userService.update(user.id, { last_login: new Date() });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retirer le mot de passe de la réponse
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// Profil
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      company,
      position,
      languagePreference,
      region,
      educationLevel,
      schoolName,
      receiveAlerts,
      sharePublicData,
      theme
    } = req.body;

    const updates = {};
    
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (position !== undefined) updates.position = position;
    if (languagePreference !== undefined) updates.language_preference = languagePreference;
    if (region !== undefined) updates.region = region;
    if (educationLevel !== undefined) updates.education_level = educationLevel;
    if (schoolName !== undefined) updates.school_name = schoolName;
    if (receiveAlerts !== undefined) updates.receive_alerts = receiveAlerts;
    if (sharePublicData !== undefined) updates.share_public_data = sharePublicData;
    if (theme !== undefined) updates.theme = theme;

    const updatedUser = await userService.update(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
};