import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { generateDuetMap, DuetMap } from "./core/DuetMap";
import { NUM_ROWS, SPACES_PER_ROW } from "./core/constants";
import { MersenneTwister19937 as mt, string } from "random-js";
import { BONUS_ICON_PARAMS, CRITERIA_ICON_PARAMS } from "./constants";
import { useSearchParams } from "react-router";

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
                      alt={`${habitat} ${alt}`}
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

function stringToArray(s: string) {
  return [...Array(s.length).keys()].map((i) => s.charCodeAt(i));
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seed, setSeed] = useState(() => {
    return (
      searchParams.get("seed") ??
      stringGenerator(seedGeneratorEngine, seedLength)
    );
  });
  const [mapSeed, setMapSeed] = useState(seed);
  const map = useMemo(() => {
    return generateDuetMap(mt.seedWithArray(stringToArray(seed)));
  }, [mapSeed]);
  const [showCheckmark, setShowCheckmark] = useState(0);

  useEffect(() => {
    setSearchParams({ seed: mapSeed });
  }, [mapSeed, setSearchParams]);

  return (
    <>
      <div className="main-bar">
        <input
          placeholder="seed"
          value={seed}
          onChange={(e) => {
            setSeed(e.target.value);
          }}
        />
        <button
          disabled={mapSeed === seed}
          onClick={() => {
            setMapSeed(seed);
          }}
          id="generate-button"
        >
          Generate
        </button>
        <button
          onClick={() => {
            const newSeed = stringGenerator(seedGeneratorEngine, seedLength);
            setSeed(newSeed);
            setMapSeed(newSeed);
          }}
          id="new-seed-button"
        >
          New seed
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setShowCheckmark((value) => value + 1);
            setTimeout(() => setShowCheckmark((value) => value - 1), 1000);
          }}
          id="copy-link-button"
        >
          {showCheckmark > 0 ? (
            <img
              className="checkmark"
              src="./check.svg"
              alt="Successfully copied"
            />
          ) : (
            <span>Copy link</span>
          )}
        </button>
      </div>
      <br />
      <DuetMapDrawing map={map} />
    </>
  );
}

export default App;
