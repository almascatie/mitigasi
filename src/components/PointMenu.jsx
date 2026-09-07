export default function PointMenu({ position, pointTypes, title, onSelect, onCancel }) {
  if (!position) return null;
  return (
    <div className="point-menu" style={{ left: position.x, top: position.y }}>
      <div className="point-menu-head"><strong>{title}</strong><button onClick={onCancel}>×</button></div>
      <p>Pilih ikon yang sesuai.</p>
      <div className="point-grid">
        {pointTypes.map((item) => <button key={item.type} onClick={() => onSelect(item)}><span>{item.icon}</span>{item.label}</button>)}
      </div>
    </div>
  );
}
