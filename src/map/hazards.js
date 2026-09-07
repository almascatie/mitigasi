const HAZARDS = {
  tsunami: {
    id: "hazard-tsunami",
    label: "Tsunami",
    color: "#1976d2",
    url: "/bnpb/server/rest/services/inarisk/layer_bahaya_tsunami_30/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&dpi=192&f=image",
  },
  volcano: {
    id: "hazard-volcano",
    label: "Letusan Gunung Api",
    color: "#e24a2a",
    url: "/bnpb/server/rest/services/inarisk/layer_bahaya_letusan_gunungapi_30/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&dpi=192&f=image",
  },
  earthquake: {
    id: "hazard-earthquake",
    label: "Gempa Bumi",
    color: "#8e24aa",
    url: "/bnpb/server/rest/services/inarisk/layer_bahaya_gempabumi_30/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&dpi=192&f=image",
  },
  flood: {
    id: "hazard-flood",
    label: "Banjir",
    color: "#2196d3",
    url: "/bnpb/server/rest/services/inarisk/layer_bahaya_banjir_30/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512&format=png32&transparent=true&dpi=192&f=image",
  },
};

export function getHazards() {
  return HAZARDS;
}

export function addHazardLayers(map) {
  Object.values(HAZARDS).forEach((hazard) => {
    if (map.getSource(hazard.id)) return;
    map.addSource(hazard.id, {
      type: "raster",
      tiles: [hazard.url],
      tileSize: 512,
      minzoom: 3,
      maxzoom: 18,
    });
    map.addLayer({
      id: hazard.id,
      type: "raster",
      source: hazard.id,
      layout: { visibility: "none" },
      paint: {
        "raster-opacity": 0.42,
        "raster-fade-duration": 0,
        "raster-resampling": "linear",
      },
    });
  });
}

export function setHazardVisibility(map, type, visible) {
  const hazard = HAZARDS[type];
  if (hazard && map?.getLayer(hazard.id)) {
    map.setLayoutProperty(hazard.id, "visibility", visible ? "visible" : "none");
  }
}
