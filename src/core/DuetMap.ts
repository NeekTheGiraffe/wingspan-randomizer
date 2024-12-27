import { Engine as RandomEngine, integer } from "random-js";

const HABITATS = ["forest", "grassland", "wetland"] as const;
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

const CRITERIA_BY_HABITAT: Record<Habitat, Criterion[]> = {
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

export const NUM_ROWS = 6;
export const SPACES_PER_ROW = 6;
export const NUM_SPACES = 36;

export interface DuetMap {
  habitats: Habitat[];
  criteria: Criterion[];
  bonuses: boolean[];
}

type PartialDuetMap = (Habitat | null)[];

interface Move {
  habitat: Habitat;
  spaceIndex: number;
}

interface StackElement {
  map: PartialDuetMap;
  viableMoves: Move[];
  moveIndex: number;
}

type CallbackOrValue<T, R> = R | ((input: T) => R);

function forEachHabitat<T>(
  input: CallbackOrValue<Habitat, T>,
): Record<Habitat, T> {
  if (typeof input === "function") {
    return Object.assign(
      {},
      ...HABITATS.map((h) => ({ [h]: (input as (h: Habitat) => T)(h) })),
    );
  }
  return Object.assign({}, ...HABITATS.map((h) => ({ [h]: input })));
}

export function generateDuetMap(engine: RandomEngine): DuetMap {
  const habitatAssignments = generateHabitats(engine).map;

  const shuffledCriteriaByHabitat = { ...CRITERIA_BY_HABITAT };
  for (const habitat of HABITATS) {
    shuffledCriteriaByHabitat[habitat] = shuffle(
      CRITERIA_BY_HABITAT[habitat],
      engine,
    );
  }
  const habitatCriteriaIndices = forEachHabitat(0);
  const criteria: Criterion[] = [];
  for (let i = 0; i < NUM_SPACES; i++) {
    const habitat = habitatAssignments[i];
    const nextCriteriaIndex = habitatCriteriaIndices[habitat];
    criteria.push(shuffledCriteriaByHabitat[habitat][nextCriteriaIndex]);
    habitatCriteriaIndices[habitat]++;
  }

  const numSpacesWithBonusByHabitat = forEachHabitat(0);
  const bonuses = new Array(NUM_SPACES).fill(false);
  for (const i of shuffle([...Array(NUM_SPACES).keys()], engine)) {
    const habitat = habitatAssignments[i];
    if (numSpacesWithBonusByHabitat[habitat] < 3) {
      bonuses[i] = true;
      numSpacesWithBonusByHabitat[habitat]++;
    }
  }

  return {
    habitats: habitatAssignments,
    criteria,
    bonuses,
  };
}

export function generateHabitats(engine: RandomEngine): {
  map: Habitat[];
  iterations: number;
  failures: number;
} {
  let itercount = 0;
  let numFailures = 0;
  for (;;) {
    const emptyMap: PartialDuetMap = new Array(NUM_SPACES).fill(null);
    const firstViableMoves = shuffle(
      determineViableMoves(emptyMap).viableMoves,
      engine,
    );
    const unsolvableMaps = new Set<number>();
    const stack: StackElement[] = [
      { map: emptyMap, viableMoves: firstViableMoves, moveIndex: 0 },
    ];
    while (stack.length > 0) {
      itercount++;
      const { map, viableMoves, moveIndex } = stack[stack.length - 1];
      if (moveIndex === viableMoves.length) {
        unsolvableMaps.add(encode(map));
        stack.pop();
        continue;
      }
      const newMap = map.slice();
      const move = viableMoves[moveIndex];
      newMap[move.spaceIndex] = move.habitat;
      stack[stack.length - 1].moveIndex++;
      if (isDone(newMap)) {
        // console.log(toString({ spaces: newMap }))
        // console.log(itercount, 'iterations,', numFailures, 'failures')
        return { map: newMap, iterations: itercount, failures: numFailures };
      }
      if (unsolvableMaps.has(encode(newMap))) {
        continue;
      }
      const { viableMoves: newViableMoves, isDeadEnd } =
        determineViableMoves(newMap);
      if (isDeadEnd) {
        // console.log('dead end')
        // mark as unsolvable
        unsolvableMaps.add(encode(map));
        continue;
      }
      const shuffledNewViableMoves = shuffle(newViableMoves, engine);
      stack.push({
        map: newMap,
        viableMoves: shuffledNewViableMoves,
        moveIndex: 0,
      });
    }
    // Generation failed due to hash collisions, retry
    numFailures++;
    console.log("fail");
  }
}

const mapping = {
  forest: 1,
  grassland: 2,
  wetland: 3,
};

export function encode(map: PartialDuetMap): number {
  let result = 0;
  for (let i = 0; i < map.length; i++) {
    const h = map[i];
    let mixin = 0;
    if (h === "forest") {
      mixin = 1;
    } else if (h === "grassland") {
      mixin = 2;
    } else if (h === "wetland") {
      mixin = 3;
    }
    result += mixin;
    result <<= 2;
    // if (i < 16) result |= mixin << (2 * i);
    // if (i >= 20) result |= mixin << (2 * (i-20));
    // result ^= mixin << (2 * (i % 16));
  }
  return result;
}

function encode2(map: PartialDuetMap): number {
  let hash = 0; // Initialize hash
  const PRIME = 0x9e3779b1; // A large prime for better mixing

  for (let i = 0; i < map.length; i++) {
    const val = map[i];
    const value = val ? mapping[val] : 0;

    // Mix in the current value into the hash
    hash ^= value; // XOR the value
    hash = (hash * PRIME) | 0; // Multiply by a prime and keep it 32-bit
  }

  hash ^= hash >>> 16;
  hash = (hash * PRIME) | 0;
  hash ^= hash >>> 13;

  return (hash >>> 16) & 0x0000ffff; // 16-bit hash
}

function encode3(map: PartialDuetMap): string {
  const mapper = {
    forest: "f",
    grassland: "g",
    wetland: "w",
  };
  return map.map((h) => (h === null ? "n" : mapper[h])).join("");
}

function isDone(map: PartialDuetMap): map is Habitat[] {
  // console.log(map, map.length);
  for (let i = 0; i < map.length; i++) {
    if (map[i] === null) {
      return false;
    }
  }
  return true;
}

function determineViableMoves(map: PartialDuetMap) {
  const existingSpaces = forEachHabitat<number[]>(() => []);
  for (let i = 0; i < NUM_SPACES; i++) {
    const habitat = map[i];
    if (habitat !== null) {
      existingSpaces[habitat].push(i);
    }
  }
  // Perform DFS for each habitat
  for (const habitat of HABITATS) {
    // console.log('performing dfs');
    if (existingSpaces[habitat].length === 0) {
      continue;
    }
    const nReachable = countReachable(map, existingSpaces[habitat], 12);
    if (nReachable < 12) {
      // console.log("dfs failed");
      return { isDeadEnd: true, viableMoves: [] };
    }
  }
  for (let i = 0; i < HABITATS.length; i++) {
    const nextIndex = (i + 1) % HABITATS.length;
    if (
      existingSpaces[HABITATS[i]].length === 0 ||
      existingSpaces[HABITATS[nextIndex]].length === 0
    ) {
      continue;
    }
    const initialSpaces = [
      ...existingSpaces[HABITATS[i]],
      ...existingSpaces[HABITATS[nextIndex]],
    ];
    // console.log("pair dfs started");
    const nReachable = countReachable(map, initialSpaces, 24);
    if (nReachable < 24) {
      // console.log(
      //   "pair dfs failed",
      //   HABITATS[i],
      //   HABITATS[nextIndex],
      //   nReachable,
      //   initialSpaces,
      // );
      // console.log(toString(map));
      return { isDeadEnd: true, viableMoves: [] };
    }
  }
  // console.log("dfs succeeded");
  // console.log(toString(map));

  // console.log('habitatCounts', habitatCounts);
  const result: Move[] = [];
  const nMovesPerHabitat = forEachHabitat(0);
  for (let i = 0; i < NUM_SPACES; i++) {
    if (map[i] !== null) {
      continue;
    }
    for (const habitat of HABITATS) {
      // const habitat = h as Habitat;
      // console.log(habitat, habitatCounts[habitat])
      if (
        existingSpaces[habitat].length === 0 ||
        (existingSpaces[habitat].length !== 12 &&
          neighbors(i).find((j) => map[j] === habitat) !== undefined)
      ) {
        // console.log({habitat, spaceIndex: i});
        result.push({ habitat, spaceIndex: i });
        nMovesPerHabitat[habitat]++;
      }
    }
  }
  // console.log('viableMoves', result);
  return {
    viableMoves: result,
    isDeadEnd: HABITATS.some(
      (h) => existingSpaces[h].length < 12 && nMovesPerHabitat[h] === 0,
    ),
  };
}

function countReachable(
  map: PartialDuetMap,
  initialSpaces: number[],
  target: number,
): number {
  const visited = new Array(NUM_SPACES).fill(false);
  // const stack = existingSpaces[habitat].slice();
  const stack = initialSpaces.slice();
  for (const i of stack) {
    visited[i] = true;
  }
  let nReachable = stack.length;
  while (stack.length > 0 && nReachable < target) {
    const top = stack[stack.length - 1];
    stack.pop();
    for (const j of neighbors(top)) {
      if (map[j] === null && !visited[j]) {
        // console.log("visited", j);
        visited[j] = true;
        nReachable++;
        stack.push(j);
      }
    }
  }
  return nReachable;
}

function shuffle<T>(array: T[], engine: RandomEngine): T[] {
  const result = array.slice();
  for (let i = 0; i < result.length - 1; i++) {
    const j = integer(i, result.length - 1)(engine);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export function neighbors(i: number): number[] {
  const result = [];
  const isRightmostInRow = i % SPACES_PER_ROW === SPACES_PER_ROW - 1;
  const isLeftmostInRow = i % SPACES_PER_ROW === 0;
  const isInBottomRow = Math.floor(i / SPACES_PER_ROW) === 5;
  const isInTopRow = i < SPACES_PER_ROW;
  const isInEvenRow = Math.floor(i / SPACES_PER_ROW) % 2 === 0;
  // east
  if (!isRightmostInRow) {
    result.push(i + 1);
  }
  // southeast
  if (isInEvenRow) {
    result.push(i + SPACES_PER_ROW);
  } else if (!isRightmostInRow && !isInBottomRow) {
    result.push(i + SPACES_PER_ROW + 1);
  }
  // southwest
  if (isInEvenRow && !isLeftmostInRow) {
    result.push(i + SPACES_PER_ROW - 1);
  } else if (!isInEvenRow && !isInBottomRow) {
    result.push(i + SPACES_PER_ROW);
  }
  // west
  if (!isLeftmostInRow) {
    result.push(i - 1);
  }
  // northwest
  if (!isInEvenRow) {
    result.push(i - SPACES_PER_ROW);
  } else if (!isInTopRow && !isLeftmostInRow) {
    result.push(i - SPACES_PER_ROW - 1);
  }
  // northeast
  if (!isInEvenRow && !isRightmostInRow) {
    result.push(i - SPACES_PER_ROW + 1);
  } else if (isInEvenRow && !isInTopRow) {
    result.push(i - SPACES_PER_ROW);
  }
  return result;
}

//  O - O - O - O - O - O
//   \ / \ / \ / \ / \ / \
//    O - O - O - O - O - O
//   / \ / \ / \ / \ / \ /
//  O - O - O - O - O - O
//   \ / \ / \ / \ / \ / \
//    O - O - O - O - O - O
//   / \ / \ / \ / \ / \ /
//  O - O - O - O - O - O
//   \ / \ / \ / \ / \ / \
//    O - O - O - O - O - O
export function toString(map: PartialDuetMap): string {
  const result = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    if (row % 2 === 1) {
      result.push("  ");
    }
    for (let col = 0; col < SPACES_PER_ROW; col++) {
      const habitat = map[row * SPACES_PER_ROW + col];
      let ch = "O";
      if (habitat === "forest") {
        ch = "F";
      } else if (habitat === "grassland") {
        ch = "G";
      } else if (habitat === "wetland") {
        ch = "W";
      }
      result.push(ch);
      if (col < 5) {
        result.push(" - ");
      }
    }
    result.push("\n");
    if (row % 2 === 0) {
      result.push(" \\ / \\ / \\ / \\ / \\ / \\\n");
    } else if (row < 5) {
      result.push(" / \\ / \\ / \\ / \\ / \\ /\n");
    }
  }
  return result.join("");
}
