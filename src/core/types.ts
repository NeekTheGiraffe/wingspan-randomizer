export const HABITATS = ["forest", "grassland", "wetland"] as const;
export type Habitat = (typeof HABITATS)[number];

export const CRITERIA = [
  "eats-invertebrate",
  "eats-seed",
  "eats-fruit",
  "eats-rodent",
  "eats-fish",
  "beak-pointing-left",
  "beak-pointing-right",
  "bowl-nest",
  "cavity-nest",
  "ground-nest",
  "platform-nest",
  "wingspan-under-50cm",
  "wingspan-at-least-50cm",
] as const;
export type Criterion = (typeof CRITERIA)[number];
