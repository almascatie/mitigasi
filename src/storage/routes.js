const ROUTES_KEY = "mitigasi-routes-v1";

function createId(prefix = "route") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function readRoutes() {
  try {
    const raw = localStorage.getItem(ROUTES_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRoutes(routes) {
  localStorage.setItem(
    ROUTES_KEY,
    JSON.stringify(routes)
  );
}

export function getRoutes() {
  return readRoutes();
}

export function getRouteById(id) {
  return readRoutes().find(
    (route) => route.id === id
  ) || null;
}

export function createRoute(data = {}) {
  const routes = readRoutes();

  const now = new Date().toISOString();

  const route = {
    id: createId("route"),

    name:
      data.name?.trim() ||
      `Rute ${routes.length + 1}`,

    coordinates: Array.isArray(data.coordinates)
      ? data.coordinates
      : [],

    points: Array.isArray(data.points)
      ? data.points
      : [],

    obstacles: Array.isArray(data.obstacles)
      ? data.obstacles
      : [],

    description:
      data.description?.trim() || "",

    createdAt: now,
    updatedAt: now,
  };

  routes.push(route);

  writeRoutes(routes);

  return route;
}

export function updateRoute(id, changes = {}) {
  const routes = readRoutes();

  const index = routes.findIndex(
    (route) => route.id === id
  );

  if (index === -1) {
    return null;
  }

  const updated = {
    ...routes[index],
    ...changes,
    id: routes[index].id,
    updatedAt: new Date().toISOString(),
  };

  routes[index] = updated;

  writeRoutes(routes);

  return updated;
}

export function deleteRoute(id) {
  const routes = readRoutes();

  const filtered = routes.filter(
    (route) => route.id !== id
  );

  writeRoutes(filtered);

  return filtered.length !== routes.length;
}

export function clearRoutes() {
  localStorage.removeItem(ROUTES_KEY);
}

export function duplicateRoute(id) {
  const original = getRouteById(id);

  if (!original) {
    return null;
  }

  return createRoute({
    name: `${original.name} — salinan`,
    coordinates: original.coordinates,
    points: original.points,
    obstacles: original.obstacles,
    description: original.description,
  });
}