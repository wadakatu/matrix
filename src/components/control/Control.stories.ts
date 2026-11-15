import Control from "./Control.astro";
import md from "./control.md?raw";
import { contexts, docs, focused, hovered, japanese } from "../../fixtures/stories.ts";

export default { title: "Chrome/Control", component: Control, ...docs(md, { chrome: true }) };

export const Default = { args: { action: "palette" } };
export const PalettePressed = { args: { action: "palette", pressed: true } };
export const Theme = { args: { action: "theme" } };
export const ThemePressed = { args: { action: "theme", pressed: true } };
export const Hold = { args: { action: "hold" } };
export const HoldChecked = { args: { action: "hold", checked: true } };
export const Focused = { args: { action: "palette" }, ...focused(".mx-control") };
export const Hovered = { args: { action: "palette" }, ...hovered(".mx-control") };
export const HoldFocused = { args: { action: "hold" }, ...focused("input") };
export const HoldHovered = { args: { action: "hold" }, ...hovered(".mx-control") };
export const Button = { args: { slots: { default: "Fixture button" } } };
export const Link = { args: { href: "/fixture/", slots: { default: "Fixture link" } } };
export const Contexts = { args: { action: "palette", pressed: true }, ...contexts };
export const HoldContexts = { args: { action: "hold" }, ...contexts };
export const Japanese = { args: { action: "theme", lang: "ja" }, ...japanese };
export const HoldJapanese = { args: { action: "hold", lang: "ja" }, ...japanese };
export const PaletteJapanese = { args: { action: "palette", lang: "ja", pressed: true }, ...japanese };
