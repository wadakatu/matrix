// Task 3.1: the build-time helpers are pure and seeded. Run by `npm run check` (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as lib from "../src/lib/index.ts";

const phrases = ["feat: add the fixture station", "見本の局を追加", "fix: keep the panel solid 🚀", "見本のコーパスを説明する", "docs: the Matrix film", "src/fixtures/corpus.ts"];

test("same seed and corpus give byte-identical output; another seed does not", () => {
  const run = () => JSON.stringify([lib.rainColumns(phrases), lib.curtainSlabs(phrases), lib.streamStrands(phrases, 3), lib.glyphPools(phrases), lib.nameMask(phrases)]);
  assert.equal(run(), run());
  assert.notEqual(JSON.stringify(lib.rainColumns(phrases)), JSON.stringify(lib.rainColumns(phrases, { seed: 1 })));
  assert.notEqual(JSON.stringify(lib.streamStrands(phrases, 3)), JSON.stringify(lib.streamStrands(phrases, 4)));
});

test("the input is not changed", () => {
  const copy = [...phrases];
  lib.rainColumns(phrases);
  lib.curtainSlabs(phrases);
  assert.deepEqual(phrases, copy);
});

test("film-name filter and emoji: nothing that names the film, no character outside the BMP", () => {
  const all = JSON.stringify([lib.rainColumns(phrases), lib.curtainSlabs(phrases), lib.glyphPools(phrases)]) + decodeURIComponent(lib.nameMask(phrases));
  assert.doesNotMatch(all, /matrix/i);
  assert.ok(Array.from(all).every((c) => c.codePointAt(0) < 0x10000));
  assert.deepEqual(lib.corpus(["The Matrix", "MATRIX", "a 🚀", "ok"]), ["a", "ok"]);
});

test("rain: 40 × 3 by default, each drop a piece of a phrase of at most 20 glyphs, speeds within the tokens", () => {
  const cols = lib.rainColumns(phrases);
  assert.equal(cols.length, 40);
  const source = lib.corpus(phrases).join(" ");
  for (const c of cols) {
    assert.equal(c.drops.length, 3);
    assert.equal(new Set(c.drops.map((d) => d.t)).size, 1, "one speed per column");
    for (const d of c.drops) {
      assert.ok(d.t >= 9 && d.t <= 21);
      assert.ok(Array.from(d.text).length <= 20);
      assert.ok(source.includes(d.text), `${d.text} is a piece of a phrase`);
      assert.equal(d.ja, lib.hasJa(d.text));
      assert.ok(d.rest >= 0 && d.rest <= 96);
    }
  }
  assert.ok(cols.some((c) => c.drops.some((d) => d.ja)) && cols.some((c) => c.drops.some((d) => !d.ja)), "both scripts on screen");
});

test("defaults match the motion tokens", () => {
  const t = JSON.parse(readFileSync(new URL("../dist/tokens.json", import.meta.url)))["phosphor-night"];
  const cols = lib.rainColumns(phrases, { count: 400 });
  const ts = cols.map((c) => c.drops[0].t);
  assert.ok(Math.min(...ts) >= parseFloat(t["motion.rain.duration.min"]) && Math.max(...ts) <= parseFloat(t["motion.rain.duration.max"]));
  const st = Array.from({ length: 200 }, (_, i) => lib.streamStrands(["abc"], i)[0].drops[0].t);
  assert.ok(Math.min(...st) >= parseFloat(t["motion.strand.duration.min"]) && Math.max(...st) <= parseFloat(t["motion.strand.duration.max"]));
});

test("chunk splits by code point and drops empty pieces", () => {
  assert.deepEqual(lib.chunk("見本の局を追加", 3), ["見本の", "局を追", "加"]);
  assert.deepEqual(lib.chunk("ab    cd", 3), ["ab", "cd"]);
});

test("Japanese-run splitting", () => {
  assert.deepEqual(lib.splitJa("A fixture tool. 見本の道具"), ["A fixture tool.", "見本の道具"]);
  assert.deepEqual(lib.splitJa("Latin only"), ["Latin only", ""]);
  assert.equal(lib.hasJa("abc"), false);
  assert.equal(lib.hasJa("カナ"), true);
});

test("curtain: 24 slabs of 260 glyphs with no spaces", () => {
  const slabs = lib.curtainSlabs(phrases);
  assert.equal(slabs.length, 24);
  for (const s of slabs) {
    assert.equal(Array.from(s).length, 260);
    assert.doesNotMatch(s, /\s/);
  }
});

test("glyph pools come from the corpus only", () => {
  const { wide, narrow } = lib.glyphPools(["ab1", "見本"]);
  assert.equal(wide, "見本");
  assert.equal(narrow, "ab1");
});

test("decode and hex frames: settled at 1, deterministic, spaces kept, length kept", () => {
  const pools = lib.glyphPools(phrases);
  assert.equal(lib.decodeFrame("Work and writing", 1, 9, pools), "Work and writing");
  assert.equal(lib.decodeFrame("Work and writing", 0.3, 4, pools), lib.decodeFrame("Work and writing", 0.3, 4, pools));
  const raw = lib.decodeFrame("見本 ab", 0, 2, pools);
  assert.equal(Array.from(raw).length, 5);
  assert.equal(raw[2], " ");
  assert.ok(pools.wide.includes(raw[0]));
  assert.equal(lib.hexFrame("ab c", 0), "ab c");
  assert.equal(lib.hexFrame("ab c", 1), "62 3");
});

test("streams: two drops per strand at most, from the stream's own texts", () => {
  const s = lib.streamStrands(["fixture-one", "A fixture tool for tests", "example.com"], 0);
  assert.equal(s.length, 3);
  for (const strand of s) assert.ok(strand.drops.length >= 1 && strand.drops.length <= 2);
  assert.equal(s[0].drops[0].text, "fixture-on");
});

test("the name mask escapes markup in the corpus", () => {
  const m = decodeURIComponent(lib.nameMask(["<b>&"]));
  assert.match(m, /&lt;b>&amp;/);
  assert.doesNotMatch(m, /<b>/);
});
