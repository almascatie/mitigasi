function feature(route) {
  return {
    type: "Feature",
    properties: { id: route.id, name: route.name },
    geometry: {
      type: "LineString",
      coordinates: route.coordinates || [],
    },
  };
}

export function ensureRouteSource(map, route) {
  const sourceId = `route-${route.id}`;
  if (map.getSource(sourceId)) return sourceId;

  map.addSource(sourceId, {
    type: "geojson",
    data: feature(route),
  });

  map.addLayer({
    id: `${sourceId}-casing`,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#ffffff",
      "line-width": 8,
      "line-opacity": 0.88,
    },
  });

  map.addLayer({
    id: `${sourceId}-line`,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#0d5960",
      "line-width": 4.5,
      "line-opacity": 0.96,
    },
  });

  return sourceId;
}

export function addRouteToMap(map, route, selected, onClick) {
  if (!route?.coordinates || route.coordinates.length < 2) return;
  const sourceId = ensureRouteSource(map, route);
  map.getSource(sourceId)?.setData(feature(route));
  const line = `${sourceId}-line`;
  const casing = `${sourceId}-casing`;
  if (map.getLayer(line)) {
    map.setPaintProperty(line, "line-color", selected ? "#083f45" : "#0d5960");
    map.setPaintProperty(line, "line-width", selected ? 6 : 4.5);
  }
  if (map.getLayer(casing)) {
    map.setPaintProperty(casing, "line-width", selected ? 10 : 8);
  }
  map.on("click", line, onClick);
  map.on("mouseenter", line, () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", line, () => { map.getCanvas().style.cursor = ""; });
}

export function removeRouteFromMap(map, routeId) {
  const id = `route-${routeId}`;
  [`${id}-line`, `${id}-casing`].forEach((layer) => {
    if (map.getLayer(layer)) map.removeLayer(layer);
  });
  if (map.getSource(id)) map.removeSource(id);
}

export function clearRouteLayers(map) {
  if (!map?.getStyle()?.layers) return;
  const layers = map.getStyle().layers.filter((layer) => layer.id.startsWith("route-"));
  layers.reverse().forEach((layer) => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id);
  });
  Object.keys(map.getStyle().sources || {}).forEach((id) => {
    if (id.startsWith("route-") && map.getSource(id)) map.removeSource(id);
  });
}
