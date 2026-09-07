export default function RouteEditor({ editor, setEditor, onFinish, onCancel, onAddPoint, onAddObstacle, activeMode }) {
  return <div className="editor-panel">
    <div className="editor-head"><div><span className="eyebrow">MODE EDIT RUTE</span><h2>{editor.id ? "Edit rute" : "Buat rute baru"}</h2></div><button className="close-button" onClick={onCancel}>×</button></div>
    <label className="field-label">Nama rute<input value={editor.name} onChange={(e) => setEditor((v) => ({ ...v, name: e.target.value }))} placeholder="Contoh: Rute menuju titik aman" autoFocus /></label>
    <div className="editor-status"><strong>{editor.coordinates.length} titik jalur</strong><span>{activeMode === "draw" ? "Klik peta untuk menggambar." : "Pilih alat di bawah."}</span></div>
    <div className="editor-tools">
      <button className={activeMode === "draw" ? "active" : ""} onClick={() => setEditor((v) => ({ ...v, mode: "draw" }))}>↗ Gambar jalur</button>
      <button className={activeMode === "point" ? "active" : ""} onClick={onAddPoint}>＋ Titik informasi</button>
      <button className={activeMode === "obstacle" ? "active" : ""} onClick={onAddObstacle}>! Tambah rintangan</button>
      <button onClick={() => setEditor((v) => ({ ...v, coordinates: v.coordinates.slice(0, -1) }))} disabled={!editor.coordinates.length}>↶ Hapus titik terakhir</button>
    </div>
    <div className="editor-counts"><span>{editor.points.length} titik informasi</span><span>{editor.obstacles.length} rintangan</span></div>
    <div className="editor-actions"><button className="secondary-button" onClick={onCancel}>Batal</button><button className="primary-button" onClick={onFinish}>Simpan rute</button></div>
  </div>;
}
