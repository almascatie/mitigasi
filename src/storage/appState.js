const KEY = "mitigasi-app-v4"; const EMPTY = { location: null, routes: [], points: [], bagItems: [] };
export const newId = (prefix) => `${prefix}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
export function loadAppState() { try { const parsed = JSON.parse(localStorage.getItem(KEY)); return { ...EMPTY, ...parsed, routes: Array.isArray(parsed?.routes) ? parsed.routes : [], points: Array.isArray(parsed?.points) ? parsed.points : [], bagItems: Array.isArray(parsed?.bagItems) ? parsed.bagItems : [] }; } catch { return EMPTY; } }
export function saveAppState(value, report) { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (error) { console.error("Storage failure", error); report?.("Data tidak dapat disimpan di perangkat ini."); } }
