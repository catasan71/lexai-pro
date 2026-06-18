import { describe, it, expect } from "vitest";
import { extractJSON } from "./claude";

describe("extractJSON", () => {
  it("parses plain JSON object", () => {
    expect(extractJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses plain JSON array", () => {
    expect(extractJSON("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("strips markdown fences", () => {
    const txt = '```json\n{"ok":true}\n```';
    expect(extractJSON(txt)).toEqual({ ok: true });
  });

  it("extracts object embedded in surrounding prose", () => {
    const txt = 'Sigur, iată:\n{"titlu":"x"}\nSper că ajută.';
    expect(extractJSON(txt)).toEqual({ titlu: "x" });
  });

  it("extracts array embedded in surrounding prose", () => {
    const txt = 'Rezultat: [{"a":1},{"b":2}] gata';
    expect(extractJSON(txt)).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("throws on empty input", () => {
    expect(() => extractJSON("")).toThrow(/gol/i);
  });

  it("throws with a preview on unparseable input", () => {
    expect(() => extractJSON("nu este json deloc")).toThrow(/JSON invalid/);
  });
});
