export default function MapToolbar({ selectedRoute, onNewRoute, onEdit, onDelete, onLocation, onCloseSelection }) {
  return (
    <div className="map-toolbar">
      <button className="tool-button primary" onClick={onNewRoute}>＋ Buat rute</button>
      {selectedRoute && <><button className="tool-button" onClick={onEdit}>✎ Edit</button><button className="tool-button danger" onClick={onDelete}>Hapus</button></>}
      <span className="toolbar-divider" />
      <button className="tool-button subtle" onClick={onLocation}>⌖ Lokasi saya</button>
      {selectedRoute && <button className="tool-button subtle" onClick={onCloseSelection}>Tutup</button>}
    </div>
  );
}
