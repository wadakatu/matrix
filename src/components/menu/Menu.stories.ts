import Menu from "./Menu.astro";
import MenuContent from "../../fixtures/MenuContent.astro";
import md from "./menu.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

const slots = (lang: "en" | "ja") => ({ default: { component: MenuContent, props: { lang } } });
export default { title: "Chrome/Menu", component: Menu, ...docs(md) };

export const Default = { args: { slots: slots("en") } };
export const Narrow = { args: { slots: slots("en") }, ...narrow };
export const NarrowOpen = { args: { open: true, slots: slots("en") }, ...narrow };
export const Contexts = { args: { slots: slots("en") }, ...contexts };
export const Japanese = { args: { lang: "ja", open: true, slots: slots("ja") }, globals: { ...narrow.globals, ...japanese.globals } };
