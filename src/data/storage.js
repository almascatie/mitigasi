const KEY = "mitigasi-state-v3";

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const EMPTY = {
  location: null,
  routes: [],
  points: [],
  bagItems: [],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const value = JSON.parse(raw);
    return {
      ...EMPTY,
      ...value,
      routes: Array.isArray(value.routes) ? value.routes : [],
      points: Array.isArray(value.points) ? value.points : [],
      bagItems: Array.isArray(value.bagItems) ? value.bagItems : [],
    };
  } catch {
    return EMPTY;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
