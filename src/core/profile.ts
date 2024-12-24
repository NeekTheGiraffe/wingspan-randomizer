import { generateDuetMap, generateHabitats } from "./DuetMap";
import { MersenneTwister19937 as mt } from 'random-js'

let totalFailures = 0;
for (let i = 0; i < 10000; i++) {
    const startTime = performance.now();
    const { iterations, failures } = generateHabitats(mt.autoSeed());
    const endTime = performance.now();
    console.log(iterations, 'iterations,', failures, 'failures,', Math.round(endTime - startTime), 'milliseconds');
    totalFailures += failures;
}
console.log(totalFailures, 'total failures');

