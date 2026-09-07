const BAG_KEY = "mitigasi-disaster-bag-v1";

const DEFAULT_ITEMS = [
  {
    id: "water",
    name: "Air minum",
    category: "Kebutuhan dasar",
    quantity: 1,
    ready: false,
  },
  {
    id: "medicine",
    name: "Obat pribadi",
    category: "Kesehatan",
    quantity: 1,
    ready: false,
  },
  {
    id: "flashlight",
    name: "Senter",
    category: "Peralatan",
    quantity: 1,
    ready: false,
  },
  {
    id: "powerbank",
    name: "Power bank",
    category: "Peralatan",
    quantity: 1,
    ready: false,
  },
  {
    id: "documents",
    name: "Dokumen penting",
    category: "Dokumen",
    quantity: 1,
    ready: false,
  },
];

function readBag() {
  try {
    const raw = localStorage.getItem(BAG_KEY);

    if (!raw) {
      return DEFAULT_ITEMS.map((item) => ({
        ...item,
      }));
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : DEFAULT_ITEMS.map((item) => ({
          ...item,
        }));
  } catch {
    return DEFAULT_ITEMS.map((item) => ({
      ...item,
    }));
  }
}

function writeBag(items) {
  localStorage.setItem(
    BAG_KEY,
    JSON.stringify(items)
  );
}

export function getBagItems() {
  return readBag();
}

export function addBagItem({
  name,
  category = "Lainnya",
  quantity = 1,
} = {}) {
  const cleanName = name?.trim();

  if (!cleanName) {
    return null;
  }

  const items = readBag();

  const item = {
    id: `bag-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

    name: cleanName,
    category,
    quantity: Number(quantity) || 1,
    ready: false,
  };

  items.push(item);

  writeBag(items);

  return item;
}

export function updateBagItem(
  id,
  changes = {}
) {
  const items = readBag();

  const index = items.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...changes,
  };

  writeBag(items);

  return items[index];
}

export function toggleBagItem(id) {
  const items = readBag();

  const index = items.findIndex(
    (item) => item.id === id
  );

  if (index === -1) {
    return null;
  }

  items[index].ready =
    !items[index].ready;

  writeBag(items);

  return items[index];
}

export function removeBagItem(id) {
  const items = readBag();

  const filtered = items.filter(
    (item) => item.id !== id
  );

  writeBag(filtered);

  return filtered;
}

export function resetBag() {
  const items = DEFAULT_ITEMS.map((item) => ({
    ...item,
  }));

  writeBag(items);

  return items;
}

export function getBagProgress() {
  const items = readBag();

  if (!items.length) {
    return {
      total: 0,
      ready: 0,
      percentage: 0,
    };
  }

  const ready = items.filter(
    (item) => item.ready
  ).length;

  return {
    total: items.length,
    ready,
    percentage: Math.round(
      (ready / items.length) * 100
    ),
  };
}