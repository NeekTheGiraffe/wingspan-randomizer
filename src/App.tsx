import { useState } from "react";
import "./App.css";
import {
  generateDuetMap,
  DuetMap,
  NUM_ROWS,
  SPACES_PER_ROW,
} from "./core/DuetMap";
import { MersenneTwister19937 as mt, string } from "random-js";
import { BONUS_ICON_PARAMS, CRITERIA_ICON_PARAMS } from "./constants";

function DuetMapDrawing({ map }: { map: DuetMap }) {
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
  };

  return (
    <div className="duet-map">
      {[...Array(NUM_ROWS).keys()].map((row) => (
        <div key={row} className={`row ${row % 2 === 0 ? "even" : "odd"}`}>
          {map.habitats
            .slice(SPACES_PER_ROW * row, SPACES_PER_ROW * (row + 1))
            .map((habitat, col) => {
              const i = SPACES_PER_ROW * row + col;
              const { src, imgClasses, alt } =
                CRITERIA_ICON_PARAMS[map.criteria[i]];
              return (
                <div
                  key={i}
                  className={`dot-container ${helperClasses[i] ?? ""}`}
                >
                  <span className={`dot`}>
                    {map.bonuses[i] ? (
                      <img
                        src={BONUS_ICON_PARAMS[habitat].src}
                        className="bonus"
                      />
                    ) : null}
                    <img
                      draggable={false}
                      className={`criterion ${imgClasses}`}
                      src={src}
                      alt={alt}
                    />
                    <div className={`hexagon ${habitat}`}></div>
                  </span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

const seedGeneratorEngine = mt.autoSeed();
const stringGenerator = string(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
);
const seedLength = 16;
const initialSeed = stringGenerator(seedGeneratorEngine, seedLength);

function stringToArray(s: string) {
  return [...Array(s.length).keys()].map((i) => s.charCodeAt(i));
}

function App() {
  const [seed, setSeed] = useState(initialSeed);
  const [seedHasChanged, setSeedHasChanged] = useState(false);
  const [map, setMap] = useState(() =>
    generateDuetMap(mt.seedWithArray(stringToArray(initialSeed))),
  );

  return (
    <>
      <div className="main-bar">
        <input
          placeholder="seed"
          value={seed}
          onChange={(e) => {
            setSeedHasChanged(true);
            setSeed(e.target.value);
          }}
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
      <br />
      <DuetMapDrawing map={map} />
    </>
  );
}

export default App;
