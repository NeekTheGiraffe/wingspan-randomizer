import { encode } from "../src/core/DuetMap";
import { Habitat } from "../src/core/types";

function mapFromString(s: string): (Habitat | null)[] {
  const result: (Habitat | null)[] = [];
  if (s.length !== 36) throw new Error("improper length");
  for (let i = 0; i < 36; i++) {
    const ch = s.substring(i, i + 1);
    if (ch === "f") result.push("forest");
    else if (ch === "g") result.push("grassland");
    else if (ch === "w") result.push("wetland");
    else result.push(null);
  }
  return result;
}

const maps = [
  "ffffffffffffggggggggggggwwwwwwwwwwww",
  "ggggggggggggggggggggggggwwwwwwwwwwww",
];

for (const s of maps) {
  console.log(s, encode(mapFromString(s)));
}
