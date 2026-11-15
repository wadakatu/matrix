import Control from "./Control.astro";
import md from "./control.md?raw";
import { contexts, docs, japanese } from "../../fixtures/stories.ts";

export default { title: "Chrome/Control", component: Control, ...docs(md) };

export const Default = { args: { action: "palette" } };
export const PalettePressed = { args: { action: "palette", pressed: true } };
export const Theme = { args: { action: "theme" } };
export const ThemePressed = { args: { action: "theme", pressed: true } };
export const Hold = { args: { action: "hold" } };
export const HoldChecked = { args: { action: "hold", checked: true } };
export const Button = { args: { slots: { default: "Fixture button" } } };
export const Link = { args: { href: "/fixture/", slots: { default: "Fixture link" } } };
export const Contexts = { args: { action: "palette", pressed: true }, ...contexts };
export const HoldContexts = { args: { action: "hold" }, ...contexts };
export const Japanese = { args: { action: "theme", lang: "ja" }, ...japanese };
export const HoldJapanese = { args: { action: "hold", lang: "ja" }, ...japanese };
export const PaletteJapanese = { args: { action: "palette", lang: "ja", pressed: true }, ...japanese };
