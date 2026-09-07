export default function Sidebar({ page, setPage, state, onSetLocation, onOpenRoute }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div><strong>MITIGASI</strong><span>Peta Evakuasi Kolaboratif</span></div>
      </div>
      <nav className="main-nav">
        <button className={page === "map" ? "active" : ""} onClick={() => setPage("map")}><span className="nav-icon">⌖</span><span>Peta</span></button>
        <button className={page === "routes" ? "active" : ""} onClick={() => setPage("routes")}><span className="nav-icon">↗</span><span>Rute Saya</span><b className="nav-count">{state.routes.length}</b></button>
        <button className={page === "bag" ? "active" : ""} onClick={() => setPage("bag")}><span className="nav-icon">□</span><span>Tas Bencana</span></button>
        <button className={page === "points" ? "active" : ""} onClick={() => setPage("points")}><span className="nav-icon">●</span><span>Titik Saya</span><b className="nav-count">{state.points.length}</b></button>
      </nav>
      <div className="sidebar-section">
        <div className="section-title">LOKASI SAYA</div>
        <button className={`location-card ${state.location ? "" : "empty"}`} onClick={onSetLocation}>
          <span className="location-dot" />
          <div>
            <strong>{state.location ? "Lokasi tersimpan" : "Atur lokasi"}</strong>
            <small>{state.location ? (state.location.source === "gps" ? "Dari perangkat" : "Dipilih manual") : "GPS atau pilih manual"}</small>
          </div>
          <span className="location-arrow">›</span>
        </button>
      </div>
      <div className="sidebar-section routes-preview">
        <div className="section-title">RUTE TERBARU</div>
        {state.routes.slice(-4).reverse().map((route) => (
          <button className="mini-route" key={route.id} onClick={() => onOpenRoute(route)}>
            <span className="route-line-mini" />
            <div><strong>{route.name}</strong><small>{route.coordinates.length} titik jalur</small></div>
          </button>
        ))}
        {!state.routes.length && <p className="muted-note">Belum ada rute. Buat rute pertama dari peta.</p>}
      </div>
      <div className="sidebar-footer">
        <div className="status"><i /> Data tersimpan di perangkat</div>
        <small>Prototype lokal · akun dan sinkronisasi menyusul</small>
      </div>
    </aside>
  );
}
