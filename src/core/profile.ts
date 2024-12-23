import { generateDuetMap } from "./DuetMap";
import { MersenneTwister19937 as mt } from 'random-js'

for (let i = 0; i < 100; i++) {
    const startTime = performance.now();
    generateDuetMap(mt.autoSeed());
    const endTime = performance.now();
    console.log(Math.round(endTime - startTime), 'milliseconds');
}
