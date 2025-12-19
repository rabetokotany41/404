# Mpanolo-tsaina AI - Media Literacy Assistant

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io)

Une plateforme d'intelligence artificielle pour la littératie médiatique à Madagascar, supportant le Malagasy, Français et Anglais.

## 🚀 Déploiement avec Docker

### Prérequis

- [Docker](https://docker.com) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (version 2.0+)
- Au moins 4GB RAM disponible
- Au moins 10GB espace disque

### Installation rapide

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd mpanolo-tsaina-ai
   ```

2. **Configuration**
   ```bash
   # Copier le fichier d'environnement
   cp Backend/.env.example Backend/.env

   # Éditer la configuration (obligatoire)
   nano Backend/.env
   ```

3. **Démarrage automatique**
   ```bash
   # Rendre le script exécutable (si nécessaire)
   chmod +x start.sh

   # Lancer tous les services
   ./start.sh
   ```

### Configuration manuelle

Si vous préférez contrôler le processus :

```bash
# Construire et démarrer les services
docker-compose up -d --build

# Ou avec Docker Compose V2
docker compose up -d --build
```

### Services inclus

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | `3000` | Interface utilisateur React |
| **Backend** | `5000` | API REST Node.js/Express |
| **MySQL** | `3306` | Base de données principale |
| **Redis** | `6379` | Cache et sessions |

### Variables d'environnement importantes

Modifier `Backend/.env` :

```env
# Sécurité (CHANGEZ CES VALEURS !)
JWT_SECRET=votre_cle_jwt_super_secrete

# Base de données
DB_HOST=mysql
DB_USER=mpanolo_user
DB_PASSWORD=mpanolo_pass
DB_NAME=L3_L2_L1

# APIs externes
HF_TOKEN=votre_token_huggingface
BYTEZ_API_KEY=votre_cle_bytez
```

## 🛠️ Commandes utiles

### Gestion des conteneurs

```bash
# Voir l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f [nom-service]

# Redémarrer un service
docker-compose restart backend

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Maintenance

```bash
# Mise à jour des images
docker-compose pull

# Reconstruction complète
docker-compose up -d --build --force-recreate

# Nettoyage
docker system prune -a --volumes
```

### Accès aux bases de données

```bash
# MySQL
docker-compose exec mysql mysql -u mpanolo_user -p L3_L2_L1

# Redis
docker-compose exec redis redis-cli
```

## 🔧 Configuration avancée

### Personnalisation des ports

Modifier `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Changer 3000 vers 8080
  backend:
    ports:
      - "4000:5000"  # Changer 5000 vers 4000
```

### Volumes persistants

Les données sont automatiquement persistées dans des volumes Docker :
- `mysql_data` : Base de données MySQL
- `redis_data` : Cache Redis
- `./Backend/uploads` : Fichiers uploadés

### Healthchecks

Tous les services incluent des healthchecks automatiques pour assurer la disponibilité.

## 🚀 Déploiement en production

### Avec Docker Swarm

```bash
# Initialiser le swarm
docker swarm init

# Déployer la stack
docker stack deploy -c docker-compose.yml mpanolo
```

### Avec Kubernetes

Utiliser les manifests Kubernetes dans le dossier `k8s/` (à créer).

### Reverse Proxy (nginx)

Configuration recommandée pour nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Voir quels ports sont utilisés
   netstat -tulpn | grep :3000
   # Changer les ports dans docker-compose.yml
   ```

2. **Mémoire insuffisante**
   ```bash
   # Vérifier la mémoire disponible
   free -h
   # Augmenter la limite Docker si nécessaire
   ```

3. **Base de données non accessible**
   ```bash
   # Vérifier que MySQL est healthy
   docker-compose logs mysql
   # Redémarrer MySQL
   docker-compose restart mysql
   ```

### Logs détaillés

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Logs avec timestamps
docker-compose logs -t backend
```

## 📊 Monitoring

### Métriques disponibles

- **Frontend** : Temps de chargement, erreurs JavaScript
- **Backend** : Requêtes API, temps de réponse, erreurs
- **Base de données** : Connexions, requêtes lentes
- **Cache** : Taux de hit/miss Redis

### Outils recommandés

- **Prometheus** + **Grafana** pour les métriques
- **ELK Stack** pour les logs centralisés
- **Portainer** pour la gestion Docker

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- Équipe Mpanolo-tsaina AI
- Communauté open source
- Gouvernement de Madagascar
- Partenaires éducatifs

---

**Mpanolo-tsaina AI** - *Assistant Intelligent pour la Littératie Médiatique* 🇲🇬