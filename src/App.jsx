import { useEffect, useRef, useState } from "react";
import { createMap } from "./map/map";
import { addRouteToMap, clearRouteLayers } from "./map/routes";
import { addInformationMarker, removeMarkers, buildRouteEditHandles } from "./map/markers";
import { POINT_TYPES, OBSTACLE_TYPES } from "./data/pointTypes";
import { loadState, saveState, uid } from "./data/storage";
import Sidebar from "./components/Sidebar";
import MapToolbar from "./components/MapToolbar";
import MapLegend from "./components/MapLegend";
import HazardControl from "./components/HazardControl";
import PointMenu from "./components/PointMenu";
import ObstacleMenu from "./components/ObstacleMenu";
import LocationSetup from "./components/LocationSetup";
import RouteEditor from "./components/RouteEditor";
import DisasterBag from "./components/DisasterBag";
import "./App.css";

const EMPTY_STATE = { location: null, routes: [], points: [], bagItems: [] };

export default function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const modeRef = useRef(null);
  const draftRef = useRef(null);
  const markerRefs = useRef([]);
  const editMarkersRef = useRef([]);

  const [page, setPage] = useState("map");
  const [state, setState] = useState(() => ({ ...EMPTY_STATE, ...loadState() }));
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [mode, setMode] = useState(null);
  const [pointMenu, setPointMenu] = useState(null);
  const [obstacleMenu, setObstacleMenu] = useState(null);
  const [nameModal, setNameModal] = useState(null);
  const [locationModal, setLocationModal] = useState(false);
  const [manualLocationMode, setManualLocationMode] = useState(false);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { draftRef.current = editor; }, [editor]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = createMap(mapContainerRef.current, state.location?.coordinates);
    mapRef.current = map;
    setMapInstance(map);

    const onLoad = () => {
      mapLoadedRef.current = true;
      renderRoutes(map, state.routes, null);
      renderPoints(map, state.points, null);
    };
    map.on("load", onLoad);

    map.on("click", (event) => {
      const current = modeRef.current;
      if (manualLocationModeRef.current) {
        setLocationFromMap(event.lngLat.lng, event.lngLat.lat);
        return;
      }
      if (current === "draw") {
        setEditor((draft) => draft ? { ...draft, coordinates: [...draft.coordinates, [event.lngLat.lng, event.lngLat.lat]] } : draft);
        return;
      }
      if (current === "point") {
        const p = map.project(event.lngLat);
        setPointMenu({ x: p.x, y: p.y, lng: event.lngLat.lng, lat: event.lngLat.lat });
        setMode("point-menu");
        return;
      }
      if (current === "obstacle") {
        const p = map.project(event.lngLat);
        setObstacleMenu({ x: p.x, y: p.y, lng: event.lngLat.lng, lat: event.lngLat.lat });
        setMode("obstacle-menu");
        return;
      }
      setSelectedRouteId(null);
    });

    map.on("dblclick", (event) => {
      if (modeRef.current || manualLocationModeRef.current) return;
      const p = map.project(event.lngLat);
      setPointMenu({ x: p.x, y: p.y, lng: event.lngLat.lng, lat: event.lngLat.lat });
      setMode("point-menu");
    });

    return () => {
      removeMarkers(markerRefs.current);
      removeMarkers(editMarkersRef.current);
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
  }, []);

  const manualLocationModeRef = useRef(false);
  useEffect(() => { manualLocationModeRef.current = manualLocationMode; }, [manualLocationMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    renderRoutes(map, state.routes, selectedRouteId);
    renderPoints(map, state.points, editor);
  }, [state.routes, state.points, selectedRouteId, editor]);

  useEffect(() => {
    const map = mapRef.current;
    removeMarkers(editMarkersRef.current);
    if (!map || !editor || !["edit", "draw"].includes(mode)) return;
    if (editor.coordinates.length < 1) return;
    editMarkersRef.current = buildRouteEditHandles({
      map,
      coordinates: editor.coordinates,
      routeType: "route",
      onMoveEndpoint: (index, coordinate) => setEditor((v) => ({ ...v, coordinates: v.coordinates.map((p, i) => i === index ? coordinate : p) })),
      onInsertVertex: (index, coordinate) => setEditor((v) => ({ ...v, coordinates: [...v.coordinates.slice(0, index), coordinate, ...v.coordinates.slice(index)] })),
    });
  }, [editor?.coordinates, mode]);

  function renderRoutes(map, routes, selectedId) {
    clearRouteLayers(map);
    routes.forEach((route) => addRouteToMap(map, route, route.id === selectedId, () => setSelectedRouteId(route.id)));
    if (editor?.coordinates?.length >= 2 && (mode === "draw" || mode === "edit")) {
      addRouteToMap(map, { id: "__draft__", name: editor.name || "Rute baru", coordinates: editor.coordinates }, true, () => {});
    }
  }

  function renderPoints(map, points, currentEditor = null) {
    removeMarkers(markerRefs.current);
    points.forEach((point) => {
      const marker = addInformationMarker({ map, point });
      if (marker) markerRefs.current.push(marker);
    });
    const routes = state.routes;
    routes.forEach((route) => {
      [...(route.points || []), ...(route.obstacles || [])].forEach((point) => {
        const marker = addInformationMarker({ map, point });
        if (marker) markerRefs.current.push(marker);
      });
    });
    if (currentEditor) {
      [...(currentEditor.points || []), ...(currentEditor.obstacles || [])].forEach((point) => {
        const marker = addInformationMarker({ map, point });
        if (marker) markerRefs.current.push(marker);
      });
    }
  }

  function beginNewRoute() {
    setPage("map"); setSelectedRouteId(null); setPointMenu(null); setObstacleMenu(null);
    setEditor({ id: null, name: `Rute ${state.routes.length + 1}`, coordinates: [], points: [], obstacles: [] });
    setMode("draw");
  }

  function openEditRoute(route) {
    setPage("map"); setSelectedRouteId(null); setPointMenu(null); setObstacleMenu(null);
    setEditor(JSON.parse(JSON.stringify(route)));
    setMode("edit");
  }

  function cancelEditor() {
    setEditor(null); setMode(null); setPointMenu(null); setObstacleMenu(null);
    removeMarkers(editMarkersRef.current);
    if (mapRef.current && mapLoadedRef.current) renderRoutes(mapRef.current, state.routes, selectedRouteId);
  }

  function saveRoute() {
    if (!editor?.name?.trim()) { alert("Nama rute belum diisi."); return; }
    if (editor.coordinates.length < 2) { alert("Rute harus memiliki minimal dua titik jalur."); return; }
    const clean = { ...editor, name: editor.name.trim(), updatedAt: new Date().toISOString() };
    setState((s) => ({ ...s, routes: editor.id ? s.routes.map((r) => r.id === editor.id ? clean : r) : [...s.routes, { ...clean, id: uid("route"), createdAt: new Date().toISOString() }] }));
    setEditor(null); setMode(null); setSelectedRouteId(null); removeMarkers(editMarkersRef.current);
  }

  function deleteRouteById(id) {
    const route = state.routes.find((r) => r.id === id);
    if (!route) return;
    if (!window.confirm(`Hapus ${route.name}?`)) return;
    setState((s) => ({ ...s, routes: s.routes.filter((r) => r.id !== id) }));
    if (selectedRouteId === id) setSelectedRouteId(null);
  }

  function deleteSelectedRoute() {
    if (selectedRouteId) deleteRouteById(selectedRouteId);
  }

  function addPointTool() { setPointMenu(null); setObstacleMenu(null); setMode("point"); }
  function addObstacleTool() { setPointMenu(null); setObstacleMenu(null); setMode("obstacle"); }

  function choosePointType(item) {
    const pos = pointMenu;
    setPointMenu(null);
    if (!pos) return;
    setNameModal({ kind: "point", item, lng: pos.lng, lat: pos.lat });
  }

  function chooseObstacleType(item) {
    const pos = obstacleMenu;
    setObstacleMenu(null);
    if (!pos) return;
    setNameModal({ kind: "obstacle", item, lng: pos.lng, lat: pos.lat });
  }

  function saveNamedPoint(name) {
    if (!nameModal) return;
    const item = { id: uid(nameModal.kind), type: nameModal.item.type, label: nameModal.item.label, icon: nameModal.item.icon, name: name.trim() || nameModal.item.label, lng: nameModal.lng, lat: nameModal.lat };
    if (editor) {
      setEditor((v) => ({ ...v, [nameModal.kind === "point" ? "points" : "obstacles"]: [...v[nameModal.kind === "point" ? "points" : "obstacles"], item] }));
    } else {
      setState((s) => ({ ...s, points: [...s.points, item] }));
    }
    setNameModal(null); setMode(editor ? "edit" : null);
  }

  function setLocationFromMap(lng, lat) {
    const coordinates = [lng, lat];
    setState((s) => ({ ...s, location: { coordinates, source: "manual" } }));
    setManualLocationMode(false); setLocationModal(false);
    mapRef.current?.flyTo({ center: coordinates, zoom: 16, duration: 900 });
  }

  function useGPS() {
    if (!navigator.geolocation) { alert("Browser tidak mendukung lokasi."); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      const coordinates = [position.coords.longitude, position.coords.latitude];
      setState((s) => ({ ...s, location: { coordinates, source: "gps" } }));
      setLocationModal(false); setManualLocationMode(false);
      mapRef.current?.flyTo({ center: coordinates, zoom: 16, duration: 1000 });
    }, () => alert("Lokasi tidak dapat diakses. Periksa izin lokasi browser."), { enableHighAccuracy: true, timeout: 10000 });
  }

  function chooseManualLocation() { setLocationModal(false); setManualLocationMode(true); setPage("map"); }
  function locateUser() { if (state.location?.coordinates) mapRef.current?.flyTo({ center: state.location.coordinates, zoom: 16, duration: 900 }); else setLocationModal(true); }

  const selectedRoute = state.routes.find((r) => r.id === selectedRouteId) || null;
  const pageContent = page === "routes" ? <RoutesPage routes={state.routes} onNew={beginNewRoute} onEdit={openEditRoute} onDelete={(id) => deleteRouteById(id)} /> : page === "bag" ? <DisasterBag state={state} updateState={setState} /> : page === "points" ? <PointsPage points={state.points} /> : null;

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} state={state} onSetLocation={() => setLocationModal(true)} onOpenRoute={openEditRoute} />
      <main className="workspace">
        {page === "map" ? <div className="map-page">
          <div ref={mapContainerRef} className="map" />
          <MapToolbar selectedRoute={selectedRoute} onNewRoute={beginNewRoute} onEdit={() => openEditRoute(selectedRoute)} onDelete={deleteSelectedRoute} onLocation={locateUser} onCloseSelection={() => setSelectedRouteId(null)} />
          <HazardControl map={mapInstance} />
          <MapLegend />
          {editor && <RouteEditor editor={editor} setEditor={setEditor} activeMode={mode} onFinish={saveRoute} onCancel={cancelEditor} onAddPoint={addPointTool} onAddObstacle={addObstacleTool} />}
          {pointMenu && <PointMenu position={pointMenu} pointTypes={POINT_TYPES} title="Pilih jenis titik" onSelect={choosePointType} onCancel={() => { setPointMenu(null); setMode(editor ? "edit" : null); }} />}
          {obstacleMenu && <ObstacleMenu position={obstacleMenu} types={OBSTACLE_TYPES} onSelect={chooseObstacleType} onCancel={() => { setObstacleMenu(null); setMode(editor ? "edit" : null); }} />}
          {manualLocationMode && <div className="map-hint"><strong>Pilih lokasi</strong> · Klik satu titik pada peta untuk menyimpannya</div>}
          {!editor && !manualLocationMode && <div className="map-hint">Buat rute dari kiri atas, atau double-click peta untuk menambah titik informasi.</div>}
          {editor && !pointMenu && !obstacleMenu && <div className="map-hint"><strong>{mode === "draw" ? "Gambar rute" : "Edit rute"}</strong> · Klik peta untuk menambah belokan.</div>}
        </div> : pageContent}
        {locationModal && <LocationSetup existing={Boolean(state.location)} onGPS={useGPS} onManual={chooseManualLocation} onClose={() => setLocationModal(false)} />}
        {nameModal && <PointNameModal draft={nameModal} onSave={saveNamedPoint} onCancel={() => { setNameModal(null); setMode(editor ? "edit" : null); }} />}
      </main>
    </div>
  );
}

function RoutesPage({ routes, onNew, onEdit, onDelete }) {
  return <section className="page-panel"><div className="page-inner"><div className="page-header"><div><span className="eyebrow">EVAKUASI</span><h1>Rute Saya</h1><p>Buat sebanyak yang diperlukan. Setiap rute berdiri sendiri dan dapat diedit tanpa memengaruhi rute lain.</p></div><button className="primary-button" onClick={onNew}>＋ Buat rute</button></div>{routes.length ? <div className="route-grid">{routes.map((route, index) => <article className="route-card" key={route.id}><div className="route-card-top"><div className="route-number">{index + 1}</div><div><h3>{route.name}</h3><small>{route.coordinates.length} titik jalur</small></div></div><div className="route-meta"><span>{(route.points || []).length} titik informasi</span><span>{(route.obstacles || []).length} rintangan</span></div><div className="card-actions"><button onClick={() => onEdit(route)}>Edit</button><button className="delete" onClick={() => onDelete(route.id)}>Hapus</button></div></article>)}</div> : <div className="empty-state"><h3>Belum ada rute</h3><p>Buat rute pertama dengan menggambar jalur langsung pada peta.</p><button className="primary-button" onClick={onNew}>＋ Buat rute pertama</button></div>}</div></section>;
}

function PointsPage({ points }) {
  return <section className="page-panel"><div className="page-inner"><div className="page-header"><div><span className="eyebrow">KONTEKS LOKAL</span><h1>Titik Saya</h1><p>Titik informasi yang Anda simpan di peta.</p></div></div>{points.length ? <div className="point-list">{points.map((point) => <article className="point-card" key={point.id}><div className="point-icon">{point.icon}</div><div><strong>{point.name}</strong><small>{point.label}</small></div></article>)}</div> : <div className="empty-state"><h3>Belum ada titik</h3><p>Di peta, gunakan alat titik informasi untuk menambahkan lokasi yang penting bagi rencana Anda.</p></div>}</div></section>;
}

function PointNameModal({ draft, onSave, onCancel }) {
  const [name, setName] = useState(draft.item.label);
  return <div className="modal-backdrop"><section className="setup-card point-form"><div className="setup-icon">{draft.item.icon}</div><span className="eyebrow">{draft.kind === "point" ? "TITIK INFORMASI" : "RINTANGAN"}</span><h2>Beri nama</h2><p>Nama ini akan tampil ketika titik dipilih atau dilihat pada daftar.</p><label className="field-label">Nama<input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSave(name)} /></label><div className="editor-actions"><button className="secondary-button" onClick={onCancel}>Batal</button><button className="primary-button" onClick={() => onSave(name)}>Simpan</button></div></section></div>;
}
