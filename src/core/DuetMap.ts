import { Engine as RandomEngine, integer } from "random-js";
import { Bitstring } from '@digitalbazaar/bitstring';

const HABITATS = ['forest', 'grassland', 'wetland'] as const;
export type Habitat = typeof HABITATS[number];

// type Result<T, E = undefined> = { ok: true, value: T }
//                             | { ok: false, error: E | undefined };

export const CRITERIA = [
    'eats-invertebrate',
    'eats-seed',
    'eats-fruit',
    'eats-rodent',
    'eats-fish',
    'beak-pointing-left',
    'beak-pointing-right',
    'bowl-nest',
    'cavity-nest',
    'ground-nest',
    'platform-nest',
    'wingspan-under-50cm',
    'wingspan-at-least-50cm',
] as const;
export type Criterion = typeof CRITERIA[number];

const CRITERIA_BY_HABITAT: Record<Habitat, Criterion[]> = {
    forest: [
        'bowl-nest',
        'bowl-nest',
        'cavity-nest',
        'cavity-nest',
        'platform-nest',
        'eats-seed',
        'eats-fruit',
        'eats-invertebrate',
        'eats-invertebrate',
        'eats-rodent',
        'wingspan-under-50cm',
        'beak-pointing-left',
    ],
    grassland: [
        'bowl-nest',
        'cavity-nest',
        'ground-nest',
        'eats-seed',
        'eats-seed',
        'eats-invertebrate',
        'eats-invertebrate',
        'eats-fruit',
        'eats-rodent',
        'wingspan-under-50cm',
        'wingspan-at-least-50cm',
        'beak-pointing-right',
    ],
    wetland: [
        'platform-nest',
        'platform-nest',
        'ground-nest',
        'ground-nest',
        'cavity-nest',
        'eats-fish',
        'eats-fish',
        'eats-invertebrate',
        'eats-seed',
        'beak-pointing-left',
        'beak-pointing-right',
        'wingspan-at-least-50cm',
    ]
};

const numSpaces = 36;
const spacesPerRow = 6;

// function objectMap<T, R>(obj: T, mapper: (key: keyof T, value: T[keyof T]) => R) {
//     const result: Record<keyof T, R> = {};
//     for (const key in result) {
//         result[key] = mapper(key, result[key]);
//     }
//     return result;
// }

export interface DuetMap {
    // 36 spaces total
    // TODO: Add details to the map (food/nest type/wingspan/beak facing)
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

export function generateDuetMap(engine: RandomEngine): DuetMap {
    const habitatAssignments = generateHabitats(engine).map;
    
    const shuffledCriteriaByHabitat = { ...CRITERIA_BY_HABITAT };
    for (const habitat of HABITATS) {
        shuffledCriteriaByHabitat[habitat] = shuffle(CRITERIA_BY_HABITAT[habitat], engine);
    }
    const habitatCriteriaIndices: {[h in Habitat]: number} = Object.assign({}, ...HABITATS.map(h => ({[h]: 0})));
    const criteria: Criterion[] = [];
    for (let i = 0; i < numSpaces; i++) {
        const habitat = habitatAssignments[i];
        const nextCriteriaIndex = habitatCriteriaIndices[habitat];
        criteria.push(shuffledCriteriaByHabitat[habitat][nextCriteriaIndex]);
        habitatCriteriaIndices[habitat]++;
    }

    const numSpacesWithBonusByHabitat: {[h in Habitat]: number} = Object.assign({}, ...HABITATS.map(h => ({[h]: 0})));
    const bonuses = new Array(numSpaces).fill(false);
    for (const i of shuffle([...Array(numSpaces).keys()], engine)) {
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
    }
}

export function generateHabitats(engine: RandomEngine): {map: Habitat[], iterations: number, failures: number} {
    let itercount = 0;
    let numFailures = 0;
    for (;;) {
        const emptyMap: PartialDuetMap = new Array(numSpaces).fill(null);
        const firstViableMoves = shuffle(determineViableMoves(emptyMap).viableMoves, engine);
        const unsolvableMaps = new Set<number>();
        const stack: StackElement[] = [{ map: emptyMap, viableMoves: firstViableMoves, moveIndex: 0 }];
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
            const { viableMoves: newViableMoves, isDeadEnd } = determineViableMoves(newMap);
            if (isDeadEnd) {
                // console.log('dead end')
                // mark as unsolvable
                unsolvableMaps.add(encode(map));
                continue;
            }
            const shuffledNewViableMoves = shuffle(newViableMoves, engine);
            stack.push({ map: newMap, viableMoves: shuffledNewViableMoves, moveIndex: 0 });
        }
        // Generation failed due to hash collisions, retry
        numFailures++;
        console.log('fail')
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
        if (h === 'forest') {
            mixin = 1;
        } else if (h === 'grassland') {
            mixin = 2;
        } else if (h === 'wetland') {
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
    const habitatCounts: {[h in Habitat]: number} = Object.assign({}, ...HABITATS.map(h => ({[h]: 0})));
    for (let i = 0; i < numSpaces; i++) {
        const habitat = map[i];
        if (habitat !== null) {
            habitatCounts[habitat]++;
        }
    }
    // console.log('habitatCounts', habitatCounts);
    const result: Move[] = [];
    const nMovesPerHabitat: {[h in Habitat]: number} = Object.assign({}, ...HABITATS.map(h => ({[h]: 0})));
    for (let i = 0; i < numSpaces; i++) {
        if (map[i] !== null) {
            continue;
        }
        for (const habitat of HABITATS) {
            // const habitat = h as Habitat;
            // console.log(habitat, habitatCounts[habitat])
            if (habitatCounts[habitat] === 0 || (
                habitatCounts[habitat] !== 12 && neighbors(i).find(j => map[j] === habitat) !== undefined
            )) {
                // console.log({habitat, spaceIndex: i});
                result.push({ habitat, spaceIndex: i });
                nMovesPerHabitat[habitat]++;
            }
        }
    }
    // console.log('viableMoves', result);
    return {
        viableMoves: result,
        isDeadEnd: HABITATS.some(h => habitatCounts[h] < 12 && nMovesPerHabitat[h] === 0),
    };
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
    const isRightmostInRow = i % spacesPerRow === spacesPerRow - 1;
    const isLeftmostInRow = i % spacesPerRow === 0;
    const isInBottomRow = Math.floor(i / spacesPerRow) === 5;
    const isInTopRow = i < spacesPerRow;
    const isInEvenRow = Math.floor(i / spacesPerRow) % 2 === 0;
    // east
    if (!isRightmostInRow) {
        result.push(i + 1);
    }
    // southeast
    if (isInEvenRow) {
        result.push(i + spacesPerRow);
    } else if (!isRightmostInRow && !isInBottomRow) {
        result.push(i + spacesPerRow + 1);
    } 
    // southwest
    if (isInEvenRow && !isLeftmostInRow) {
        result.push(i + spacesPerRow - 1);
    } else if (!isInEvenRow && !isInBottomRow) {
        result.push(i + spacesPerRow);
    }
    // west
    if (!isLeftmostInRow) {
        result.push(i - 1);
    }
    // northwest
    if (!isInEvenRow) {
        result.push(i - spacesPerRow);
    } else if (!isInTopRow && !isLeftmostInRow) {        
        result.push(i - spacesPerRow - 1);
    }
    // northeast
    if (!isInEvenRow && !isRightmostInRow) {
        result.push(i - spacesPerRow + 1);
    } else if (isInEvenRow && !isInTopRow) {
        result.push(i - spacesPerRow);
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
export function toString(map: DuetMap): string {
    const result = [];
    for (let row = 0; row < 6; row++) {
        if (row % 2 === 1) {
            result.push('  ');
        }
        for (let col = 0; col < 6; col++) {
            const habitat = map.habitats[row * 6 + col];
            let ch = 'O';
            if (habitat === 'forest') {
                ch = 'F';
            } else if (habitat === 'grassland') {
                ch = 'G';
            } else if (habitat === 'wetland') {
                ch = 'W';
            }
            result.push(ch);
            if (col < 5) {
                result.push(' - ');
            }
        }
        result.push('\n');
        if (row % 2 === 0) {
            result.push(' \\ / \\ / \\ / \\ / \\ / \\\n');
        } else if (row < 5) {
            result.push(' / \\ / \\ / \\ / \\ / \\ /\n');
        }
    }
    return result.join("");
}
