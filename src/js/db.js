
let db;
const DB_NAME = "WealthPilot";
const DB_VERSION = 1;

// j'ouvre la base de donnée
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Créer la table 'users'
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('email', 'email', { unique: true });
      }

      // Créer la table 'transactions'
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        transactionsStore.createIndex('userId', 'userId', { unique: false });
        transactionsStore.createIndex('date', 'date', { unique: false });
      }

      // Créer la table 'settings'
      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'userId' });
      }
    };
  });
}

// Ajouter une transaction
function addTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions'], 'readwrite');
    const store = tx.objectStore('transactions');
    const request = store.add(transaction);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Récupérer toutes les transactions d'un utilisateur
function getUserTransactions(userId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['transactions'], 'readonly');
    const store = tx.objectStore('transactions');
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mettre à jour les paramètres utilisateur
function updateUserSettings(settings) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['settings'], 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put(settings);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Exporter les fonctions
export {
  initDB,
  addTransaction,
  getUserTransactions,
  updateUserSettings
};