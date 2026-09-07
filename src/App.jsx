import { useEffect, useRef, useState } from "react";
import { createMap, flyToCoordinates } from "./map/map";
import { renderRoutes, clearRouteLayers } from "./map/routes";
import { renderMarkers, clearMarkers, createVertexMarkers } from "./map/markers";
import { BNPB_LAYERS, toggleBnpbLayer } from "./map/bnpbLayers";
import { POINT_TYPES } from "./data/pointTypes";
import { OBSTACLE_TYPES } from "./data/obstacleTypes";
import { loadAppState, saveAppState, newId } from "./storage/appState";
import Sidebar from "./components/Sidebar";
import RouteEditor from "./components/RouteEditor";
import RouteManager from "./components/RouteManager";
import PointMenu from "./components/PointMenu";
import ObstacleMenu from "./components/ObstacleMenu";
import DisasterBag from "./components/DisasterBag";
import HazardControl from "./components/HazardControl";
import "./App.css";

const MODES = { NORMAL: "normal", DRAW_ROUTE: "draw-route", EDIT_ROUTE: "edit-route", PLACE_POINT: "place-point", PLACE_OBSTACLE: "place-obstacle", PICK_LOCATION: "pick-location" };
const emptyDraft = (number) => ({ id: null, name: `Rute ${number}`, description: "", geometry: { type: "LineString", coordinates: [] }, points: [], obstacles: [], status: "draft" });

export default function App() {
  const containerRef = useRef(null); const mapRef = useRef(null); const markersRef = useRef([]); const vertexRef = useRef([]);
  const modeRef = useRef(MODES.NORMAL); const draftRef = useRef(null); const stateRef = useRef(null);
  const [app, setApp] = useState(loadAppState); const [tab, setTab] = useState("map"); const [mode, setMode] = useState(MODES.NORMAL);
  const [draft, setDraft] = useState(null); const [selectedRouteId, setSelectedRouteId] = useState(null); const [menu, setMenu] = useState(null);
  const [mapStatus, setMapStatus] = useState("loading"); const [notice, setNotice] = useState(""); const [layers, setLayers] = useState({});
  useEffect(() => { stateRef.current = app; saveAppState(app, setNotice); }, [app]);
  useEffect(() => { modeRef.current = mode; draftRef.current = draft; }, [mode, draft]);

  useEffect(() => {
    let map;
    try { map = createMap(containerRef.current, app.location); mapRef.current = map; } catch (error) { setMapStatus("error"); setNotice(`Peta tidak dapat dibuat: ${error.message}`); return undefined; }
    const refresh = () => {
      renderRoutes(map, stateRef.current.routes, draftRef.current, selectedRouteId, (id) => { setSelectedRouteId(id); setTab("routes"); });
      clearMarkers(markersRef.current); markersRef.current = renderMarkers(map, stateRef.current.points, stateRef.current.routes, draftRef.current);
    };
    map.on("load", () => { setMapStatus("ready"); refresh(); });
    map.on("error", (event) => { console.error("MapLibre error", event.error); if (!map.loaded()) { setMapStatus("error"); setNotice("Peta gagal dimuat. Periksa koneksi internet lalu muat ulang."); } });
    map.on("click", (event) => {
      const current = modeRef.current; const coordinate = [event.lngLat.lng, event.lngLat.lat];
      if (current === MODES.DRAW_ROUTE || current === MODES.EDIT_ROUTE) { setDraft((value) => value && ({ ...value, geometry: { ...value.geometry, coordinates: [...value.geometry.coordinates, coordinate] } })); return; }
      if (current === MODES.PICK_LOCATION) { saveLocation(coordinate, "manual"); return; }
      if (current === MODES.PLACE_POINT || current === MODES.PLACE_OBSTACLE) openMenu(current === MODES.PLACE_POINT ? "point" : "obstacle", coordinate);
    });
    map.on("dblclick", (event) => { event.preventDefault(); if (modeRef.current === MODES.NORMAL) openMenu("point", [event.lngLat.lng, event.lngLat.lat]); });
    function openMenu(kind, coordinate) { const p = map.project(coordinate); setMenu({ kind, coordinate, x: p.x, y: p.y }); }
    return () => { clearMarkers(markersRef.current); clearMarkers(vertexRef.current); clearRouteLayers(map); map.remove(); };
  }, []);
  useEffect(() => {
    const map = mapRef.current; if (!map?.loaded()) return;
    renderRoutes(map, app.routes, draft, selectedRouteId, (id) => { setSelectedRouteId(id); setTab("routes"); });
    clearMarkers(markersRef.current); markersRef.current = renderMarkers(map, app.points, app.routes, draft);
  }, [app.routes, app.points, draft, selectedRouteId]);
  useEffect(() => {
    const map = mapRef.current; clearMarkers(vertexRef.current); if (!map || !draft || ![MODES.DRAW_ROUTE, MODES.EDIT_ROUTE].includes(mode)) return;
    vertexRef.current = createVertexMarkers(map, draft.geometry.coordinates, (index, coordinate) => setDraft((value) => ({ ...value, geometry: { ...value.geometry, coordinates: value.geometry.coordinates.map((item, i) => i === index ? coordinate : item) } })), (index) => setDraft((value) => ({ ...value, geometry: { ...value.geometry, coordinates: value.geometry.coordinates.filter((_, i) => i !== index) } })));
  }, [draft?.geometry.coordinates, mode]);

  function beginRoute() { setTab("map"); setSelectedRouteId(null); setMenu(null); setDraft(emptyDraft(app.routes.length + 1)); setMode(MODES.DRAW_ROUTE); }
  function editRoute(route) { setTab("map"); setSelectedRouteId(route.id); setDraft(structuredClone(route)); setMode(MODES.EDIT_ROUTE); }
  function cancelRoute() { setDraft(null); setMenu(null); setMode(MODES.NORMAL); }
  function saveRoute() {
    if (!draft.name.trim()) return setNotice("Nama rute wajib diisi sebelum disimpan.");
    if (draft.geometry.coordinates.length < 2) return setNotice("Rute memerlukan minimal dua titik jalur.");
    const now = new Date().toISOString(); const route = { ...draft, name: draft.name.trim(), status: "active", visible: draft.visible !== false, updated_at: now, created_at: draft.created_at || now, id: draft.id || newId("route") };
    setApp((value) => ({ ...value, routes: draft.id ? value.routes.map((item) => item.id === draft.id ? route : item) : [...value.routes, route] })); setSelectedRouteId(route.id); setDraft(null); setMode(MODES.NORMAL); setNotice("Rute tersimpan di perangkat ini.");
  }
  function saveLocation(coordinates, source) { const location = { longitude: coordinates[0], latitude: coordinates[1], source, timestamp: new Date().toISOString() }; setApp((value) => ({ ...value, location })); flyToCoordinates(mapRef.current, coordinates, 15); setMode(MODES.NORMAL); setNotice("Lokasi awal tersimpan."); }
  function useGps() { if (!navigator.geolocation) return setNotice("Geolokasi tidak tersedia pada browser ini."); navigator.geolocation.getCurrentPosition((position) => saveLocation([position.coords.longitude, position.coords.latitude], "gps"), (error) => setNotice(error.code === 1 ? "Izin lokasi ditolak. Pilih lokasi manual di peta." : "Lokasi tidak tersedia. Coba lagi atau pilih manual."), { enableHighAccuracy: true, timeout: 10000 }); }
  function chooseType(type) { const typeData = (menu.kind === "point" ? POINT_TYPES : OBSTACLE_TYPES).find((item) => item.key === type); const object = { id: newId(menu.kind), type: typeData.key, icon: typeData.icon, name: typeData.label, description: "", location: menu.coordinate, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; setMenu({ ...menu, form: object }); }
  function saveObject(form) { const object = { ...menu.form, ...form, updated_at: new Date().toISOString() }; if (draft) setDraft((value) => ({ ...value, [menu.kind === "point" ? "points" : "obstacles"]: [...value[menu.kind === "point" ? "points" : "obstacles"], object] })); else setApp((value) => ({ ...value, points: [...value.points, object] })); setMenu(null); setMode(draft ? MODES.EDIT_ROUTE : MODES.NORMAL); }
  function toggleLayer(layer) { const enabled = !layers[layer.key]; try { toggleBnpbLayer(mapRef.current, layer, enabled, (message) => setNotice(message)); setLayers((value) => ({ ...value, [layer.key]: enabled })); } catch (error) { console.error("BNPB layer error", error); setNotice(`Layer ${layer.label} gagal diaktifkan: ${error.message}`); } }
  const selected = app.routes.find((route) => route.id === selectedRouteId);
  return <div className="app-shell"><Sidebar tab={tab} setTab={setTab} counts={{ routes: app.routes.length, points: app.points.length }} onLocation={() => setMode(MODES.PICK_LOCATION)} />
    <main className="workspace"><div ref={containerRef} className="map" />{mapStatus !== "ready" && <div className="map-state">{mapStatus === "loading" ? "Memuat peta Indonesia…" : "Peta tidak tersedia. Periksa koneksi lalu muat ulang."}</div>}
      <div className="map-toolbar"><button className="primary-button" onClick={beginRoute}>＋ Buat rute</button><button className="secondary-button" onClick={useGps}>⌖ GPS</button><button className="secondary-button" onClick={() => { setTab("layers"); }}>◫ Layer</button></div>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      {draft && <RouteEditor draft={draft} setDraft={setDraft} mode={mode} onDraw={() => setMode(draft.id ? MODES.EDIT_ROUTE : MODES.DRAW_ROUTE)} onPoint={() => setMode(MODES.PLACE_POINT)} onObstacle={() => setMode(MODES.PLACE_OBSTACLE)} onSave={saveRoute} onCancel={cancelRoute} />}
      {menu && !menu.form && (menu.kind === "point" ? <PointMenu position={menu} types={POINT_TYPES} onSelect={chooseType} onCancel={() => { setMenu(null); setMode(draft ? MODES.EDIT_ROUTE : MODES.NORMAL); }} /> : <ObstacleMenu position={menu} types={OBSTACLE_TYPES} onSelect={chooseType} onCancel={() => setMenu(null)} />)}
      {menu?.form && <ObjectForm item={menu.form} onSave={saveObject} onCancel={() => setMenu(null)} />}
      <aside className="context-panel">{tab === "routes" && <RouteManager routes={app.routes} selectedRouteId={selectedRouteId} onCreate={beginRoute} onSelect={(route) => { setSelectedRouteId(route.id); flyToCoordinates(mapRef.current, route.geometry.coordinates[0], 14); }} onEdit={editRoute} onToggle={(route) => setApp((value) => ({ ...value, routes: value.routes.map((item) => item.id === route.id ? { ...item, visible: item.visible === false } : item) }))} onDelete={(route) => setApp((value) => ({ ...value, routes: value.routes.filter((item) => item.id !== route.id) }))} />}{tab === "points" && <PointList points={app.points} />}{tab === "bag" && <DisasterBag items={app.bagItems} setItems={(bagItems) => setApp((value) => ({ ...value, bagItems }))} />}{tab === "layers" && <HazardControl layers={BNPB_LAYERS} active={layers} onToggle={toggleLayer} />}{tab === "map" && <MapIntro mode={mode} location={app.location} selected={selected} />}</aside>
    </main></div>;
}
function MapIntro({ mode, location, selected }) { return <section><span className="eyebrow">RUANG KERJA PETA</span><h1>MITIGASI</h1><p>{mode === MODES.PICK_LOCATION ? "Klik peta untuk menyimpan lokasi awal manual." : selected ? `Rute terpilih: ${selected.name}` : "Klik dua kali peta untuk menambah titik informasi. Semua rute digambar manual."}</p>{location && <small>Lokasi awal: {location.source === "gps" ? "GPS" : "manual"} · tersimpan</small>}<div className="legend"><b>Legenda</b><span>━━ Rute Anda</span><span>● Titik informasi</span><span>⚠ Hambatan</span></div></section>; }
function PointList({ points }) { return <section><span className="eyebrow">TITIK SAYA</span><h2>Titik informasi</h2>{points.length ? points.map((point) => <article className="list-card" key={point.id}><b>{point.icon} {point.name}</b><small>{point.type}</small></article>) : <p>Belum ada titik. Double-click peta saat mode normal untuk membuatnya.</p>}</section>; }
function ObjectForm({ item, onSave, onCancel }) { const [name, setName] = useState(item.name); const [description, setDescription] = useState(""); return <div className="modal"><section><span className="eyebrow">{item.icon} TITIK BARU</span><h2>Lengkapi informasi</h2><label>Nama<input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></label><label>Deskripsi (opsional)<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label><div><button className="secondary-button" onClick={onCancel}>Batal</button><button className="primary-button" onClick={() => onSave({ name: name.trim() || item.name, description })}>Simpan</button></div></section></div>; }
