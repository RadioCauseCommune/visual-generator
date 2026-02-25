
import { useEffect } from 'react';
import { AssetType, Layer } from '../types';

const DB_NAME = 'cc-studio-db';
const STORE_NAME = 'persistence';
const KEY = 'work-in-progress';

// Aide pour IndexedDB car c'est asynchrone contrairement à localStorage
const getFromIDB = () => {
    return new Promise<any>((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(KEY);
            getReq.onsuccess = () => resolve(getReq.result);
            getReq.onerror = () => resolve(null);
        };
        request.onerror = () => resolve(null);
    });
};

const saveToIDB = (data: any) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data, KEY);
    };
};

export const usePersistence = (
    assetType: AssetType,
    layers: Layer[],
    meta: any,
    setAssetType: (t: AssetType) => void,
    setLayers: (l: Layer[]) => void,
    setMeta: (m: any) => void
) => {
    // Persistence: Charger au démarrage
    useEffect(() => {
        const load = async () => {
            // Tenter d'abord IndexedDB (nouvelle version)
            let saved = await getFromIDB();

            // Fallback sur localStorage pour la transition
            if (!saved) {
                const legacy = localStorage.getItem('cc-studio-work-in-progress');
                if (legacy) {
                    try {
                        saved = JSON.parse(legacy);
                        // Transférer vers IDB pour les prochaines fois
                        saveToIDB(saved);
                    } catch (e) { }
                }
            }

            if (saved) {
                try {
                    setLayers(saved.layers);
                    setMeta(saved.meta);
                    setAssetType(saved.assetType);
                } catch (e) {
                    console.error("Erreur lors de la restauration de la sauvegarde auto", e);
                }
            }
        };
        load();
    }, []); // Only once at mount

    // Persistence: Sauvegarder à chaque changement
    useEffect(() => {
        const timer = setTimeout(() => {
            saveToIDB({ layers, meta, assetType });
        }, 1000);
        return () => clearTimeout(timer);
    }, [layers, meta, assetType]);
};
