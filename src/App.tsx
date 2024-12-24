import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateDuetMap, toString, neighbors, DuetMap, Habitat } from './core/DuetMap'
import { MersenneTwister19937 as mt } from 'random-js'

function dotRepresentation(map: Habitat[]) {
  const helperClasses: Record<number, string> = {
    0: "southeast-6",
    1: "southeast-6 southwest-3",
    2: "southeast-6 southwest-5",
    3: "southeast-6 southwest-6",
    4: "southeast-4 southwest-6",
    5: "southeast-2 southwest-6",
    11: "southwest-5",
    12: "southeast-4",
    23: "southwest-3",
    24: "southeast-2",
  }

  return <div className="duet-map">
    {[...Array(6).keys()].map(row => 
    <div key={row} className={`row ${row % 2 === 0 ? 'even' : 'odd'}`}>
      {map.slice(6 * row, 6 * (row + 1)).map((habitat, col) =>
        <div key={6 * row + col} className={`dot-container ${helperClasses[6 * row + col] ?? ''}`}><span className={`dot ${habitat} `} /></div>)}
    </div>
  )}
  </div>;
}

const initialMap = generateDuetMap(mt.autoSeed());

function App() {
  const [map, setMap] = useState(initialMap);

  return (
    <>
      {/* <code>{toString(map)}</code> */}
      <button onClick={() => setMap(generateDuetMap(mt.autoSeed()))}>Regenerate</button><br/>
      {dotRepresentation(map.habitats)}
      
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  )
}

export default App
