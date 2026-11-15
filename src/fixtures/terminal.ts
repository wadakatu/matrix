// The demo interpreter's world for stories and specimens (06): the fixture's own facts and files,
// plainly a fixture. The site's real shell and its world stay in the site (01).
import { demoInterpreter, type DemoWorld } from "../lib/index.ts";
import { fixture, logo, signature } from "./corpus.ts";

const { person, projects, posts } = signature;
const slug = (href: string) => href.split("/").filter(Boolean).pop()!;
export const world: DemoWorld = {
  user: "fixture",
  host: "example",
  mark: { src: logo, alt: "fixture_ logo", width: 400, height: 400 },
  facts: [
    ["Role", person.role],
    ["Location", person.location],
    ["Projects", String(projects.length)],
    ["Posts", String(posts.length)],
    ["Stack", fixture.en.words.join(", ")],
    ["Logo", "the fixture's designer", "https://example.com/credit"],
  ],
  files: {
    "about.txt": `${person.heading}\n${person.role}\n${person.line1}\n${person.line2}\n`,
    "contact.txt": "station@example.com\nhttps://github.com/example\n",
    ...Object.fromEntries(projects.map((p) => [`projects/${p.name}.md`, `# ${p.name}\n${p.lang}\n${p.blurb}\n${p.href}\n`])),
    ...Object.fromEntries(posts.map((p) => [`posts/${slug(p.href)}.md`, `${p.title}\n${p.date}\n${p.href}\n`])),
  },
  links: { github: "https://github.com/example", email: "mailto:station@example.com", site: "https://example.com/" },
};
export const demo = (cwd = ""): ReturnType<typeof demoInterpreter> => demoInterpreter({ ...world, cwd });
/** The recorded sessions of the two specimen routes, as the prototype's: Home in ~, Projects in ~/projects. */
export const sessions = {
  home: ["neofetch", "cat about.txt", "ls -l projects", ...projects.map((p) => `cat projects/${p.name}.md`), "ls -l posts", "cat contact.txt"],
  projects: ["ls -l", ...projects.map((p) => `cat ${p.name}.md`), "cat ~/contact.txt"],
};
export const chips = ["help", "ls", "cat about.txt", "ls -l projects", "neofetch", "view about.txt", "clear", "exit"];
export const login = `${person.heading}, ${person.role}`;
