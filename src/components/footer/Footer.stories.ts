import Footer from "./Footer.astro";
import md from "./footer.md?raw";
import { contexts, docs, fixture, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Chrome/Footer", component: Footer, ...docs(md) };

const row = { default: "<p>A row above the links (the shortcut's off switch goes here, task 3.6).</p>" };
export const Default = { args: { links: fixture.en.footer, slots: row } };
export const LinksOnly = { args: { links: fixture.en.footer } };
export const Contexts = { args: { links: fixture.en.footer }, ...contexts };
export const Japanese = { args: { links: fixture.ja.footer }, ...japanese };
export const Narrow = { args: { links: fixture.en.footer }, ...narrow };
