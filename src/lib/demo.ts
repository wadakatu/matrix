// A small demo interpreter for stories and tests (04, "Terminal"): help, echo, ls, cat, a fetch card,
// a takeover, and one command for each effect. It holds no personal data and no jokes; every fact
// comes in through `DemoWorld`. The site's real interpreter stays in the site (01).
import type { Interpreter, Item, Line, Result, Seg } from "./terminal.ts";

export interface DemoWorld {
  user: string;
  host: string;
  /** The mark, for the fetch card. */
  mark: { src: string; alt: string; width: number; height: number };
  /** Key, value and, for a link, its address: the fetch card's lines. */
  facts: [key: string, value: string, href?: string][];
  /** File contents by path from the home directory, `a/b.md`; a directory is any path's prefix. */
  files: Record<string, string>;
  /** Names `open` knows. */
  links: Record<string, string>;
  /** The working directory to start in, below home. */
  cwd?: string;
}

const dim = (text: string): Seg => ({ text, tone: "dim" });
const hi = (text: string): Seg => ({ text, tone: "hi" });
const run = (text: string, cmd = text): Seg => ({ text, run: cmd });
const HELP: [string, string][] = [
  ["help", "list these commands"],
  ["echo TEXT", "print TEXT"],
  ["ls [-l] [DIR]", "list files"],
  ["cd DIR", "change directory"],
  ["cat FILE", "print a file"],
  ["neofetch", "the card from login"],
  ["open NAME", "open a link in a new tab"],
  ["view FILE", "read a file full screen"],
  ["rain", "the rain over the screen, until a key"],
  ["theme day|night", "the same screen in daylight"],
  ["palette operator|phosphor", "the other colours"],
  ["reboot", "the intro again"],
  ["clear", "or Ctrl+L"],
  ["exit", "back to the other reading"],
];
const NAMES = HELP.map(([u]) => u.split(" ")[0]);

export function demoInterpreter(w: DemoWorld): Interpreter {
  let cwd = w.cwd ?? "";
  let viewing: { name: string; lines: string[] } | null = null;
  const join = (dir: string, p: string) => {
    const parts = (p.startsWith("~") ? p.slice(1) : `${dir}/${p}`).split("/");
    const out: string[] = [];
    for (const s of parts) {
      if (!s || s === ".") continue;
      if (s === "..") out.pop();
      else out.push(s);
    }
    return out.join("/");
  };
  const isDir = (p: string) => p === "" || Object.keys(w.files).some((f) => f.startsWith(`${p}/`));
  const entries = (dir: string) => {
    const pre = dir ? `${dir}/` : "";
    const names = new Set(Object.keys(w.files).filter((f) => f.startsWith(pre)).map((f) => f.slice(pre.length).split("/")[0]));
    return [...names].sort().map((n) => ({ name: n, path: pre + n, dir: isDir(pre + n) }));
  };
  const tilde = (p: string) => (p ? `~/${p}` : "~");
  const rel = (p: string) => (cwd && p.startsWith(`${cwd}/`) ? p.slice(cwd.length + 1) : tilde(p));
  const bytes = (s: string) => new TextEncoder().encode(s).length;

  const cmds: Record<string, (args: string[]) => Item[] | Result> = {
    help: () => [
      "Commands you can run:",
      "",
      ...HELP.map(([usage, what]): Line => {
        const name = usage.split(" ")[0];
        return ["  ", run(name), usage.slice(name.length).padEnd(28 - name.length), dim(what)];
      }),
      "",
      dim("Tab completes. Up and Down recall. Ctrl+C cancels. Ctrl+L clears."),
    ],
    echo: (args) => [args.join(" ")],
    ls: (args) => {
      const long = args.includes("-l");
      const target = join(cwd, args.find((a) => !a.startsWith("-")) ?? ".");
      if (w.files[target] !== undefined) return [target.split("/").pop()!];
      if (!isDir(target)) return [`ls: ${args.find((a) => !a.startsWith("-"))}: No such file or directory`];
      const list = entries(target);
      const open = (e: (typeof list)[number]): Seg => (e.dir ? { text: `${e.name}/`, tone: "dir", run: `ls -l ${rel(e.path)}` } : run(e.name, `cat ${rel(e.path)}`));
      if (!long) return [list.flatMap((e, i): Seg[] => [...(i ? ["  "] : []), open(e)])];
      return list.map((e): Line => [dim(`${e.dir ? "drwxr-xr-x" : "-r--r--r--"} ${String(e.dir ? 0 : bytes(w.files[e.path])).padStart(5)}  `), open(e)]);
    },
    cd: ([p = "~"]) => {
      const to = join(cwd, p);
      if (!isDir(to) || w.files[to] !== undefined) return [`cd: ${p}: No such directory`];
      cwd = to;
      return [];
    },
    cat: (args) => {
      if (!args.length) return ["usage: cat FILE"];
      return args.flatMap((a) => {
        const t = w.files[join(cwd, a)];
        return t === undefined ? [`cat: ${a}: No such file`] : t.replace(/\n$/, "").split("\n");
      });
    },
    neofetch: () => [{
      card: w.mark,
      lines: [
        [hi(w.user), "@", hi(w.host)],
        dim("-".repeat(w.user.length + w.host.length + 1)),
        ...w.facts.map(([k, v, href]): Line => [hi(k.padEnd(10)), href ? { text: v, href } : v]),
        "",
        { swatches: true },
      ],
    }],
    open: ([name]) => {
      const to = name && Object.hasOwn(w.links, name.toLowerCase()) ? w.links[name.toLowerCase()] : undefined;
      if (!to) return [[dim("usage: open NAME. Names: "), ...Object.keys(w.links).flatMap((k, i): Seg[] => [...(i ? [" "] : []), run(k, `open ${k}`)])]];
      return { out: [[dim("opening "), { text: to.replace(/^mailto:/, ""), href: to }]], fx: { open: to } };
    },
    view: ([p]) => {
      const t = p === undefined ? undefined : w.files[join(cwd, p)];
      if (t === undefined) return [p ? `view: ${p}: No such file` : "usage: view FILE"];
      viewing = { name: p, lines: t.replace(/\n$/, "").split("\n") };
      return { out: [], fx: { takeover: screen(`"${p}" [readonly]`) } };
    },
    rain: () => ({ out: [], fx: { overlay: "rain" } }),
    theme: ([v]) => (v === "day" || v === "night" ? { out: [], fx: { theme: v } } : ["usage: theme day|night"]),
    palette: ([v]) => (v === "operator" || v === "phosphor" ? { out: [], fx: { palette: v } } : ["usage: palette operator|phosphor"]),
    reboot: () => ({ out: [], fx: { navigate: "?boot=1" } }),
    clear: () => ({ out: [], fx: { clear: true } }),
    exit: () => ({ out: [], fx: { exit: true } }),
  };
  const screen = (message: string) => ({ name: "view", lines: viewing!.lines, message, announce: "view. Press q, or type colon q and press Enter, to leave." });
  const leave = (): Result => {
    viewing = null;
    return { out: [], fx: { takeover: null } };
  };

  return {
    prompt: () => ({ user: w.user, host: w.host, cwd: tilde(cwd), shell: "sh" }),
    motd: () => [[dim("Type "), run("help"), dim(" to see what you can run. "), run("exit"), dim(" leads to the other reading.")]],
    exec(input) {
      const line = input.trim();
      if (viewing) return /^:q!?$/.test(line) ? leave() : { out: [], fx: { takeover: screen(`Not an editor command: ${line}`) } };
      if (!line) return { out: [] };
      const [name, ...args] = line.split(/\s+/);
      const cmd = Object.hasOwn(cmds, name) ? cmds[name] : undefined;
      if (!cmd) return { out: [[`demo: command not found: ${name}. Try `, run("help")]] };
      const r = cmd(args);
      return Array.isArray(r) ? { out: r } : r;
    },
    complete(line) {
      const parts = line.trimStart().split(/\s+/);
      const word = parts.at(-1)!;
      if (parts.length === 1) return NAMES.filter((n) => n.startsWith(word)).map((n) => `${n} `);
      const at = word.lastIndexOf("/") + 1;
      const dir = join(cwd, word.slice(0, at) || ".");
      return entries(dir).filter((e) => e.name.startsWith(word.slice(at))).map((e) => word.slice(0, at) + e.name + (e.dir ? "/" : " "));
    },
    key(k) {
      if (!viewing) return { out: [] };
      if (k === "q" || k === "Escape") return leave();
      return { out: [], fx: { takeover: screen(k === "C-c" ? "Type :q and press Enter to leave" : "Read-only: press q to leave") } };
    },
  };
}
