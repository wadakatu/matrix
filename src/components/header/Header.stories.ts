import Header from "./Header.astro";
import Switch from "../switch/Switch.astro";
import md from "./header.md?raw";
import { contexts, docs, fixture, japanese, narrow } from "../../fixtures/stories.ts";

const sw = (current: "human" | "machine") => ({ switch: { component: Switch, props: { to: { human: "#human", machine: "#machine" }, current, lang: "en" } } });
const args = (lang: "en" | "ja", current: "human" | "machine" = "human") => ({ mark: fixture[lang].mark, nav: fixture[lang].nav, alternate: lang === "en" ? "/ja/" : "/", lang, slots: sw(current) });
export default { title: "Chrome/Header", component: Header, ...docs(md, { chrome: true }) };

export const Default = { args: args("en") };
export const Machine = { args: args("en", "machine"), globals: { reading: "machine" } };
export const WithoutTwin = { args: { ...args("en"), alternate: undefined } };
export const Contexts = { args: args("en"), ...contexts };
export const Japanese = { args: args("ja"), ...japanese };
export const Narrow = { args: args("en"), ...narrow };
export const NarrowOpen = { args: { ...args("en"), open: true }, ...narrow };
export const NarrowMachine = { args: args("en", "machine"), globals: { ...narrow.globals, reading: "machine" } };
export const NarrowJapanese = { args: { ...args("ja"), open: true }, globals: { ...narrow.globals, ...japanese.globals } };
