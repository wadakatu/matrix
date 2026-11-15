import Boot from "./Boot.astro";
import md from "./boot.md?raw";
import { docs, japanese, narrow } from "../../fixtures/stories.ts";
import { fixture, signature } from "../../fixtures/corpus.ts";

const { person, projects, posts } = signature;
const args = {
  lines: [
    { key: "name", text: person.heading },
    { key: "role", text: person.role },
    { key: "location", text: person.location },
    { key: "project", text: projects[0].name },
    { key: "post", text: posts[0].title },
  ],
  logo: fixture.en.mark.logo,
  to: { human: "#human", machine: "#machine" },
};
// The boot shows only while the root says so; its stories are its still (`data-boot="frozen"`).
const frozen = { parameters: { boot: "frozen" } };
export default { title: "Signature/Boot", component: Boot, ...docs(md, { chrome: true }) };

export const Default = { args, ...frozen };
export const Still = { args, ...frozen };
export const Contexts = { args, parameters: { boot: "frozen", contexts: true, framed: true } };
export const Japanese = { args, ...frozen, ...japanese };
export const Narrow = { args, ...frozen, ...narrow };
