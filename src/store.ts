function createStore() {

  const KEYS = {
    result: 'spectdemo.result',
    state: 'spectdemo.state',
    events: 'spectdemo.events',
    recActive: 'spectdemo.recording.active'
  };

  function read(key: string, fallback: any) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove(key: string) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function openDb() {
    return new Promise<IDBDatabase>(function (resolve, reject) {
      if (!('indexedDB' in window)) return reject(new Error('no-indexeddb'));
      const req = indexedDB.open('spectdemo', 1);
      req.onupgradeneeded = function () {
        const db = req.result;
        if (!db.objectStoreNames.contains('artifacts')) {
          db.createObjectStore('artifacts', { keyPath: 'key' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function dbPut(record: any) {
    return openDb().then(function (db) {
      return new Promise<boolean>(function (resolve, reject) {
        const tx = db.transaction('artifacts', 'readwrite');
        tx.objectStore('artifacts').put(record);
        tx.oncomplete = function () { db.close(); resolve(true); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  function dbGet(key: string) {
    return openDb().then(function (db) {
      return new Promise<any>(function (resolve, reject) {
        const tx = db.transaction('artifacts', 'readonly');
        const req = tx.objectStore('artifacts').get(key);
        req.onsuccess = function () { db.close(); resolve(req.result || null); };
        req.onerror = function () { db.close(); reject(req.error); };
      });
    });
  }

  function dbDelete(key: string) {
    return openDb().then(function (db) {
      return new Promise<boolean>(function (resolve) {
        const tx = db.transaction('artifacts', 'readwrite');
        tx.objectStore('artifacts').delete(key);
        tx.oncomplete = function () { db.close(); resolve(true); };
        tx.onerror = function () { db.close(); resolve(false); };
      });
    });
  }

  const Store = {
    KEYS: KEYS,

    get: function (key: string, fallback?: any) {
      return read(key, fallback === undefined ? null : fallback);
    },

    set: function (key: string, value: any) {
      return write(key, value);
    },

    remove: remove,

    logEvent: function (event: any) {
      const events = read(KEYS.events, []);
      events.push({
        t: Date.now(),
        type: event.type || 'system',
        severity: event.severity || 'low',
        message: event.message || ''
      });
      if (events.length > 600) events.splice(0, events.length - 600);
      write(KEYS.events, events);
    },

    getEvents: function () {
      return read(KEYS.events, []);
    },

    clearEvents: function () {
      remove(KEYS.events);
    },

    resetAttempt: function () {
      remove(KEYS.result);
      remove(KEYS.state);
      remove(KEYS.events);
      remove(KEYS.recActive);
      dbDelete('webcamRecording').catch(function () { /* ignore */ });
    },

    saveRecording: function (blob: any, meta: any) {
      return dbPut({
        key: 'webcamRecording',
        blob: blob,
        meta: meta || {},
        createdAt: Date.now()
      });
    },

    getRecording: function () {
      return dbGet('webcamRecording');
    },

    deleteRecording: function () {
      return dbDelete('webcamRecording');
    },

    withQuery: function (url: string) {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('spectMock')) {
          return url + (url.indexOf('?') === -1 ? '?' : '&') + 'spectMock=1';
        }
      } catch (e) { /* ignore */ }
      return url;
    },

    fmtClock: function (ms: number) {
      const total = Math.max(0, Math.round(ms / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },

    fmtDuration: function (ms: number) {
      const total = Math.max(0, Math.round(ms / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      if (m === 0) return s + 's';
      return m + 'm ' + String(s).padStart(2, '0') + 's';
    },

    pct: function (part: number, whole: number) {
      if (!whole) return 0;
      return Math.round((part / whole) * 100);
    },

    esc: function (value: any) {
      const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return map[c]; });
    }
  };

  return Store;
}

export const Store = createStore();
window.Store = Store;
