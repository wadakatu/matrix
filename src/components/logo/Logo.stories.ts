import Logo from "./Logo.astro";
import md from "./logo.md?raw";
import { contexts, docs, fixture } from "../../fixtures/stories.ts";

const args = { src: fixture.en.mark.logo, alt: "The fixture station's mark" };
export default { title: "Chrome/Logo", component: Logo, ...docs(md) };

export const Default = { args };
export const Contexts = { args, ...contexts };
