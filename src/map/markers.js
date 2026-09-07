import * as maplibregl from "maplibre-gl";

export function removeMarkers(markers = []) {
  markers.forEach((marker) => marker?.remove?.());
  markers.length = 0;
}

export function buildRouteEditHandles({ map, coordinates = [], routeType = "route", onMoveEndpoint, onInsertVertex }) {
  const markers = [];
  if (!map || coordinates.length === 0) return markers;

  [0, coordinates.length - 1].forEach((index) => {
    if (coordinates.length === 1 && index !== 0) return;
    const el = document.createElement("div");
    el.className = `route-edit-handle route-edit-endpoint route-edit-endpoint-${routeType}`;
    el.textContent = index === 0 ? "A" : "B";
    el.title = index === 0 ? "Titik awal" : "Titik akhir";
    const marker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(coordinates[index]).addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      onMoveEndpoint?.(index, [p.lng, p.lat]);
    });
    el.style.zIndex = "30";
    markers.push(marker);
  });

  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const a = coordinates[i];
    const b = coordinates[i + 1];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const el = document.createElement("div");
    el.className = `route-edit-handle route-edit-midpoint route-edit-midpoint-${routeType}`;
    el.textContent = "+";
    el.title = "Tarik untuk membuat belokan";
    const marker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(mid).addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      onInsertVertex?.(i + 1, [p.lng, p.lat]);
    });
    el.style.zIndex = "30";
    markers.push(marker);
  }
  return markers;
}

export function addInformationMarker({ map, point }) {
  if (!map || !point) return null;
  const el = document.createElement("div");
  el.className = `information-marker information-marker-${point.type || "other"}`;
  el.textContent = point.icon || "•";
  el.title = point.name || point.label || "Titik";
  el.style.zIndex = "20";
  return new maplibregl.Marker({ element: el, anchor: "center" })
    .setLngLat([Number(point.lng), Number(point.lat)])
    .addTo(map);
}
