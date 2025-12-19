import { openDB } from 'idb';
import localforage from 'localforage';

// Configuration de la base de données IndexedDB
const DB_NAME = 'mpanolotsaina_offline';
const DB_VERSION = 1;

// Configuration de localForage pour le cache localStorage-like
localforage.config({
  name: 'mpanolotsaina_cache',
  storeName: 'keyvaluepairs'
});

// Clés de cache
export const CACHE_KEYS = {
  CHECK_HISTORY: 'check_history',
  LEARNING_MODULES: 'learning_modules',
  USER_STATS: 'user_stats',
  OFFLINE_CHECKS: 'offline_checks',
  CACHED_CONTENT: 'cached_content',
  SYNC_QUEUE: 'sync_queue'
};

// Initialisation de la base de données IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store pour les vérifications hors-ligne
      if (!db.objectStoreNames.contains('offline_checks')) {
        const offlineChecksStore = db.createObjectStore('offline_checks', { keyPath: 'id' });
        offlineChecksStore.createIndex('timestamp', 'timestamp');
        offlineChecksStore.createIndex('synced', 'synced');
      }

      // Store pour le contenu mis en cache
      if (!db.objectStoreNames.contains('cached_content')) {
        const cachedContentStore = db.createObjectStore('cached_content', { keyPath: 'url' });
        cachedContentStore.createIndex('timestamp', 'timestamp');
        cachedContentStore.createIndex('type', 'type');
      }

      // Store pour la file d'attente de synchronisation
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        syncQueueStore.createIndex('type', 'type');
        syncQueueStore.createIndex('timestamp', 'timestamp');
      }

      // Store pour l'historique des vérifications
      if (!db.objectStoreNames.contains('check_history')) {
        const checkHistoryStore = db.createObjectStore('check_history', { keyPath: 'id' });
        checkHistoryStore.createIndex('timestamp', 'timestamp');
        checkHistoryStore.createIndex('reliability_score', 'reliability_score');
      }

      // Store pour les modules d'apprentissage
      if (!db.objectStoreNames.contains('learning_modules')) {
        const learningModulesStore = db.createObjectStore('learning_modules', { keyPath: 'id' });
        learningModulesStore.createIndex('category', 'category');
        learningModulesStore.createIndex('difficulty_level', 'difficulty_level');
      }
    },
  });
};

// Service de cache hors-ligne
export const offlineCache = {
  // Vérifier si nous sommes hors ligne
  isOnline: () => navigator.onLine,

  // Sauvegarder une vérification pour usage hors-ligne
  saveOfflineCheck: async (content, result) => {
    try {
      const db = await initDB();
      const checkData = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        result,
        timestamp: Date.now(),
        synced: false,
        type: 'check'
      };

      await db.add('offline_checks', checkData);

      // Garder seulement les 100 dernières vérifications
      const allChecks = await db.getAll('offline_checks');
      if (allChecks.length > 100) {
        const sortedChecks = allChecks.sort((a, b) => b.timestamp - a.timestamp);
        const toDelete = sortedChecks.slice(100);
        for (const check of toDelete) {
          await db.delete('offline_checks', check.id);
        }
      }

      return checkData;
    } catch (error) {
      console.error('Erreur sauvegarde vérification hors-ligne:', error);
      throw error;
    }
  },

  // Récupérer les vérifications hors-ligne
  getOfflineChecks: async () => {
    try {
      const db = await initDB();
      return await db.getAll('offline_checks');
    } catch (error) {
      console.error('Erreur récupération vérifications hors-ligne:', error);
      return [];
    }
  },

  // Marquer une vérification comme synchronisée
  markCheckSynced: async (checkId) => {
    try {
      const db = await initDB();
      const check = await db.get('offline_checks', checkId);
      if (check) {
        check.synced = true;
        await db.put('offline_checks', check);
      }
    } catch (error) {
      console.error('Erreur marquage synchronisation:', error);
    }
  },

  // Sauvegarder l'historique des vérifications
  saveCheckHistory: async (checks) => {
    try {
      const db = await initDB();
      const tx = db.transaction('check_history', 'readwrite');

      // Vider l'ancien historique
      await tx.store.clear();

      // Ajouter les nouvelles vérifications
      for (const check of checks) {
        await tx.store.add({
          ...check,
          cached_at: Date.now()
        });
      }

      await tx.done;
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  },

  // Récupérer l'historique des vérifications
  getCheckHistory: async () => {
    try {
      const db = await initDB();
      const checks = await db.getAll('check_history');
      return checks.sort((a, b) => new Date(b.analyzed_at) - new Date(a.analyzed_at));
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  },

  // Sauvegarder les modules d'apprentissage
  saveLearningModules: async (modules) => {
    try {
      const db = await initDB();
      const tx = db.transaction('learning_modules', 'readwrite');

      await tx.store.clear();

      for (const module of modules) {
        await tx.store.add({
          ...module,
          cached_at: Date.now()
        });
      }

      await tx.done;
    } catch (error) {
      console.error('Erreur sauvegarde modules:', error);
    }
  },

  // Récupérer les modules d'apprentissage
  getLearningModules: async (category = null) => {
    try {
      const db = await initDB();
      let modules = await db.getAll('learning_modules');

      if (category) {
        modules = modules.filter(module => module.category === category);
      }

      return modules;
    } catch (error) {
      console.error('Erreur récupération modules:', error);
      return [];
    }
  },

  // Mettre en cache du contenu (pages, ressources)
  cacheContent: async (url, content, type = 'page', expiryHours = 24) => {
    try {
      const db = await initDB();
      const cacheData = {
        url,
        content,
        type,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
      };

      await db.put('cached_content', cacheData);
    } catch (error) {
      console.error('Erreur mise en cache contenu:', error);
    }
  },

  // Récupérer du contenu mis en cache
  getCachedContent: async (url) => {
    try {
      const db = await initDB();
      const cached = await db.get('cached_content', url);

      if (cached && Date.now() < cached.expiry) {
        return cached.content;
      } else if (cached) {
        // Supprimer le contenu expiré
        await db.delete('cached_content', url);
      }

      return null;
    } catch (error) {
      console.error('Erreur récupération contenu cache:', error);
      return null;
    }
  },

  // Ajouter à la file d'attente de synchronisation
  addToSyncQueue: async (action, data) => {
    try {
      const db = await initDB();
      const syncItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        data,
        timestamp: Date.now(),
        retries: 0,
        status: 'pending'
      };

      await db.add('sync_queue', syncItem);
      return syncItem.id;
    } catch (error) {
      console.error('Erreur ajout file synchronisation:', error);
      throw error;
    }
  },

  // Récupérer la file d'attente de synchronisation
  getSyncQueue: async () => {
    try {
      const db = await initDB();
      return await db.getAll('sync_queue');
    } catch (error) {
      console.error('Erreur récupération file synchronisation:', error);
      return [];
    }
  },

  // Marquer un élément comme synchronisé
  markSynced: async (syncId) => {
    try {
      const db = await initDB();
      const item = await db.get('sync_queue', syncId);
      if (item) {
        item.status = 'synced';
        await db.put('sync_queue', item);
      }
    } catch (error) {
      console.error('Erreur marquage synchronisé:', error);
    }
  },

  // Nettoyer les données expirées
  cleanup: async () => {
    try {
      const db = await initDB();
      const now = Date.now();

      // Nettoyer le contenu expiré
      const expiredContent = await db.getAll('cached_content');
      for (const item of expiredContent) {
        if (now > item.expiry) {
          await db.delete('cached_content', item.url);
        }
      }

      // Nettoyer les anciennes vérifications hors-ligne synchronisées
      const oldChecks = await db.getAllFromIndex('offline_checks', 'timestamp');
      const syncedOldChecks = oldChecks.filter(check =>
        check.synced && (now - check.timestamp) > (7 * 24 * 60 * 60 * 1000) // 7 jours
      );
      for (const check of syncedOldChecks) {
        await db.delete('offline_checks', check.id);
      }

    } catch (error) {
      console.error('Erreur nettoyage cache:', error);
    }
  },

  // Vider tout le cache
  clearAll: async () => {
    try {
      const db = await initDB();
      const stores = ['offline_checks', 'cached_content', 'sync_queue', 'check_history', 'learning_modules'];

      for (const store of stores) {
        await db.clear(store);
      }

      await localforage.clear();
      console.log('Cache vidé complètement');
    } catch (error) {
      console.error('Erreur vidage cache:', error);
    }
  }
};

// Service de synchronisation en arrière-plan
export const backgroundSync = {
  // Synchroniser les données en attente
  syncPendingData: async () => {
    if (!offlineCache.isOnline()) return;

    try {
      const syncQueue = await offlineCache.getSyncQueue();
      const pendingItems = syncQueue.filter(item => item.status === 'pending');

      for (const item of pendingItems) {
        try {
          // Ici, vous implémenteriez la logique de synchronisation spécifique
          // selon le type d'action (check, feedback, etc.)
          console.log('Synchronisation de:', item.action, item.data);

          // Marquer comme synchronisé après succès
          await offlineCache.markSynced(item.id);
        } catch (error) {
          console.error('Erreur synchronisation item:', item.id, error);
          // Incrémenter le compteur de tentatives
          item.retries = (item.retries || 0) + 1;
          if (item.retries < 3) {
            // Remettre en file d'attente pour une nouvelle tentative
            const db = await initDB();
            await db.put('sync_queue', item);
          }
        }
      }
    } catch (error) {
      console.error('Erreur synchronisation arrière-plan:', error);
    }
  },

  // Programmer la synchronisation périodique
  scheduleSync: () => {
    // Synchroniser immédiatement si en ligne
    if (offlineCache.isOnline()) {
      backgroundSync.syncPendingData();
    }

    // Programmer la synchronisation périodique
    setInterval(() => {
      if (offlineCache.isOnline()) {
        backgroundSync.syncPendingData();
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    // Écouter les changements de statut de connexion
    window.addEventListener('online', () => {
      console.log('Connexion rétablie, synchronisation en cours...');
      backgroundSync.syncPendingData();
    });
  }
};

// Utilitaires de cache localStorage-like avec localForage
export const localCache = {
  set: async (key, value, expiryMinutes = 60) => {
    try {
      const expiry = Date.now() + (expiryMinutes * 60 * 1000);
      const cacheData = {
        value,
        expiry,
        timestamp: Date.now()
      };
      await localforage.setItem(`mpanolotsaina_${key}`, cacheData);
    } catch (error) {
      console.error('Erreur sauvegarde cache local:', error);
    }
  },

  get: async (key) => {
    try {
      const cacheData = await localforage.getItem(`mpanolotsaina_${key}`);
      if (!cacheData) return null;

      if (Date.now() > cacheData.expiry) {
        await localforage.removeItem(`mpanolotsaina_${key}`);
        return null;
      }

      return cacheData.value;
    } catch (error) {
      console.error('Erreur récupération cache local:', error);
      return null;
    }
  },

  remove: async (key) => {
    try {
      await localforage.removeItem(`mpanolotsaina_${key}`);
    } catch (error) {
      console.error('Erreur suppression cache local:', error);
    }
  },

  clear: async () => {
    try {
      const keys = await localforage.keys();
      const cacheKeys = keys.filter(key => key.startsWith('mpanolotsaina_'));
      for (const key of cacheKeys) {
        await localforage.removeItem(key);
      }
    } catch (error) {
      console.error('Erreur vidage cache local:', error);
    }
  }
};

// Hook React pour la gestion du cache hors-ligne
export const useOfflineCache = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = React.useState('idle');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyer périodiquement
    const cleanupInterval = setInterval(() => {
      offlineCache.cleanup();
    }, 60 * 60 * 1000); // Toutes les heures

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(cleanupInterval);
    };
  }, []);

  const syncData = async () => {
    setSyncStatus('syncing');
    try {
      await backgroundSync.syncPendingData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  return {
    isOnline,
    syncStatus,
    syncData,
    cache: offlineCache,
    localCache
  };
};

export default offlineCache;