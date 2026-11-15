import StreamsDemo from "../../fixtures/StreamsDemo.astro";
import md from "./streams.md?raw";
import { contexts, docs, japanese, narrow, still } from "../../fixtures/stories.ts";

export default { title: "Signature/Streams", component: StreamsDemo, ...docs(md) };

export const Default = { args: {} };
export const Rows = { args: { variant: "rows", count: 5 } };
export const Still = { args: {}, ...still };
export const Contexts = { args: {}, ...contexts };
export const RowsContexts = { args: { variant: "rows", count: 5 }, ...contexts };
export const Japanese = { args: { lang: "ja" }, ...japanese };
export const Narrow = { args: {}, ...narrow };
