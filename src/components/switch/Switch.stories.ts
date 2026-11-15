import Switch from "./Switch.astro";
import md from "./switch.md?raw";
import { contexts, docs, focused, hovered, japanese, still } from "../../fixtures/stories.ts";

const to = { human: "#human", machine: "#machine" };
const notes = { human: "the page", machine: "a shell" };
export default { title: "Chrome/Switch", component: Switch, ...docs(md, { chrome: true }) };

export const Default = { args: { to, current: "human" } };
export const MachineCurrent = { args: { to, current: "machine" }, globals: { reading: "machine" } };
export const Boot = { args: { to } };
export const Capsule = { args: { to, current: "human", variant: "capsule", notes } };
export const Hovered = { args: { to, current: "human" }, ...hovered('a[data-to="machine"]') };
export const Focused = { args: { to, current: "human" }, ...focused('a[data-to="human"]') };
export const Held = { args: { to, current: "human" }, globals: { motion: "held" } };
export const Still = { args: { to, current: "human" }, ...still };
export const Contexts = { args: { to, current: "human" }, ...contexts };
export const CapsuleContexts = { args: { to, current: "human", variant: "capsule", notes }, ...contexts };
export const Japanese = { args: { to, current: "human" }, ...japanese };
// The compact button lives in the header only: Header/Narrow and Signature/Readings/Narrow show it.
