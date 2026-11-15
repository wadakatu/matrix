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
