import { useState } from "react";
import { getHazards, setHazardVisibility } from "../map/hazards";

export default function HazardControl({ map }) {
  const [active, setActive] = useState({});
  const hazards = getHazards();
  function toggle(type) {
    const next = !active[type];
    setHazardVisibility(map, type, next);
    setActive((current) => ({ ...current, [type]: next }));
  }
  return <div className="hazard-control"><div className="control-title">DATA BENCANA</div>{Object.entries(hazards).map(([type, item]) => <button key={type} className={active[type] ? "active" : ""} onClick={() => toggle(type)}><i style={{ background: item.color }} /><span>{item.label}</span>{active[type] && <b>✓</b>}</button>)}</div>;
}
