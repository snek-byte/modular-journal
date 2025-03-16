import type { Descendant } from "slate"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Local storage functions
export const saveToLocalStorage = (key: string, value: any) => {
  if (!isBrowser) return
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
  } catch (err) {
    console.error("Error saving to localStorage:", err)
  }
}

export const loadFromLocalStorage = (key: string) => {
  if (!isBrowser) return null
  try {
    const serialized = localStorage.getItem(key)
    if (!serialized) return null

    const parsed = JSON.parse(serialized)
    // Validate that we have a proper Slate structure (array of elements)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return null
  } catch (err) {
    console.error("Error loading from localStorage:", err)
    return null
  }
}

// IndexedDB functions for more robust offline storage
export const initIndexedDB = () => {
  if (!isBrowser) return Promise.resolve(null)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("JournalDB", 1)

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains("journals")) {
        db.createObjectStore("journals", { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const saveToIndexedDB = async (id: string, content: Descendant[]) => {
  if (!isBrowser) return null

  try {
    const db = (await initIndexedDB()) as IDBDatabase
    if (!db) return null

    const transaction = db.transaction(["journals"], "readwrite")
    const store = transaction.objectStore("journals")

    return new Promise((resolve, reject) => {
      const request = store.put({ id, content, updatedAt: new Date().toISOString() })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.error("Error saving to IndexedDB:", err)
    return null
  }
}

export const loadFromIndexedDB = async (id: string) => {
  if (!isBrowser) return null

  try {
    const db = (await initIndexedDB()) as IDBDatabase
    if (!db) return null

    const transaction = db.transaction(["journals"], "readonly")
    const store = transaction.objectStore("journals")

    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result?.content || null)
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.error("Error loading from IndexedDB:", err)
    return null
  }
}

