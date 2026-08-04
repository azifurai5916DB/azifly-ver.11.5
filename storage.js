// IndexedDB を使用したセキュアなデータ保存システム
const StorageSystem = (() => {
  const DB_NAME = 'AziflyDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'gamedata';
  let db = null;

  const init = async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB初期化エラー:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        console.log('IndexedDB初期化成功');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const newDB = event.target.result;
        if (!newDB.objectStoreNames.contains(STORE_NAME)) {
          newDB.createObjectStore(STORE_NAME);
          console.log('オブジェクトストア作成完了');
        }
      };
    });
  };

  const saveData = async (data) => {
    if (!db) await init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, 'savedata');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('データ保存成功');
        resolve(data);
      };
    });
  };

  const loadData = async () => {
    if (!db) await init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('savedata');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result;
        console.log('データ読込成功:', data ? 'あり' : 'なし');
        resolve(data || null);
      };
    });
  };

  const deleteData = async () => {
    if (!db) await init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('savedata');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('データ削除成功');
        resolve();
      };
    });
  };

  const migrateFromLocalStorage = async () => {
    const localData = {};
    const keys = [
      'ajifry_bestScore', 'ajifry_coins', 'ajifry_totalCoins', 'ajifry_rubies',
      'ajifry_eqSkin', 'ajifry_skins', 'ajifry_achieves', 'ajifry_challenges',
      'ajifry_worldClassDone', 'ajifry_level', 'ajifry_xp', 'ajifry_levelCap',
      'ajifry_levelCapUnlockCount'
    ];

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        localData[key] = value;
      }
    });

    if (Object.keys(localData).length > 0) {
      await saveData(localData);
      console.log('ローカルストレージからIndexedDBへ移行完了');
      return true;
    }
    return false;
  };

  return {
    init,
    saveData,
    loadData,
    deleteData,
    migrateFromLocalStorage
  };
})();

// ページロード時に初期化
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker登録成功:', registration);
      })
      .catch(error => {
        console.log('Service Worker登録失敗:', error);
      });
  });
}

if (typeof indexedDB !== 'undefined') {
  StorageSystem.init().catch(err => console.error('Storage初期化エラー:', err));
}
