export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue === null ? fallback : JSON.parse(storedValue) as T
  } catch (error) {
    throw new Error(`Could not load saved data for "${key}".`, { cause: error })
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    throw new Error(`Could not save data for "${key}".`, { cause: error })
  }
}
