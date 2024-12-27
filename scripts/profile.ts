import { generateDuetMap, generateHabitats } from "../src/core/DuetMap";
import { MersenneTwister19937 as mt } from 'random-js'

let totalFailures = 0;
const stats = [];
for (let i = 0; i < 100; i++) {
    const startTime = performance.now();
    const { iterations, failures } = generateHabitats(mt.autoSeed());
    const endTime = performance.now();
    const ms = Math.round(endTime - startTime);
    console.log(iterations, 'iterations,', failures, 'failures,', ms, 'milliseconds');
    totalFailures += failures;
    stats.push({ iterations, failures, ms });
}
console.log(stats.reduce((acc, { iterations }) => acc + iterations, 0) / 100, ' average iterations');
console.log(median(stats.map(({ iterations }) => iterations)), ' median iterations');
console.log(totalFailures, 'total failures');

function median(values: number[]): number {

    if (values.length === 0) {
      throw new Error('Input array is empty');
    }
  
    // Sorting values, preventing original array
    // from being mutated.
    values = [...values].sort((a, b) => a - b);
  
    const half = Math.floor(values.length / 2);
  
    return (values.length % 2
      ? values[half]
      : (values[half - 1] + values[half]) / 2
    );
  
  }
