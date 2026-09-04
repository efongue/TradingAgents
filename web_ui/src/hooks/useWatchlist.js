import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tradingagents_watchlist";
const DEFAULT_WATCHLIST = [];

let memoryWatchlist = null;
const listeners = new Set();

export function getStoredWatchlist() {
  if (memoryWatchlist !== null) return memoryWatchlist;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryWatchlist = parsed.map((item) => {
          if (typeof item === "string") {
            return { symbol: item.toUpperCase(), ticker: item.toUpperCase(), added_at: new Date().toISOString().slice(0, 10), last_decision: "À analyser" };
          }
          const sym = (item.symbol || item.ticker || "").toUpperCase();
          return {
            ...item,
            symbol: sym,
            ticker: sym,
            added_at: item.added_at || new Date().toISOString().slice(0, 10),
            last_decision: item.last_decision || "À analyser",
          };
        });
        return memoryWatchlist;
      }
    }
  } catch {
    // fallback
  }
  memoryWatchlist = DEFAULT_WATCHLIST;
  return memoryWatchlist;
}

export function saveStoredWatchlist(items) {
  memoryWatchlist = items;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // ignore
  }
  listeners.forEach((listener) => {
    try { listener(memoryWatchlist); } catch {}
  });
  if (typeof window !== "undefined") {
    try { window.dispatchEvent(new Event("watchlist_changed")); } catch {}
  }
}

export function isInWatchlist(symbol) {
  if (!symbol) return false;
  const list = getStoredWatchlist();
  const upper = symbol.trim().toUpperCase();
  return list.some((item) => (item.symbol || item.ticker || "").toUpperCase() === upper);
}

export function addToWatchlist(symbol, note = "") {
  if (!symbol) return getStoredWatchlist();
  const list = getStoredWatchlist();
  const upper = symbol.trim().toUpperCase();
  if (list.some((item) => (item.symbol || item.ticker || "").toUpperCase() === upper)) {
    return list;
  }
  const updated = [
    {
      symbol: upper,
      ticker: upper,
      added_at: new Date().toISOString().slice(0, 10),
      note,
      last_decision: "À analyser",
    },
    ...list,
  ];
  saveStoredWatchlist(updated);
  return updated;
}

export function removeFromWatchlist(symbol) {
  if (!symbol) return getStoredWatchlist();
  const list = getStoredWatchlist();
  const upper = symbol.trim().toUpperCase();
  const updated = list.filter((item) => (item.symbol || item.ticker || "").toUpperCase() !== upper);
  saveStoredWatchlist(updated);
  return updated;
}

export function toggleWatchlist(symbol, note = "") {
  if (!symbol) return { updated: getStoredWatchlist(), added: false };
  const inList = isInWatchlist(symbol);
  if (inList) {
    const updated = removeFromWatchlist(symbol);
    return { updated, added: false };
  } else {
    const updated = addToWatchlist(symbol, note);
    return { updated, added: true };
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => getStoredWatchlist());

  useEffect(() => {
    const handleChange = (newList) => setWatchlist([...newList]);
    listeners.add(handleChange);
    return () => listeners.delete(handleChange);
  }, []);

  const isBookmarked = useCallback((symbol) => isInWatchlist(symbol), [watchlist]);
  const toggle = useCallback((symbol, note) => toggleWatchlist(symbol, note), []);
  const add = useCallback((symbol, note) => addToWatchlist(symbol, note), []);
  const remove = useCallback((symbol) => removeFromWatchlist(symbol), []);

  return {
    watchlist,
    items: watchlist,
    isInWatchlist: isBookmarked,
    toggleWatchlist: toggle,
    addToWatchlist: add,
    removeFromWatchlist: remove,
  };
}

export default useWatchlist;
