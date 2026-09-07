export const OBSTACLE_TYPES = [
  {
    type: "bridge",
    label: "Jembatan",
    icon: "═",
    description: "Jembatan yang perlu diperhatikan saat evakuasi.",
  },
  {
    type: "narrow",
    label: "Jalan sempit",
    icon: "⇆",
    description: "Bagian jalan yang sulit dilalui kendaraan.",
  },
  {
    type: "traffic",
    label: "Potensi macet",
    icon: "↔",
    description: "Lokasi yang berpotensi mengalami kepadatan lalu lintas.",
  },
  {
    type: "blocked",
    label: "Jalan tertutup",
    icon: "×",
    description: "Jalan yang dapat atau sedang tertutup.",
  },
  {
    type: "landslide",
    label: "Longsor",
    icon: "⌁",
    description: "Lokasi yang memiliki hambatan atau risiko longsor.",
  },
  {
    type: "flood",
    label: "Genangan / banjir",
    icon: "≈",
    description: "Bagian jalan yang berpotensi tergenang atau banjir.",
  },
  {
    type: "other",
    label: "Rintangan lain",
    icon: "!",
    description: "Hambatan lain yang ingin dicatat.",
  },
];

export function getObstacleType(type) {
  return (
    OBSTACLE_TYPES.find(
      (item) => item.type === type
    ) || OBSTACLE_TYPES[OBSTACLE_TYPES.length - 1]
  );
}