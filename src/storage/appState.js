const KEY = "mitigasi-map-v1";
const empty = { routes: [], points: [], obstacles: [], bag: [], location: null };
export const newId = (prefix) => `${prefix}-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
export function loadMitigation() { try { const value = JSON.parse(localStorage.getItem(KEY)); return { ...empty, ...value, routes: Array.isArray(value?.routes) ? value.routes : [], points: Array.isArray(value?.points) ? value.points : [], obstacles: Array.isArray(value?.obstacles) ? value.obstacles : [], bag: Array.isArray(value?.bag) ? value.bag : [] }; } catch { return empty; } }
export function saveMitigation(value) { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (error) { console.error("Unable to save mitigation data", error); } }
