// <mx-terminal>: the live shell (04, "Terminal"). The markup is a recorded session; once the site gives
// the element an interpreter (`element.interpreter = …`) it prints a fresh session with the same
// renderer, keeps a real text field as the command line (history, completion, control keys, a block
// cursor), carries out the effects the interpreter asks for, and holds 機械用 to one viewport that
// follows `visualViewport`. If it never goes live, the head script gives the recorded session its
// scrolling page back after `motion.shell.fallback`; going live later takes the viewport back.
// Ported from the prototype's `_term.ts`.
import { render, renderEcho, renderLogin, type Interpreter, type Item, type Result, type Takeover } from "../../lib/index.ts";
import { strings, type Lang } from "../../strings/index.ts";

const d = document.documentElement;
/** Tab-scoped, like the prototype's: what was typed, and the guide line's ×. */
export const HISTORY_KEY = "mx-history";
export const GUIDE_KEY = "mx-guide";
const store = (key: string, value?: string) => {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch {}
  return null;
};
const still = () => d.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;

export class MxTerminal extends HTMLElement {
  #sh: Interpreter | null = null;
  #live = false;
  #off = new AbortController();
  #history: string[] = [];
  #at = 0;
  #draft = "";
  #escaped = false;
  #takeover: Takeover | null = null;
  #overlay: ((e?: Event) => void) | null = null;

  /** The site's interpreter, for the browser. Setting it starts the live shell. */
  get interpreter(): Interpreter | null {
    return this.#sh;
  }
  set interpreter(sh: Interpreter | null) {
    this.#sh = sh;
    if (sh && this.isConnected) this.#start();
  }

  connectedCallback() {
    if (store(GUIDE_KEY) === "off") this.#part("guide").hidden = true;
    if (this.#sh) this.#start();
  }

  disconnectedCallback() {
    this.#overlay?.();
    this.#off.abort();
    this.#live = false;
  }

  #part<T extends HTMLElement = HTMLElement>(name: string): T {
    return this.querySelector<T>(`.mx-${name}`)!;
  }
  get #t() {
    return strings[(d.lang in strings ? d.lang : "en") as Lang];
  }
  get #input() {
    return this.#part<HTMLInputElement>("prompt-field input");
  }
  get #tty() {
    return this.#part("terminal-tty");
  }
  get #screen() {
    return this.#part("terminal-screen");
  }

  // ---------- printing: the markup the recorded session was built from ----------
  #html(items: Item[]) {
    return render(items, { newTab: this.#t.terminal.newTab });
  }
  #bottom = () => {
    const s = this.#screen;
    s.scrollTop = s.scrollHeight;
  };
  #print(items: Item[]) {
    this.#tty.insertAdjacentHTML("beforeend", this.#html(items));
    while (this.#tty.childElementCount > 500) this.#tty.firstElementChild!.remove(); // the scrollback has an end
    this.#bottom();
  }
  #echo(cmd: string, tail = "") {
    this.#tty.insertAdjacentHTML("beforeend", renderEcho(this.#sh!.prompt(), cmd, tail));
  }
  /** The login command: its card in a `<details>`, closed on a phone so the prompt has the screen. */
  #login(cmd: string) {
    const t = this.#t.terminal;
    const p = this.#sh!.prompt();
    const r = this.#sh!.exec(cmd);
    this.#tty.insertAdjacentHTML("beforeend", renderLogin(t.login, `${t.login} ${this.dataset.login}`, renderEcho(p, cmd) + this.#html(r.out)));
    const card = this.#tty.lastElementChild as HTMLDetailsElement;
    // Engines without ::details-content would show a closed disclosure from 720px.
    if (matchMedia("(width >= 720px)").matches) card.open = true;
    card.addEventListener("toggle", () => requestAnimationFrame(this.#bottom));
    this.#bottom();
  }

  // ---------- the command line ----------
  /** The block cursor: where the caret is, showing the character under it in reverse. */
  #caret = () => {
    requestAnimationFrame(() => {
      const input = this.#input, mirror = this.#part("prompt-mirror"), cur = this.#part("prompt-cursor");
      const i = input.selectionStart ?? input.value.length;
      mirror.textContent = input.value.slice(0, i);
      cur.textContent = Array.from(input.value.slice(i))[0] ?? " ";
      cur.style.transform = `translateX(${mirror.offsetWidth - input.scrollLeft}px)`;
      cur.hidden = input.selectionEnd !== i;
      // Every keystroke starts the five blinks again, then it rests lit.
      cur.removeAttribute("data-blink");
      void cur.offsetWidth;
      cur.setAttribute("data-blink", "");
    });
  };
  #refresh() {
    const sh = this.#sh!, p = sh.prompt(), t = this.#t.terminal;
    const ps = this.querySelector<HTMLElement>(".mx-prompt .mx-prompt-ps")!;
    ps.hidden = !!this.#takeover || !!this.#overlay;
    const text = `${p.user}@${p.host}:${p.cwd}`;
    const who = this.#part("prompt-who");
    if (who.textContent !== text) who.textContent = text;
    const name = this.#takeover?.name ?? (this.#overlay ? "rain" : p.shell ?? "sh");
    this.#part("modeline-where").textContent = `0:${name}* ${this.#overlay ? (still() ? t.rain.still : t.rain.where) : p.cwd}`;
    store(HISTORY_KEY, JSON.stringify(this.#history.slice(-200)));
    this.#at = this.#history.length;
    this.#caret();
  }
  #show(r: Result) {
    this.#print(r.out);
    const fx = r.fx ?? {};
    if (fx.clear) this.#tty.replaceChildren();
    const press = (action: string, on: boolean) => {
      const b = document.querySelector<HTMLButtonElement>(`.mx-control[data-action="${action}"]`);
      if (b && (b.getAttribute("aria-pressed") === "true") !== on) b.click();
    };
    if (fx.theme) press("theme", fx.theme === "day");
    if (fx.palette) press("palette", fx.palette === "operator");
    // Only a key or a tap may open a window. A command that arrived in the address (?run=) just prints its link.
    if (fx.open && navigator.userActivation?.isActive) {
      if (/^mailto:/i.test(fx.open)) location.href = fx.open;
      else window.open(fx.open, "_blank", "noopener");
    }
    if ("takeover" in fx) this.#view(fx.takeover ?? null);
    if (fx.overlay === "rain") this.#rain();
    if (fx.navigate) {
      const root = this.closest("mx-root") as (HTMLElement & { carry?: (h: string) => string }) | null;
      const to = new URL(fx.navigate, location.href).href;
      location.href = root?.carry ? root.carry(to) : to;
    }
    // Leaving is the header's own 人間用 link, so the change (and its motion) is the page's.
    if (fx.exit) (document.querySelector<HTMLElement>('.mx-header a[data-to="human"]') ?? this.#part("modeline-way")).click();
    this.#refresh();
  }
  /** Run one line, as if typed. `remember` is false for the login command and `?run=`. */
  run(cmd: string, remember = true) {
    if (!this.#sh || this.#overlay) return;
    if (!this.#takeover) this.#echo(cmd);
    this.#input.value = "";
    const r = this.#sh.exec(cmd);
    if (remember && cmd.trim() && !this.#takeover) this.#history.push(cmd);
    this.#show(r);
  }
  #recall(step: number) {
    if (this.#takeover || this.#overlay) return;
    const input = this.#input;
    if (this.#at === this.#history.length) this.#draft = input.value;
    this.#at = Math.min(Math.max(this.#at + step, 0), this.#history.length);
    input.value = this.#history[this.#at] ?? this.#draft;
    input.setSelectionRange(input.value.length, input.value.length);
    this.#caret();
  }
  #tab() {
    const input = this.#input, line = input.value;
    if (this.#takeover) return;
    const cands = this.#sh!.complete(line);
    if (!cands.length) return;
    const word = line.match(/\S*$/)![0];
    const common = cands.reduce((a, b) => {
      let i = 0;
      while (i < a.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
    const next = line.slice(0, line.length - word.length) + common;
    if (next !== line) input.value = next;
    else if (cands.length > 1) {
      this.#echo(line);
      this.#print([cands.map((c) => c.trim()).join("  ")]);
    }
    this.#caret();
  }
  #interrupt() {
    if (this.#takeover && this.#sh!.key) return this.#show(this.#sh!.key("C-c"));
    this.#echo(this.#input.value, "^C");
    this.#input.value = this.#draft = "";
    this.#at = this.#history.length;
    this.#bottom();
    this.#caret();
  }
  #press(key: string) {
    if (key === "Tab") this.#tab();
    else if (key === "C-c") this.#interrupt();
    else this.#recall(key === "ArrowUp" ? -1 : 1);
  }
  #key = (e: KeyboardEvent) => {
    if (e.isComposing) return; // the input method owns Enter, Tab and the arrows while it composes
    const input = this.#input, k = e.key, ctrl = e.ctrlKey && !e.metaKey && !e.altKey, was = this.#escaped, end = input.value.length;
    this.#escaped = k === "Escape";
    if (k === "Tab") {
      // Tab completes only when there is something to complete. On an empty line, with Shift, or after Escape, focus moves on.
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || was || !input.value || input.selectionStart !== end) return;
      e.preventDefault();
      this.#tab();
    } else if (k === "ArrowUp" || k === "ArrowDown") {
      e.preventDefault();
      this.#recall(k === "ArrowUp" ? -1 : 1);
    } else if (k === "PageUp" || k === "PageDown") {
      e.preventDefault();
      this.#screen.scrollBy({ top: (k === "PageUp" ? -0.9 : 0.9) * this.#screen.clientHeight });
    } else if (k === "Escape" && this.#takeover && this.#sh!.key) {
      input.value = "";
      this.#show(this.#sh!.key("Escape"));
    } else if (ctrl && k === "c") {
      // Where Ctrl+C copies (Windows, Linux), a selection still copies. With nothing selected it cancels.
      if (input.selectionStart !== input.selectionEnd || String(getSelection())) return;
      e.preventDefault();
      this.#interrupt();
    } else if (ctrl && k === "l") {
      e.preventDefault();
      if (!this.#takeover) this.#tty.replaceChildren();
    } else if (ctrl && k === "u") {
      e.preventDefault();
      input.value = input.value.slice(input.selectionStart ?? 0);
      input.setSelectionRange(0, 0);
    } else if (ctrl && (k === "a" || k === "e")) {
      e.preventDefault();
      const at = k === "a" ? 0 : end;
      input.setSelectionRange(at, at);
    } else if (ctrl && k === "d" && !input.value && !this.#takeover) {
      e.preventDefault();
      this.run("exit", false);
    }
    this.#caret();
  };

  // ---------- what commands can ask of the page ----------
  #view(v: Takeover | null) {
    const box = this.#part("takeover");
    const opening = !!v && !this.#takeover;
    this.#takeover = v;
    box.hidden = !v;
    if (!v) return this.#bottom();
    const status = document.querySelector(".mx-status");
    if (opening && status && v.announce) status.textContent = v.announce;
    const tildes = Object.assign(document.createElement("span"), { textContent: "~\n".repeat(60) });
    tildes.dataset.tone = "dim";
    this.#part("takeover-buffer").replaceChildren(v.lines.map((l) => `${l}\n`).join(""), tildes);
    this.#part("takeover-message").textContent = v.message;
  }
  /** The page's own rain over the whole screen, until any key or tap. */
  #rain() {
    const stop = (e?: Event) => {
      e?.preventDefault();
      delete this.dataset.overlay;
      removeEventListener("keydown", stop, true);
      removeEventListener("pointerdown", stop, true);
      this.#overlay = null;
      if (this.#live) this.#refresh();
    };
    this.#overlay = stop;
    this.dataset.overlay = "rain";
    const status = document.querySelector(".mx-status");
    if (status) status.textContent = still() ? this.#t.terminal.rain.sayStill : this.#t.terminal.rain.say;
    addEventListener("keydown", stop, true);
    addEventListener("pointerdown", stop, true);
  }

  // ---------- the window: one viewport, also when a phone's keyboard takes part of it ----------
  #fit = () => {
    const vv = window.visualViewport;
    if (!vv) return;
    // Pinch zoom changes height and scale together; a keyboard changes height alone.
    const h = vv.height * vv.scale;
    d.style.setProperty("--mx-vvh", `${h}px`);
    this.toggleAttribute("data-keyboard", h < innerHeight - 120);
    // Locked (05, "lets go when it cannot fit"): the window stays at the top; the session scrolls inside.
    if (d.dataset.reading === "machine" && matchMedia("(height >= 480px)").matches) {
      scrollTo(0, 0);
      this.#bottom();
    }
  };
  #clock = () => {
    this.#part("modeline-time").textContent = `${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" }).format(new Date())} JST`;
  };
  #arrive = () => {
    this.#fit();
    this.#bottom();
    // Ready to type, but a phone shows the screen before its keyboard.
    if (matchMedia("(pointer: fine)").matches) this.#input.focus({ preventScroll: true });
  };

  #start() {
    if (this.#live) return;
    this.#live = true;
    const { signal } = (this.#off = new AbortController());
    const sh = this.#sh!, input = this.#input;
    const saved: unknown = JSON.parse(store(HISTORY_KEY) ?? "[]");
    this.#history = Array.isArray(saved) ? saved.filter((h): h is string => typeof h === "string") : [];

    this.#part("prompt").addEventListener("submit", (e) => {
      e.preventDefault();
      this.run(input.value);
    }, { signal });
    input.addEventListener("keydown", this.#key, { signal });
    input.addEventListener("input", (e) => {
      // In a takeover, keys outside its command line act at once.
      if (this.#takeover && sh.key && !(e as InputEvent).isComposing && !input.value.startsWith(":")) {
        const keys = Array.from(input.value);
        input.value = "";
        for (const k of keys) if (this.#takeover) this.#show(sh.key(k));
      }
      this.#caret();
    }, { signal });
    for (const type of ["keyup", "click", "focus", "blur", "select"]) input.addEventListener(type, this.#caret, { signal });
    document.addEventListener("selectionchange", () => document.activeElement === input && this.#caret(), { signal });
    // Taps: suggested commands, the keys a phone lacks, and commands in the output. Focus (and a
    // phone's keyboard) stays where it is.
    this.addEventListener("mousedown", (e) => {
      if ((e.target as Element).closest("[data-run], [data-key]")) e.preventDefault();
    }, { signal });
    this.addEventListener("click", (e) => {
      const t = e.target as Element, b = t.closest<HTMLElement>("[data-run], [data-key]");
      if (b?.dataset.key) this.#press(b.dataset.key);
      else if (b) this.run(b.dataset.run!);
      // A click on the screen is a click into the terminal, unless it ended a selection.
      else if (t.closest(".mx-terminal-screen") && !t.closest("a, button, input, summary") && getSelection()?.isCollapsed) input.focus({ preventScroll: true });
    }, { signal });
    this.#part("guide-hide").addEventListener("click", () => {
      store(GUIDE_KEY, "off");
      this.#part("guide").hidden = true;
      input.focus({ preventScroll: true });
    }, { signal });
    window.visualViewport?.addEventListener("resize", this.#fit, { signal });
    window.visualViewport?.addEventListener("scroll", this.#fit, { signal });
    const tick = setInterval(this.#clock, 20000);
    signal.addEventListener("abort", () => clearInterval(tick));
    addEventListener("mx:reading", (e) => (e as CustomEvent).detail === "machine" && this.#arrive(), { signal });

    this.#tty.replaceChildren();
    this.#print(sh.motd());
    // The first command is the login command, or what the address asked for. Neither was typed.
    const q = new URLSearchParams(location.search);
    const first = (q.get("run") ?? this.dataset.first ?? "").slice(0, 200);
    if (first && first === this.dataset.first && !q.has("run") && this.dataset.login) this.#login(first);
    else if (first) this.run(first, false);
    this.#refresh();
    this.#tty.setAttribute("role", "log"); // from here on, new output is announced
    this.#clock();
    d.dataset.shell = "live"; // a shell that arrives late takes its one viewport back
    if (d.dataset.reading === "machine") this.#arrive();
    else this.#fit();
  }
}
if (!customElements.get("mx-terminal")) customElements.define("mx-terminal", MxTerminal);
