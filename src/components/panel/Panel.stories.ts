import Panel from "./Panel.astro";
import md from "./panel.md?raw";
import { contexts, docs, fixture, japanese } from "../../fixtures/stories.ts";

const slot = (lang: "en" | "ja") => ({ default: `<p>${fixture[lang].panel.text}</p>` });
export default { title: "Surfaces/Panel", component: Panel, ...docs(md) };

export const Default = { args: { title: fixture.en.panel.title, id: "fixture-panel", slots: slot("en") } };
export const WithoutHeading = { args: { label: fixture.en.panel.title, slots: slot("en") } };
export const Contexts = { args: { title: fixture.en.panel.title, slots: slot("en") }, ...contexts };
export const Japanese = { args: { title: fixture.ja.panel.title, id: "fixture-panel", slots: slot("ja") }, ...japanese };
