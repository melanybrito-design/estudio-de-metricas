import { emptyStore, type Store } from "../domain/model";
import { validateStore } from "../domain/validation";
const dbName = "estudio-metricas-v1";
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(dbName, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("workspace");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () =>
      reject(new Error("Cierra otras pestañas e inténtalo nuevamente."));
  });
}
export async function loadStore(): Promise<Store> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction("workspace", "readonly");
    const r = t.objectStore("workspace").get("current");
    r.onsuccess = () => {
      try {
        resolve(r.result ? validateStore(r.result) : emptyStore());
      } catch (e) {
        reject(e);
      }
    };
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  });
}
export async function saveStore(data: Store) {
  const db = await open();
  return new Promise<void>((resolve, reject) => {
    const t = db.transaction("workspace", "readwrite");
    t.objectStore("workspace").put(data, "current");
    t.oncomplete = () => {
      db.close();
      resolve();
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
    t.onabort = () => {
      db.close();
      reject(t.error || new Error("No se pudo guardar."));
    };
  });
}
