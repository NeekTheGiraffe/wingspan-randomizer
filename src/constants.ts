import { Criterion, Habitat } from "./core/DuetMap"

interface CriteriaIconParams {
  alt: string,
  src: string,
  imgClasses: string,
}

export const CRITERIA_ICON_PARAMS: Record<Criterion, CriteriaIconParams> = {
  'beak-pointing-left': {
    alt: "Beak pointing left",
    src: "./beak-left.svg",
    imgClasses: "beak",
  },
  'beak-pointing-right': {
    alt: "Beak pointing left",
    src: "./beak-right.svg",
    imgClasses: "beak",
  },
  'bowl-nest': {
    alt: "Bowl nest",
    src: "./nest-bowl.svg",
    imgClasses: "nest",
  },
  'cavity-nest': {
    alt: "Cavity nest",
    src: "./nest-cavity.svg",
    imgClasses: "nest",
  },
  'ground-nest': {
    alt: "Ground nest",
    src: "./nest-ground.svg",
    imgClasses: "nest",
  },
  'platform-nest': {
    alt: "Platform nest",
    src: "./nest-platform.svg",
    imgClasses: "nest",
  },
  'eats-fish': {
    alt: "Eats fish",
    src: "./fish.svg",
    imgClasses: "",
  },
  'eats-fruit': {
    alt: "Eats fruit",
    src: "./fruit.svg",
    imgClasses: "",
  },
  'eats-invertebrate': {
    alt: "Eats invertebrate",
    src: "./invertebrate.svg",
    imgClasses: "",
  },
  'eats-rodent': {
    alt: "Eats rodent",
    src: "./rodent.svg",
    imgClasses: "",
  },
  'eats-seed': {
    alt: "Eats seed",
    src: "./seed.svg",
    imgClasses: "",
  },
  'wingspan-at-least-50cm': {
    alt: "Wingspan at least 50cm",
    src: "./wingspan-at-least-50cm.svg",
    imgClasses: "",
  },
  'wingspan-under-50cm': {
    alt: "Wingspan under 50cm",
    src: "./wingspan-under-50cm.svg",
    imgClasses: "",
  },
}

export const BONUS_ICON_PARAMS: Record<Habitat, { src: string }> = {
  forest: {
    src: './bonus-food.svg',
  },
  grassland: {
    src: './bonus-egg.svg',
  },
  wetland: {
    src: './bonus-card.svg',
  }
};