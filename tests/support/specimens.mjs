// The specimen set (04, "The specimen set"): one list, read by the verification matrix
// (tests/matrix.spec.mjs) and the visual tests, so a page added here is in every check.
// `reading`: the root's reading at load, or null for a document with one. `shell`: the page has
// <mx-terminal>. `still`: the query that holds the page still for a capture.
export const SPECIMENS = [
  { page: "home", name: "Machine landing", lang: "en", reading: "machine", rain: true, shell: true, article: false },
  { page: "human-home", name: "Human home", lang: "en", reading: "human", rain: true, shell: true, article: false },
  { page: "projects", name: "Projects, 機械用", lang: "en", reading: "machine", rain: true, shell: true, article: false },
  { page: "human-projects", name: "Projects, 人間用", lang: "en", reading: "human", rain: true, shell: true, article: false },
  { page: "article-a", name: "Article A", lang: "ja", reading: null, rain: true, shell: false, article: true },
  { page: "article-b", name: "Article B", lang: "ja", reading: null, rain: true, shell: false, article: true },
  { page: "article-c", name: "Article C", lang: "ja", reading: null, rain: true, shell: false, article: true },
  { page: "blog", name: "Blog index", lang: "en", reading: null, rain: true, shell: false, article: false },
  { page: "moved", name: "Moved", lang: "en", reading: null, rain: false, shell: false, article: false },
  { page: "not-found", name: "Not found", lang: "en", reading: null, rain: false, shell: false, article: false },
  { page: "offline", name: "Offline", lang: "en", reading: null, rain: false, shell: false, article: false },
];
/** The four contexts as flags (03). */
export const CONTEXTS = { "phosphor-night": "", "phosphor-day": "theme=day", "operator-night": "palette=operator", "operator-day": "palette=operator&theme=day" };
/** Where the tests serve the build: the Storybook's path (06, "How a specimen is shown"). */
export const DIRS = { "/assets/": "assets", "/specimens/": "dist-specimens" };
export const path = (page) => `/specimens/${page}.html`;
/**
 * Moved leaves at once by design (its redirect is tested in chrome.spec), so the page-wide checks get
 * it without its replace and its refresh: the stub as a reader sees it for that moment.
 */
export async function holdMoved(page, root) {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(`${root}/dist-specimens/moved.html`, "utf8").replace(/<script>[^<]*location\.replace[^<]*<\/script>|<meta http-equiv="refresh"[^>]*>/g, "");
  await page.route(/\/specimens\/moved\.html/, (r) => r.fulfill({ contentType: "text/html", body: html }));
}
