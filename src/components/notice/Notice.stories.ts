import NoticeDemo from "../../fixtures/NoticeDemo.astro";
import md from "./notice.md?raw";
import { contexts, docs, fixture, focused, hovered, japanese } from "../../fixtures/stories.ts";

// Notice.astro is a whole document; its stories show the body it renders, inside `.mx-notice`.
export default { title: "Surfaces/Notice", component: NoticeDemo, ...docs(md, { chrome: true }) };

const links = fixture.en.notice;
export const Default = { args: { kind: "not-found", links } };
export const Offline = { args: { kind: "offline", links } };
export const Focused = { args: { kind: "offline", links }, ...focused("a") };
export const Hovered = { args: { kind: "not-found", links }, ...hovered("a") };
export const Contexts = { args: { kind: "offline", links }, ...contexts };
export const Japanese = { args: { kind: "offline", links: fixture.ja.notice, lang: "ja" }, ...japanese };
