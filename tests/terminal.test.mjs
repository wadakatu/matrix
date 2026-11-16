// Task 4.1: the terminal's contract and its one renderer. Run by `npm run check` (node --test).
// The security rules are the prototype's checks: text is always escaped, a link exists only where the
// interpreter returned one, and nothing a reader typed becomes markup or a link.
import { test } from "node:test";
import assert from "node:assert/strict";
import { demoInterpreter, render, renderEcho } from "../src/lib/index.ts";
import { world } from "../src/fixtures/terminal.ts";

const o = { newTab: " (opens in a new tab)" };
const html = (cmd) => {
  const sh = demoInterpreter(world);
  return renderEcho(sh.prompt(), cmd) + render(sh.exec(cmd).out, o);
};
const tags = (s) => [...s.matchAll(/<([a-z]+)[\s>]/g)].map((m) => m[1]);

test("typed markup is printed as text, never as an element", () => {
  for (const typed of ['<img src=x onerror="alert(1)">', "<script>alert(1)</script>", '"><svg onload=alert(1)>', "&lt;b&gt;"]) {
    const out = html(`echo ${typed}`);
    assert.deepEqual([...new Set(tags(out))].sort(), ["div", "span"], out);
    assert.ok(!out.includes(typed.slice(0, 4)) || !typed.startsWith("<"), out);
  }
  assert.match(html("echo <b>x</b>"), /&lt;b&gt;x&lt;\/b&gt;/);
});

test("typed URLs are printed as text, never as links", () => {
  for (const cmd of ["echo https://example.com/x", "echo javascript:alert(1)", "notacommand https://example.com/"]) {
    assert.ok(!html(cmd).includes("<a "), cmd);
  }
  // A file whose text is an address: cat prints it as text.
  assert.ok(html("cat contact.txt").includes("https://github.com/example"));
  assert.ok(!html("cat contact.txt").includes("<a "));
});

test("a link exists only where the interpreter returned a link segment, and only to a safe scheme", () => {
  assert.match(html("open github"), /<a href="https:\/\/github\.com\/example" target="_blank" rel="noopener">https:\/\/github\.com\/example<span class="mx-vh"> \(opens in a new tab\)<\/span><\/a>/);
  assert.match(html("open email"), /<a href="mailto:station@example\.com">station@example\.com<\/a>/);
  for (const href of ["javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x", "vbscript:x"]) {
    assert.ok(!render([[{ text: "x", href }]], o).includes("<a "), href);
  }
  assert.match(render([[{ text: "x", href: "/blog/" }]], o), /<a href="\/blog\/"/);
});

test("attribute values are escaped: a run, a link, an image", () => {
  const out = render([[{ text: "t", run: '"><img src=x>' }, { text: "u", href: '/x"onmouseover="a' }], { card: { src: '"><x', alt: '"<', width: 1, height: 1 } }], o);
  assert.ok(!/<img src=x>|<x|onmouseover="a"/.test(out), out);
  assert.equal(tags(out).filter((t) => t === "img").length, 1);
});

test("runs are buttons outside the tab order; tones are attributes; Japanese runs carry lang", () => {
  const out = render([[{ text: "help", run: "help" }, { text: "dim", tone: "dim" }, "見本の局 and text"]], o);
  assert.match(out, /<button class="mx-run" type="button" tabindex="-1" data-run="help">help<\/button>/);
  assert.match(out, /<span data-tone="dim">dim<\/span>/);
  assert.match(out, /<span lang="ja">見本の局<\/span> and text/);
});

test("the fetch card: the real mark, its lines, the eight swatches", () => {
  const out = html("neofetch");
  assert.match(out, /<div class="mx-fetch"><img class="mx-logo mx-fetch-mark" src="\/assets\/logo\/logo-400\.png" alt="fixture_ logo" width="400" height="400" \/>/);
  assert.equal(out.match(/class="mx-swatch"/g).length, 8);
});

test("the demo interpreter: effects, completion, takeover, and no state shared between instances", () => {
  const sh = demoInterpreter(world);
  assert.deepEqual(sh.exec("theme day").fx, { theme: "day" });
  assert.deepEqual(sh.exec("palette operator").fx, { palette: "operator" });
  assert.deepEqual(sh.exec("rain").fx, { overlay: "rain" });
  assert.deepEqual(sh.exec("reboot").fx, { navigate: "?boot=1" });
  assert.deepEqual(sh.exec("clear").fx, { clear: true });
  assert.deepEqual(sh.exec("exit").fx, { exit: true });
  assert.deepEqual(sh.exec("open site").fx, { open: "https://example.com/" });
  assert.deepEqual(sh.complete("he"), ["help "]);
  assert.deepEqual(sh.complete("c"), ["cd ", "cat ", "clear "]);
  assert.deepEqual(sh.complete("cat pro"), ["projects/"]);
  assert.equal(sh.complete("cat projects/fixture-").length, 5);
  assert.equal(sh.exec("view about.txt").fx.takeover.name, "view");
  assert.equal(sh.key("x").fx.takeover.message, "Read-only: press q to leave");
  assert.deepEqual(sh.exec(":q").fx, { takeover: null });
  sh.exec("cd projects");
  assert.equal(sh.prompt().cwd, "~/projects");
  assert.equal(demoInterpreter(world).prompt().cwd, "~");
});
