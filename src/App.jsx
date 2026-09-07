import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { createMap, flyToCoordinates } from "./map/map";
import { loadMitigation, newId, saveMitigation } from "./storage/appState";
import "./App.css";

const MODES = { browse: "browse", route: "route", point: "point", obstacle: "obstacle" };
const pointPresets = ["Rumah", "Sekolah", "Kantor", "Lainnya"];
const obstaclePresets = ["Jalan tertutup", "Banjir", "Longsor", "Kemacetan", "Jalan sempit", "Jembatan bermasalah", "Pohon tumbang", "Lainnya"];
const blankRoute = (number) => ({ id: null, name: `Rute ${number}`, description: "", coordinates: [], visible: true });

export default function App() {
  const mapNode = useRef(null); const mapRef = useRef(null); const vertexMarkers = useRef([]); const modeRef = useRef(MODES.browse);
  const [data, setData] = useState(loadMitigation); const [area, setArea] = useState("map"); const [tool, setTool] = useState("routes");
  const [mode, setMode] = useState(MODES.browse); const [routeDraft, setRouteDraft] = useState(null); const [objectDraft, setObjectDraft] = useState(null);
  const [selected, setSelected] = useState(null); const [layers, setLayers] = useState({ routes: true, points: true, obstacles: true }); const [message, setMessage] = useState("");
  const dataRef = useRef(data); const layersRef = useRef(layers);

  useEffect(() => { saveMitigation(data); }, [data]);
  useEffect(() => { modeRef.current = mode; dataRef.current = data; layersRef.current = layers; }, [mode, data, layers]);
  useEffect(() => {
    const map = createMap(mapNode.current, dataRef.current); mapRef.current = map;
    map.on("load", () => paint(map, dataRef.current, null, layersRef.current));
    map.on("click", (event) => {
      const coordinate = [event.lngLat.lng, event.lngLat.lat];
      if (modeRef.current === MODES.route) setRouteDraft((draft) => draft && { ...draft, coordinates: [...draft.coordinates, coordinate] });
      if (modeRef.current === MODES.point || modeRef.current === MODES.obstacle) setObjectDraft({ kind: modeRef.current, coordinate, name: modeRef.current === MODES.point ? "Titik baru" : "Hambatan baru", category: "" });
    });
    map.on("dblclick", (event) => { event.preventDefault(); if (modeRef.current === MODES.browse) setObjectDraft({ kind: "point", coordinate: [event.lngLat.lng, event.lngLat.lat], name: "Titik baru", category: "" }); });
    return () => { vertexMarkers.current.forEach((marker) => marker.remove()); map.remove(); };
  }, []);
  useEffect(() => { if (mapRef.current?.loaded()) paint(mapRef.current, data, routeDraft, layers); }, [data, routeDraft, layers]);
  useEffect(() => {
    vertexMarkers.current.forEach((marker) => marker.remove()); vertexMarkers.current = [];
    const map = mapRef.current;
    if (!map?.loaded() || mode !== MODES.route || !routeDraft) return undefined;
    vertexMarkers.current = routeDraft.coordinates.map((coordinate, index) => {
      const element = document.createElement("button"); element.className = "route-vertex"; element.setAttribute("aria-label", `Titik jalur ${index + 1}`);
      const marker = new maplibregl.Marker({ element, draggable: true }).setLngLat(coordinate).addTo(map);
      marker.on("dragend", () => { const position = marker.getLngLat(); setRouteDraft((current) => current && ({ ...current, coordinates: current.coordinates.map((item, itemIndex) => itemIndex === index ? [position.lng, position.lat] : item) })); });
      return marker;
    });
    return () => vertexMarkers.current.forEach((marker) => marker.remove());
  }, [mode, routeDraft]);

  function startRoute(route = null) { setArea("mitigation"); setTool("routes"); setObjectDraft(null); setRouteDraft(route ? { ...route, coordinates: [...route.coordinates] } : blankRoute(data.routes.length + 1)); setMode(MODES.route); }
  function saveRoute() {
    if (!routeDraft.name.trim()) return setMessage("Beri nama rute terlebih dahulu.");
    if (routeDraft.coordinates.length < 2) return setMessage("Rute membutuhkan minimal dua titik.");
    const item = { ...routeDraft, id: routeDraft.id || newId("route"), name: routeDraft.name.trim(), updatedAt: new Date().toISOString(), visible: routeDraft.visible !== false };
    setData((current) => ({ ...current, routes: item.id === routeDraft.id && current.routes.some((route) => route.id === item.id) ? current.routes.map((route) => route.id === item.id ? item : route) : [...current.routes, item] }));
    setRouteDraft(null); setMode(MODES.browse); setMessage("Rute tersimpan di peta.");
  }
  function saveObject(form) {
    const key = objectDraft.kind === "point" ? "points" : "obstacles";
    const item = { ...objectDraft, ...form, id: objectDraft.id || newId(objectDraft.kind), visible: true, updatedAt: new Date().toISOString() };
    setData((current) => ({ ...current, [key]: item.id === objectDraft.id && current[key].some((object) => object.id === item.id) ? current[key].map((object) => object.id === item.id ? item : object) : [...current[key], item] }));
    setObjectDraft(null); setMode(MODES.browse); setMessage(`${objectDraft.kind === "point" ? "Titik" : "Hambatan"} tersimpan di peta.`);
  }
  function remove(key, id) { setData((current) => ({ ...current, [key]: current[key].filter((item) => item.id !== id) })); setSelected(null); }
  function toggle(key, id) { setData((current) => ({ ...current, [key]: current[key].map((item) => item.id === id ? { ...item, visible: item.visible === false } : item) })); }
  function cancel() { setRouteDraft(null); setObjectDraft(null); setMode(MODES.browse); }
  const selectedObject = selected && data[selected.key].find((item) => item.id === selected.id);

  return <div className="application">
    <div ref={mapNode} className="map" />
    <header className="topbar"><div className="wordmark"><span>⌁</span><b>mitigasi</b></div><nav aria-label="Navigasi utama"><button className={area === "mitigation" ? "active" : ""} onClick={() => { setArea("mitigation"); setTool("routes"); }}>Mitigasi</button><button className={area === "bag" ? "active" : ""} onClick={() => { cancel(); setArea("bag"); }}>Tas Bencana</button></nav><button className="layers-button" onClick={() => setArea(area === "layers" ? "map" : "layers")}>◫ Layer</button></header>
    <div className="map-actions"><button className="round-button" onClick={() => mapRef.current?.zoomIn()} aria-label="Perbesar peta">+</button><button className="round-button" onClick={() => mapRef.current?.zoomOut()} aria-label="Perkecil peta">−</button></div>
    <aside className="legend" aria-label="Legenda peta"><strong>Legenda</strong><span><i className="route-key" /> Rute</span><span><i className="point-key" /> Titik</span><span><i className="obstacle-key">⚠</i> Hambatan</span></aside>
    {area === "mitigation" && <MitigationPanel tool={tool} setTool={setTool} data={data} mode={mode} routeDraft={routeDraft} onRoute={() => startRoute()} onPoint={() => { setMode(MODES.point); setObjectDraft(null); }} onObstacle={() => { setMode(MODES.obstacle); setObjectDraft(null); }} onEditRoute={startRoute} onEditObject={(key, item) => { setObjectDraft({ ...item, kind: key === "points" ? "point" : "obstacle" }); setMode(MODES.browse); }} onToggle={toggle} onRemove={remove} onSelect={(key, item) => { setSelected({ key, id: item.id }); flyToCoordinates(mapRef.current, item.coordinates || item.coordinate, 16); }} />}
    {area === "bag" && <BagPanel data={data} setData={setData} />}
    {area === "layers" && <section className="floating layers"><p className="kicker">TAMPILAN PETA</p><h2>Layer</h2>{Object.entries({ routes: "Rute", points: "Titik", obstacles: "Hambatan" }).map(([key, label]) => <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => setLayers((current) => ({ ...current, [key]: !current[key] }))} />{label}</label>)}</section>}
    {area === "map" && <section className="welcome"><p className="kicker">PETA MITIGASI PRIBADI</p><h1>Siap untuk<br />menghadapi hari.</h1><p>Tambahkan rute, titik penting, dan hambatan saat Anda membutuhkannya.</p><button onClick={() => { setArea("mitigation"); setTool("routes"); }}>Buka Mitigasi <span>→</span></button></section>}
    {routeDraft && <RouteEditor draft={routeDraft} setDraft={setRouteDraft} onSave={saveRoute} onCancel={cancel} />}
    {objectDraft && <ObjectForm draft={objectDraft} onSave={saveObject} onCancel={cancel} />}
    {selectedObject && <section className="object-popover"><button onClick={() => setSelected(null)}>×</button><p className="kicker">{selected.key === "obstacles" ? "HAMBATAN" : "TITIK"}</p><b>{selectedObject.name}</b>{selectedObject.description && <p>{selectedObject.description}</p>}</section>}
    {message && <div className="toast">{message}<button onClick={() => setMessage("")}>×</button></div>}
  </div>;
}

function MitigationPanel({ tool, setTool, data, mode, routeDraft, onRoute, onPoint, onObstacle, onEditRoute, onEditObject, onToggle, onRemove, onSelect }) {
  const rows = tool === "routes" ? data.routes : data[tool]; const titles = { routes: "Rute", points: "Titik", obstacles: "Hambatan" };
  const create = tool === "routes" ? onRoute : tool === "points" ? onPoint : onObstacle;
  return <aside className="workspace-panel"><p className="kicker">RUANG KERJA</p><h2>Mitigasi</h2><div className="tool-tabs">{Object.entries(titles).map(([key, label]) => <button key={key} className={tool === key ? "active" : ""} onClick={() => setTool(key)}>{label}</button>)}</div><div className="panel-head"><div><h3>{titles[tool]}</h3><p>{tool === "routes" ? "Jalur evakuasi yang Anda gambar sendiri." : tool === "points" ? "Lokasi dan informasi penting." : "Hal yang memengaruhi pergerakan."}</p></div><button className="icon-add" onClick={create} aria-label={`Tambah ${titles[tool]}`}>+</button></div>{mode === "route" && routeDraft && <p className="drawing-hint">Klik peta untuk membuat jalur. Seret titik oranye untuk mengubahnya.</p>} {mode === "point" && <p className="drawing-hint">Klik sebuah lokasi pada peta untuk menambahkan titik.</p>} {mode === "obstacle" && <p className="drawing-hint">Klik lokasi hambatan pada peta.</p>}<div className="object-list">{rows.length ? rows.map((item) => <article key={item.id}><button className="object-name" onClick={() => onSelect(tool, item)}><i>{tool === "routes" ? "━" : tool === "points" ? "●" : "⚠"}</i><span>{item.name}<small>{item.description || (tool === "routes" ? `${item.coordinates.length} titik jalur` : item.category || "Tanpa keterangan")}</small></span></button><div><button onClick={() => onToggle(tool, item.id)}>{item.visible === false ? "Tampilkan" : "Sembunyikan"}</button><button onClick={() => tool === "routes" ? onEditRoute(item) : onEditObject(tool, item)}>Edit</button><button className="delete" onClick={() => onRemove(tool, item.id)}>Hapus</button></div></article>) : <div className="empty">Belum ada {titles[tool].toLowerCase()}. Tambahkan saat Anda siap.</div>}</div></aside>;
}

function RouteEditor({ draft, setDraft, onSave, onCancel }) { return <section className="editor"><p className="kicker">MENGGAMBAR RUTE</p><h2>{draft.id ? "Edit rute" : "Rute baru"}</h2><label>Nama rute<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>Deskripsi <textarea value={draft.description} placeholder="Contoh: menuju titik kumpul" onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><p className="vertex-count"><b>{draft.coordinates.length}</b> titik jalur <button onClick={() => setDraft({ ...draft, coordinates: draft.coordinates.slice(0, -1) })} disabled={!draft.coordinates.length}>Hapus titik terakhir</button></p><div className="form-actions"><button onClick={onCancel}>Batal</button><button className="solid" onClick={onSave}>Simpan rute</button></div></section>; }
function ObjectForm({ draft, onSave, onCancel }) { const [name, setName] = useState(draft.name); const [description, setDescription] = useState(draft.description || ""); const presets = draft.kind === "point" ? pointPresets : obstaclePresets; const label = draft.kind === "point" ? "Titik" : "Hambatan"; return <div className="scrim"><section className="object-form"><p className="kicker">{label.toUpperCase()}</p><h2>{draft.id ? `Edit ${label.toLowerCase()}` : `Tambah ${label.toLowerCase()}`}</h2><div className="presets">{presets.map((preset) => <button key={preset} className={name === preset ? "chosen" : ""} onClick={() => { setName(preset === "Lainnya" ? "" : preset); }}>{preset}</button>)}</div><label>Nama<input autoFocus value={name} placeholder={`Nama ${label.toLowerCase()}`} onChange={(event) => setName(event.target.value)} /></label><label>Keterangan <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Opsional" /></label><div className="form-actions"><button onClick={onCancel}>Batal</button><button className="solid" onClick={() => onSave({ name: name.trim() || `Tanpa nama ${label.toLowerCase()}`, description, category: name })}>Simpan</button></div></section></div>; }
function BagPanel({ data, setData }) { const [name, setName] = useState(""); const items = data.bag || []; return <aside className="bag-panel"><p className="kicker">PERLENGKAPAN PRIBADI</p><h2>Tas Bencana</h2><p>Siapkan yang penting sebelum keadaan darurat datang.</p><form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; setData((current) => ({ ...current, bag: [...(current.bag || []), { id: newId("bag"), name: name.trim(), packed: false }] })); setName(""); }}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tambah barang, mis. air minum" /><button className="solid">Tambah</button></form><div className="bag-list">{items.map((item) => <label key={item.id}><input type="checkbox" checked={item.packed} onChange={() => setData((current) => ({ ...current, bag: current.bag.map((bagItem) => bagItem.id === item.id ? { ...bagItem, packed: !bagItem.packed } : bagItem) }))} /><span>{item.name}</span><button onClick={() => setData((current) => ({ ...current, bag: current.bag.filter((bagItem) => bagItem.id !== item.id) }))}>×</button></label>)}</div></aside>; }

function paint(map, data, draft, visibility) { const collection = { type: "FeatureCollection", features: [] }; if (visibility.routes) [...data.routes, ...(draft ? [draft] : [])].filter((item) => item.visible !== false && item.coordinates.length > 1).forEach((item) => collection.features.push({ type: "Feature", properties: { type: "route", draft: item === draft }, geometry: { type: "LineString", coordinates: item.coordinates } })); if (visibility.points) data.points.filter((item) => item.visible !== false).forEach((item) => collection.features.push({ type: "Feature", properties: { type: "point", name: item.name }, geometry: { type: "Point", coordinates: item.coordinate } })); if (visibility.obstacles) data.obstacles.filter((item) => item.visible !== false).forEach((item) => collection.features.push({ type: "Feature", properties: { type: "obstacle", name: item.name }, geometry: { type: "Point", coordinates: item.coordinate } })); const source = map.getSource("mitigation"); if (source) source.setData(collection); else { map.addSource("mitigation", { type: "geojson", data: collection }); map.addLayer({ id: "routes", type: "line", source: "mitigation", filter: ["==", ["get", "type"], "route"], paint: { "line-color": ["case", ["get", "draft"], "#f47b38", "#1c8775"], "line-width": 5, "line-opacity": .92 } }); map.addLayer({ id: "points", type: "circle", source: "mitigation", filter: ["==", ["get", "type"], "point"], paint: { "circle-radius": 8, "circle-color": "#1c8775", "circle-stroke-color": "#ffffff", "circle-stroke-width": 3 } }); map.addLayer({ id: "obstacles", type: "circle", source: "mitigation", filter: ["==", ["get", "type"], "obstacle"], paint: { "circle-radius": 9, "circle-color": "#e3663c", "circle-stroke-color": "#ffffff", "circle-stroke-width": 3 } }); } }
