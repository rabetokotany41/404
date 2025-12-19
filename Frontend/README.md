# Mpanolo-tsaina AI - Frontend

Assistant intelligent de littératie médiatique pour Madagascar - Vérifiez la fiabilité des contenus éducatifs avec l'IA.

## 🚀 Fonctionnalités

### Core Features
- ✅ **Vérification de contenu IA** - Analyse de fiabilité avec modèles spécialisés pour le contexte malgache
- ✅ **Interface multilingue** - Support complet Malagasy/Français/Anglais
- ✅ **Mode hors-ligne** - Cache intelligent et synchronisation en arrière-plan
- ✅ **Dashboard complet** - Historique, statistiques, et gestion des vérifications
- ✅ **Apprentissage intégré** - Modules de formation à la pensée critique
- ✅ **Profil utilisateur** - Gestion des statistiques et progression d'apprentissage
- ✅ **Administration** - Panel d'administration complet pour les gestionnaires

### Technical Features
- 🔄 **PWA (Progressive Web App)** - Installation et fonctionnement hors-ligne
- 💾 **Cache intelligent** - IndexedDB + localForage pour performance optimale
- 🔄 **Synchronisation** - Background Sync API pour synchronisation automatique
- 📱 **Responsive** - Design mobile-first avec Tailwind CSS
- 🎨 **Thème sombre/clair** - Support complet des thèmes
- 🌐 **Multilingue** - Context API pour gestion des langues

## 🛠️ Technologies

- **React 19** - Framework frontend moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Navigation client-side
- **Axios** - Client HTTP avec intercepteurs
- **React Hot Toast** - Notifications utilisateur
- **Workbox** - Service Worker et stratégies de cache
- **IndexedDB** - Base de données client-side
- **localForage** - Wrapper localStorage amélioré
- **Lucide React** - Icônes modernes

## 📦 Installation

### Prérequis
- Node.js 16+
- npm ou yarn
- Backend Mpanolo-tsaina API (voir dossier Backend)

### Installation des dépendances
```bash
cd Frontend
npm install
```

### Variables d'environnement
Créer un fichier `.env` dans le dossier Frontend :

```env
# URL de l'API backend
REACT_APP_API_URL=http://localhost:3000/api

# Configuration PWA
REACT_APP_PWA_ENABLED=true

# Clé Google Analytics (optionnel)
REACT_APP_GA_TRACKING_ID=

# Configuration de développement
REACT_APP_ENV=development
```

### Démarrage en développement
```bash
npm start
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

### Build de production
```bash
npm run build
```

### Tests
```bash
npm test
```

## 🏗️ Architecture

### Structure des dossiers
```
Frontend/
├── public/
│   ├── manifest.json          # Configuration PWA
│   ├── sw.js                  # Service Worker
│   └── assets/                # Images et ressources statiques
├── src/
│   ├── components/            # Composants React
│   │   ├── CheckDashboard.js  # Dashboard principal
│   │   ├── UserProfile.js     # Profil utilisateur
│   │   ├── AdminDashboard.js  # Panel administration
│   │   └── ...
│   ├── contexts/              # Context API
│   │   └── LanguageContext.js # Gestion multilingue
│   ├── hooks/                 # Hooks personnalisés
│   │   ├── useAuth.js         # Authentification
│   │   └── useMessages.js     # Messages
│   ├── services/              # Services et API
│   │   ├── api.js             # Client API principal
│   │   └── offlineCache.js    # Cache hors-ligne
│   └── utils/                 # Utilitaires
├── package.json
└── README.md
```

### Stratégies de cache

#### Service Worker (Workbox)
- **Static Resources**: Cache-First (24h)
- **Pages HTML**: Network-First (1h)
- **API Calls**: Stale-While-Revalidate (30min)
- **External Images**: Cache-First (7j)

#### IndexedDB
- **Vérifications hors-ligne**: Stockage persistant
- **Historique**: Cache avec expiration
- **Modules d'apprentissage**: Synchronisation sélective

#### localForage
- **Préférences utilisateur**: Cache permanent
- **État UI**: Cache temporaire

## 🌐 Internationalisation

### Langues supportées
- **Malagasy (mg)** - Langue principale
- **Français (fr)** - Langue administrative
- **Anglais (en)** - Langue technique

### Ajout d'une nouvelle langue
1. Ajouter les traductions dans `src/contexts/LanguageContext.js`
2. Mettre à jour le manifest.json
3. Tester l'interface dans la nouvelle langue

## 📱 PWA Features

### Installation
L'application peut être installée comme une PWA native sur :
- Android (Chrome)
- iOS (Safari)
- Windows (Edge/Chrome)
- macOS (Safari)

### Mode hors-ligne
- Vérifications basiques sans connexion
- Cache des modules d'apprentissage
- Synchronisation automatique à la reconnexion

### Service Worker
- Mise à jour automatique en arrière-plan
- Gestion des erreurs réseau
- Cache intelligent des ressources

## 🔧 API Integration

### Endpoints principaux
```javascript
// Vérification de contenu
POST /api/check

// Gestion utilisateurs
GET /api/auth/profile
PUT /api/auth/profile

// Modules d'apprentissage
GET /api/learning/modules
POST /api/learning/modules/{id}/complete

// Administration
GET /api/admin/users
GET /api/admin/checks
```

### Gestion d'erreur
- Intercepteurs Axios pour authentification
- Retry automatique pour les erreurs réseau
- Fallback vers cache hors-ligne

## 🎨 UI/UX Design

### Principes
- **Mobile-first** - Design responsive
- **Accessible** - Conformité WCAG 2.1
- **Intuitif** - Navigation simple et claire
- **Contextualisé** - Adapté au contexte malgache

### Composants clés
- **CheckDashboard** - Interface principale de vérification
- **UserProfile** - Gestion du profil et statistiques
- **AdminDashboard** - Panel d'administration
- **LanguageProvider** - Gestion multilingue

## 🚀 Déploiement

### Build optimisé
```bash
npm run build
```

### Variables de production
```env
REACT_APP_API_URL=https://api.mpanolotsaina.mg
REACT_APP_ENV=production
REACT_APP_PWA_ENABLED=true
```

### Serveur recommandé
- Nginx avec configuration PWA
- HTTPS obligatoire pour Service Worker
- Compression GZIP activée

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests E2E (Cypress)
```bash
npm run test:e2e
```

## 📊 Monitoring

### Métriques collectées
- Performance PWA
- Taux de conversion
- Utilisation hors-ligne
- Erreurs JavaScript

### Outils
- Google Analytics
- Sentry (erreurs)
- Performance monitoring

## 🤝 Contribution

### Processus
1. Fork le projet
2. Créer une branche feature
3. Commits atomiques
4. Pull Request avec description

### Standards de code
- ESLint configuration
- Prettier pour formatage
- Tests obligatoires
- Documentation JSDoc

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 👥 Équipe

Développé avec ❤️ pour Madagascar par l'équipe Mpanolo-tsaina AI.

## 📞 Support

- 📧 Email: support@mpanolotsaina.mg
- 📱 Discord: [Lien Discord]
- 🐛 Issues: [GitHub Issues]

---

**Mpanolo-tsaina AI** - Pour une information fiable à Madagascar 🇲🇬

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
