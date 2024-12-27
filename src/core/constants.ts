import { Habitat, Criterion } from "./types";

export const NUM_ROWS = 6;
export const SPACES_PER_ROW = 6;
export const NUM_SPACES = 36;

export const CRITERIA_BY_HABITAT: Record<Habitat, Criterion[]> = {
  forest: [
    "bowl-nest",
    "bowl-nest",
    "cavity-nest",
    "cavity-nest",
    "platform-nest",
    "eats-seed",
    "eats-fruit",
    "eats-invertebrate",
    "eats-invertebrate",
    "eats-rodent",
    "wingspan-under-50cm",
    "beak-pointing-left",
  ],
  grassland: [
    "bowl-nest",
    "cavity-nest",
    "ground-nest",
    "eats-seed",
    "eats-seed",
    "eats-invertebrate",
    "eats-invertebrate",
    "eats-fruit",
    "eats-rodent",
    "wingspan-under-50cm",
    "wingspan-at-least-50cm",
    "beak-pointing-right",
  ],
  wetland: [
    "platform-nest",
    "platform-nest",
    "ground-nest",
    "ground-nest",
    "cavity-nest",
    "eats-fish",
    "eats-fish",
    "eats-invertebrate",
    "eats-seed",
    "beak-pointing-left",
    "beak-pointing-right",
    "wingspan-at-least-50cm",
  ],
};
