import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./prose.md?raw";
import { articles } from "../../fixtures/articles.ts";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Prose", component: ReadingPart, ...docs(md, { chrome: true }) };

const c = articles.c.body;
const at = (id: string) => c.findIndex((b) => "id" in b && b.id === id);
/** Article C's blocks: text, then the tables, the task list and the footnotes. */
const text = c.slice(0, at("code"));
const tables = c.filter((b) => "table" in b);
const tasks = c.filter((b) => "tasks" in b);
const footnotes = [c[1], ...c.slice(-2)];

export const Default = { args: { part: "prose" } };
/** A blockquote, an ordered list, and lists inside lists. */
export const Text = { args: { part: "prose", blocks: text } };
/** Draft: one that fits, and one that scrolls at 390. */
export const Table = { args: { part: "prose", blocks: tables } };
export const NarrowTable = { args: { part: "prose", blocks: tables }, ...narrow };
/** Draft: a done and an open item. */
export const TaskList = { args: { part: "prose", blocks: tasks } };
/** Draft: two references and the section. */
export const Footnotes = { args: { part: "prose", blocks: footnotes } };
export const Narrow = { args: { part: "prose" }, ...narrow };
export const Contexts = { args: { part: "prose", blocks: [...text.slice(0, 4), ...tables.slice(0, 1), ...tasks, ...footnotes.slice(1)] }, ...contexts };
export const Japanese = { args: { part: "prose" }, ...japanese };
