import { useMemo, useState } from "react";
import { uid } from "../data/storage";

const DEFAULT = [
  { name: "Air minum", category: "Air & makanan", quantity: 1, ready: false },
  { name: "Obat pribadi", category: "Kesehatan", quantity: 1, ready: false },
  { name: "Senter", category: "Peralatan", quantity: 1, ready: false },
  { name: "Power bank", category: "Komunikasi", quantity: 1, ready: false },
  { name: "Dokumen penting", category: "Dokumen", quantity: 1, ready: false },
];

export default function DisasterBag({ state, updateState }) {
  const items = state.bagItems.length ? state.bagItems : DEFAULT;
  const [draft, setDraft] = useState("");
  const done = useMemo(() => items.filter((x) => x.ready).length, [items]);
  function toggle(index) { updateState((s) => ({ ...s, bagItems: items.map((x, i) => i === index ? { ...x, ready: !x.ready } : x) })); }
  function add() { if (!draft.trim()) return; updateState((s) => ({ ...s, bagItems: [...items, { id: uid("bag"), name: draft.trim(), category: "Lainnya", quantity: 1, ready: false }] })); setDraft(""); }
  return <section className="page-panel"><div className="page-inner"><div className="page-header"><div><span className="eyebrow">KESIAPSIAGAAN</span><h1>Tas Bencana</h1><p>Daftar perlengkapan yang ingin Anda siapkan sebelum keadaan darurat.</p></div><div className="bag-progress"><strong>{done}/{items.length}</strong><span>siap</span></div></div><div className="progress-bar"><span style={{ width: `${items.length ? done / items.length * 100 : 0}%` }} /></div><div className="bag-list">{items.map((item, index) => <label className={`bag-item ${item.ready ? "ready" : ""}`} key={item.id || `${item.name}-${index}`}><input type="checkbox" checked={item.ready} onChange={() => toggle(index)} /><span className="bag-check">✓</span><div><strong>{item.name}</strong><small>{item.category} · jumlah {item.quantity}</small></div></label>)}</div><div className="bag-add"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Tambah perlengkapan lain…" /><button className="primary-button" onClick={add}>Tambah</button></div></div></section>;
}
