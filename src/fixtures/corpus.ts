// The fixture corpus (06): invented names and sentences, plainly a fixture. wadakatu's real data
// stays in the site (01). Every story and specimen takes its words from here.
/** The real mark (09, task 2.3), served from assets/logo/ by Storybook and the specimen server. */
export const logo = "/assets/logo/logo-400.png";
export const fixture = {
  en: {
    mark: { href: "/", label: "fixture_", logo },
    nav: [
      { label: "Home", href: "/", current: "page" as const },
      { label: "Projects", href: "/projects/" },
      { label: "Blog", href: "/blog/" },
      { label: "About", href: "/about/" },
    ],
    footer: [
      { label: "station@example.com", href: "mailto:station@example.com" },
      { label: "GitHub", href: "https://github.com/example" },
      { label: "Logo by the fixture's designer", href: "https://example.com/credit" },
    ],
    panel: { title: "Fixture panel", text: "A panel of fixture text. It is a solid surface, so it can be read wherever the rain falls." },
    lede: "Three fixture projects and two fixture posts. Each sentence here is invented for the stories.",
    figures: [
      { key: "Fixture repos", value: 12 },
      { key: "Fixture forks", value: 3 },
      { key: "Checked by hand", value: "2026-11-15", datetime: "2026-11-15" },
    ],
    words: ["TypeScript", "Fixture CSS", "Astro", "Playwright"],
    links: [
      { label: "example.com/fixture-one", href: "https://example.com/fixture-one" },
      { label: "docs.example.com/fixture-one", href: "https://docs.example.com/fixture-one" },
    ],
    after: [
      { label: "All fixture projects", href: "/projects/" },
      { label: "Read the fixture blog", href: "/blog/" },
    ],
    log: ["feat: add the fixture station", "fix: keep the fixture panel solid", "docs: describe the fixture corpus"],
    meta: "TypeScript · 2026-11-15",
  },
  ja: {
    mark: { href: "/ja/", label: "fixture_", logo },
    nav: [
      { label: "ホーム", href: "/ja/", current: "page" as const },
      { label: "プロジェクト", href: "/ja/projects/" },
      { label: "ブログ", href: "/blog/" },
      { label: "概要", href: "/ja/about/" },
    ],
    footer: [
      { label: "station@example.com", href: "mailto:station@example.com" },
      { label: "GitHub", href: "https://github.com/example" },
      { label: "ロゴ: 見本のデザイナー", href: "https://example.com/credit" },
    ],
    panel: { title: "見本のパネル", text: "見本の文章を置いたパネルです。塗りつぶした面なので、雨が降るところでも読めます。" },
    lede: "見本のプロジェクトが三つと見本の記事が二つ。ここにある文はすべて見本として作ったものです。",
    figures: [
      { key: "見本のリポジトリ", value: 12 },
      { key: "見本のフォーク", value: 3 },
      { key: "手で確認した日", value: "2026-11-15", datetime: "2026-11-15" },
    ],
    words: ["型付きの見本", "見本の CSS", "見本の部品", "見本の試験"],
    links: [
      { label: "example.com/fixture-one", href: "https://example.com/fixture-one" },
      { label: "docs.example.com/fixture-one", href: "https://docs.example.com/fixture-one" },
    ],
    after: [
      { label: "見本のプロジェクト一覧", href: "/ja/projects/" },
      { label: "見本のブログを読む", href: "/blog/" },
    ],
    log: ["見本の局を追加", "見本のパネルを塗りつぶしたままにする", "見本のコーパスを説明する"],
    meta: "見本 · 2026-11-15",
  },
};

/**
 * What the Signature components are made of (L1, inside Storybook): the fixture's own phrases,
 * commit subjects, projects and posts. Shared by both languages, because a corpus is data, not chrome.
 */
const projects = [
  { name: "fixture-one", href: "https://example.com/fixture-one", lang: "TypeScript", blurb: "A fixture tool that lays out a station from a data file.", docs: "https://docs.example.com/fixture-one" },
  { name: "fixture-two", href: "https://example.com/fixture-two", lang: "PHP", blurb: "A fixture library for checking that tests are written first." },
  { name: "fixture-three", href: "https://example.com/fixture-three", lang: "Go", blurb: "A fixture command that prints a recorded session." },
  { name: "fixture-four", href: "https://example.com/fixture-four", lang: "CSS", blurb: "A fixture stylesheet for a terminal at night. 見本の配色", site: "https://example.com/fixture-four/site" },
  { name: "fixture-five", href: "https://example.com/fixture-five", lang: "Astro", blurb: "A fixture site built from two readings of one source." },
];
const posts = [
  { title: "見本の記事: 二つの表示を一つのデータから作る", date: "2026-11-01", category: "見本", href: "/blog/fixture-post-one/" },
  { title: "見本の記事: 雨を止めるボタンについて", date: "2026-10-15", category: "見本", href: "/blog/fixture-post-two/" },
];
const commits = [
  "feat: add the fixture station",
  "fix: keep the fixture panel solid",
  "docs: describe the fixture corpus",
  "feat(fixture-one): lay out the station from data",
  "refactor: name the fixture roles",
  "test: check the fixture readings",
  "chore: update the fixture lockfile",
  "fix(fixture-four): park the rain in the still",
];
export const signature = {
  person: { heading: "fixture_", role: "Fixture developer", location: "Fixture City", line1: "Builds fixture stations from data files.", line2: "Writes about them in fixture posts." },
  projects,
  posts,
  commits,
  /** A title that really has a commit in the log, for the title-to-commit reward. */
  pairs: { "fixture-one": "feat(fixture-one): lay out the station from data", "fixture-four": "fix(fixture-four): park the rain in the still" } as Record<string, string>,
  /** The rain's corpus: commit subjects, file paths, project lines and post titles, in both scripts. */
  phrases: [
    ...commits,
    ...projects.flatMap((p) => [p.name, p.blurb]),
    ...posts.map((p) => p.title),
    "src/fixtures/corpus.ts",
    "src/specimens/human-home.astro",
    "見本の局を追加",
    "見本のパネルを塗りつぶしたままにする",
    "見本のコーパスを説明する",
    "見本の雨は見本の言葉でできている",
    "見本の端末を夜に読む",
    "二つの表示、一つの見本",
  ],
};
