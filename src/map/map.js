import * as maplibregl from "maplibre-gl";

export const INDONESIA_VIEW = {
  center: [117, -2],
  zoom: 5,
};

export const BASEMAP = {
  attribution:
    "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  tiles: [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  ],
};

export function createMap(container, savedLocation) {
  const center = savedLocation
    ? [savedLocation.longitude, savedLocation.latitude]
    : INDONESIA_VIEW.center;

  const zoom = savedLocation
    ? 15
    : INDONESIA_VIEW.zoom;

  const map = new maplibregl.Map({
    container,

    center,

    zoom,

    attributionControl: true,

    dragRotate: false,

    pitchWithRotate: false,

    doubleClickZoom: false,

    style: {
      version: 8,

      sources: {
        basemap: {
          type: "raster",

          tiles: BASEMAP.tiles,

          tileSize: 256,

          attribution: BASEMAP.attribution,
        },
      },

      layers: [
        {
          id: "basemap",

          type: "raster",

          source: "basemap",
        },
      ],
    },
  });

  map.addControl(
    new maplibregl.NavigationControl(),
    "bottom-right"
  );

  return map;
}

export function flyToCoordinates(
  map,
  coordinates,
  zoom = 15
) {
  if (!map || !coordinates) {
    return;
  }

  map.flyTo({
    center: coordinates,

    zoom,

    essential: true,
  });
}