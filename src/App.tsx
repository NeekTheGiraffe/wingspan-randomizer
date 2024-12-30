import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { generateDuetMap, DuetMap } from "./core/DuetMap";
import { NUM_ROWS, NUM_SPACES, SPACES_PER_ROW } from "./core/constants";
import { MersenneTwister19937 as mt, string } from "random-js";
import {
  BONUS_ICON_PARAMS,
  CRITERIA_ICON_PARAMS,
  TOKEN_ICON_PARAMS,
} from "./constants";
import { useSearchParams } from "react-router";

interface DuetMapDrawingProps {
  map: DuetMap;
  mode: Mode;
  playStates: PlayState[];
  onSpaceClick: (index: number) => void;
}

function DuetMapDrawing(props: DuetMapDrawingProps) {
  const { map, mode, playStates, onSpaceClick } = props;
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
                  <button
                    className={`dot`}
                    onClick={() => onSpaceClick(i)}
                    disabled={mode === "edit"}
                  >
                    {map.bonuses[i] ? (
                      <img
                        src={`${import.meta.env.BASE_URL}${BONUS_ICON_PARAMS[habitat].src}`}
                        className="bonus"
                      />
                    ) : null}
                    <img
                      draggable={false}
                      className={`criterion ${imgClasses}`}
                      src={`${import.meta.env.BASE_URL}${src}`}
                      alt={`${habitat} ${alt}`}
                    />
                    {mode === "play" && playStates[i] !== "empty" ? (
                      <img
                        draggable={false}
                        className={"token"}
                        src={`${import.meta.env.BASE_URL}${TOKEN_ICON_PARAMS[playStates[i]].src}`}
                        alt={TOKEN_ICON_PARAMS[playStates[i]].alt}
                      />
                    ) : null}
                    <div className={`hexagon ${habitat}`}></div>
                  </button>
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

type Mode = "edit" | "play";
type PlayState = "empty" | "yin" | "yang";

function App() {
  const [mode, setMode] = useState<Mode>("edit");
  const [searchParams, setSearchParams] = useSearchParams();
  const [seed, setSeed] = useState(() => {
    return (
      searchParams.get("seed") ??
      stringGenerator(seedGeneratorEngine, seedLength)
    );
  });
  const [mapSeed, setMapSeed] = useState(seed);
  const map = useMemo(() => {
    return generateDuetMap(mt.seedWithArray(stringToArray(mapSeed)));
  }, [mapSeed]);
  const [showCheckmark, setShowCheckmark] = useState(0);
  const [playStates, setPlayStates] = useState<PlayState[]>(() =>
    new Array(NUM_SPACES).fill("empty"),
  );

  useEffect(() => {
    setSearchParams({ seed: mapSeed });
  }, [mapSeed, setSearchParams]);

  return (
    <>
      <div className="mode-selection">
        <button
          onClick={() => setMode("edit")}
          className={mode === "edit" ? "active-mode" : ""}
          id="edit-button"
        >
          <img
            src={`${import.meta.env.BASE_URL}/edit.svg`}
            className="ui-icon"
          />
          Edit
        </button>
        <button
          onClick={() => setMode("play")}
          className={mode === "play" ? "active-mode" : ""}
          id="play-button"
        >
          <img
            src={`${import.meta.env.BASE_URL}/play.svg`}
            className="ui-icon"
          />
          Play
        </button>
      </div>
      <div className="main-bar">
        {mode === "edit" ? (
          <>
            <input
              placeholder="seed"
              value={seed}
              onChange={(e) => {
                setSeed(e.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setMapSeed(seed);
                }
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
                const newSeed = stringGenerator(
                  seedGeneratorEngine,
                  seedLength,
                );
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
                  src={`${import.meta.env.BASE_URL}/check.svg`}
                  alt="Successfully copied"
                />
              ) : (
                <span>Copy link</span>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() =>
              setPlayStates(() => new Array(NUM_SPACES).fill("empty"))
            }
            id="reset-button"
          >
            Reset
          </button>
        )}
      </div>
      <br />
      <DuetMapDrawing
        map={map}
        mode={mode}
        playStates={playStates}
        onSpaceClick={(i) => {
          setPlayStates((value) => {
            const newPlayStates = value.slice();
            if (newPlayStates[i] === "empty") {
              newPlayStates[i] = "yang";
            } else if (newPlayStates[i] === "yang") {
              newPlayStates[i] = "yin";
            } else {
              newPlayStates[i] = "empty";
            }
            return newPlayStates;
          });
        }}
      />
    </>
  );
}

export default App;
