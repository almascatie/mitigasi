import * as maplibregl from "maplibre-gl";
import { addHazardLayers } from "./hazards";

export const INITIAL_CENTER = [117, -2];

export function createMap(container, savedCenter) {
  const map = new maplibregl.Map({
    container,
    style: {
      version: 8,
      sources: {
        satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        },
      },
      layers: [
        {
          id: "satellite-basemap",
          type: "raster",
          source: "satellite",
          paint: {
            "raster-opacity": 1,
            "raster-fade-duration": 0,
            "raster-resampling": "linear",
          },
        },
      ],
    },
    center: savedCenter || INITIAL_CENTER,
    zoom: savedCenter ? 15 : 5,
    minZoom: 3,
    maxZoom: 19,
    attributionControl: true,
    dragRotate: false,
    pitchWithRotate: false,
  });

  map.on("load", () => addHazardLayers(map));
  return map;
}
