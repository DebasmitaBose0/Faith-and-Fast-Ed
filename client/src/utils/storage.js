export const safeGetItem = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw;
  } catch {
    return null;
  }
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn(`[storage] localStorage quota exceeded for key "${key}"`);
    }
    return false;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const safeGetJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const safeSetJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn(`[storage] localStorage quota exceeded for key "${key}"`);
    }
    return false;
  }
};
