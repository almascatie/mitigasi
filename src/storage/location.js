const LOCATION_KEY = "mitigasi-user-location-v1";

export function getLocation() {
  try {
    const raw = localStorage.getItem(
      LOCATION_KEY
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocation({
  lng,
  lat,
  source = "manual",
} = {}) {
  if (
    typeof lng !== "number" ||
    typeof lat !== "number"
  ) {
    throw new Error(
      "Koordinat lokasi tidak valid."
    );
  }

  const location = {
    lng,
    lat,
    source,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    LOCATION_KEY,
    JSON.stringify(location)
  );

  return location;
}

export function removeLocation() {
  localStorage.removeItem(LOCATION_KEY);
}

export function hasLocation() {
  return Boolean(getLocation());
}