import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateDuetMap, toString, neighbors, DuetMap, Habitat, Criterion } from './core/DuetMap'
import { MersenneTwister19937 as mt, string } from 'random-js'
import invertebrate from './assets/invertebrate.svg'

interface IconParams {
  alt: string,
  src: string,
  imgClasses: string,
}

const iconParams: Record<Criterion, IconParams> = {
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

function dotRepresentation(map: DuetMap) {
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
      {map.habitats.slice(6 * row, 6 * (row + 1)).map((habitat, col) => {
        const i = 6 * row + col;
        const { src, imgClasses, alt } = iconParams[map.criteria[i]];
        return <div key={6 * row + col} className={`dot-container ${helperClasses[i] ?? ''}`}>
            <span className={`dot`}>
              <img
                draggable={false}
                className={`criterion ${imgClasses}`}
                src={src}
                alt={alt}
              />
              <div className={`hexagon ${habitat}`}>
            </div></span>
        </div>})}
    </div>
  )}
  </div>;
}

// const initialMap = generateDuetMap(mt.autoSeed());

const seedGeneratorEngine = mt.autoSeed();
const stringGenerator = string('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
const seedLength = 16;
const initialSeed = stringGenerator(seedGeneratorEngine, seedLength);

function stringToArray(s: string) {
  return [...Array(s.length).keys()].map(i => s.charCodeAt(i));
}

function App() {
  const [seed, setSeed] = useState(initialSeed);
  const [seedHasChanged, setSeedHasChanged] = useState(false);
  const [map, setMap] = useState(() => generateDuetMap(mt.seedWithArray(stringToArray(initialSeed))));

  return (
    <>
      {/* <code>{toString(map)}</code> */}
      <div className='main-bar'>
        <input
          placeholder='seed'
          value={seed}
          onChange={(e => {
            setSeedHasChanged(true);
            setSeed(e.target.value);
          })}
        />
        <button
          disabled={!seedHasChanged}
          onClick={() => {
            setMap(generateDuetMap(mt.seedWithArray(stringToArray(seed))));
            setSeedHasChanged(false);
          }}
        >
          Generate
        </button>
        <button
          onClick={() => {
            const newSeed = stringGenerator(seedGeneratorEngine, seedLength);
            setSeed(newSeed);
            setMap(generateDuetMap(mt.seedWithArray(stringToArray(newSeed))));
            setSeedHasChanged(false);
          }}
        >
          New seed
        </button>
      </div>
      <br/>
      {dotRepresentation(map)}
      
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
