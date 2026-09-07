export default function ObstacleMenu({ position, types, onSelect, onCancel }) {
  if (!position) return null;
  return (
    <div className="point-menu" style={{ left: position.x, top: position.y }}>
      <div className="point-menu-head"><strong>Jenis rintangan</strong><button onClick={onCancel}>×</button></div>
      <p>Tambahkan kondisi yang perlu diperhatikan pada jalur.</p>
      <div className="point-grid">
        {types.map((item) => <button key={item.type} onClick={() => onSelect(item)}><span>{item.icon}</span>{item.label}</button>)}
      </div>
    </div>
  );
}
