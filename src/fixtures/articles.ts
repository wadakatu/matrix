// The Article specimens' fixture (04, "The Article specimens"): invented Japanese of like length in
// the structure of the prototype's two posts, and Article C, every element neither has. Nothing is
// copied from the posts; slugs keep their shape (14 hexadecimal characters); addresses are example.com.
import badge from "./images/badge.svg?url";
import room from "./images/room.svg?url";
import servers from "./images/servers.svg?url";
import sign from "./images/sign.svg?url";
import timetable from "./images/timetable.svg?url";
import { at } from "../specimens/base.ts";

/** A run inside a paragraph or a list item. */
export type Inline =
  | string
  | ["code" | "strong", string]
  | ["a", string, string]
  | ["ref", string]
  | ["img", Image]
  | ["fn", number]
  | ["ul" | "ol", Inline[][]];
export type Block =
  | { h: 2 | 3 | 4; text: string; id: string }
  | { p: Inline[] }
  | { ul: Inline[][] }
  | { ol: Inline[][] }
  | { code: string; language?: string; title?: string; diff?: boolean }
  | { hr: true }
  | { img: Image }
  | { quote: Block[] }
  | { callout: Block[]; alert?: boolean }
  | { details: string; open?: boolean; body: Block[] }
  | { table: { head: string[]; align?: ("left" | "right" | "center" | null)[]; rows: string[][] } }
  | { tasks: [boolean, string][] }
  | { footnotes: Inline[][] };
export interface Image {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  minutes: number;
  tags: string[];
  body: Block[];
}

/** Fixture images, drawn for the purpose in the five proportions of the posts' images (05: real alt). */
const images = {
  servers: { src: servers, alt: "見本の接続一覧を模した図。暗い帯の中に、緑の丸と三本の横線が並んでいる。", width: 491, height: 77 },
  timetable: { src: timetable, alt: "見本の時間割を模した図。三つの段に区切られた表に、青い枠が五つ置かれている。", width: 750, height: 235 },
  badge: { src: badge, alt: "見本の名札を模した図。青い紐の下に白い札があり、黒い帯と灰色の丸と線が描かれている。", width: 250, height: 333 },
  sign: { src: sign, alt: "見本の案内板を模した図。二本の脚に立つ白い板に、青い掲示が貼られている。", width: 250, height: 334 },
  room: { src: room, alt: "見本の会議室を模した図。楕円の机を四つの丸い席が囲み、壁に青い画面がある。", width: 350, height: 262 },
} satisfies Record<string, Image>;

const SENTENCES = [
  "見本の局では、一つのデータから二つの表示を作ります。",
  "この段落は見本として書いた文で、実在の記事ではありません。",
  "設定のファイルを読み、端末と頁の両方に同じ事実を並べます。",
  "手順は短く分けて、一つずつ確かめながら進めるのが見本の流儀です。",
  "見本の雨は見本の言葉でできていて、読む文字の上には降りません。",
  "記事の長さを本物に近づけるため、見本の文をいくつも重ねています。",
  "ここに出てくる名前や数字は、どれも見本のために作ったものです。",
  "見本のコマンドを打つと、記録しておいたセッションが表示されます。",
  "うまく動かないときは、まず見本の設定を最初から読み直します。",
  "見本の端末は夜に読みやすいよう、暗い地に明るい文字で描かれます。",
  "会場の見本の部屋には、見本の参加者が少しずつ集まってきました。",
  "見本の会合では、見本の仕様について長い時間をかけて話しました。",
  "その日の終わりには、見本の記録を読み返して要点を書き出しました。",
  "見本の道具は、入れてすぐに使えるところが良いと感じています。",
  "次の節では、見本の手元で同じことを試す方法を説明します。",
  "見本の仲間に聞くと、たいていの疑問はすぐに解けました。",
];
/** `n` characters of fixture Japanese, cut from the sentences above from the `at`-th on. */
export function ja(n: number, at = 0): string {
  let s = "";
  for (let i = at; Array.from(s).length < n; i++) s += SENTENCES[i % SENTENCES.length];
  const cut = Array.from(s).slice(0, n).join("");
  return cut.endsWith("。") ? cut : cut.slice(0, -1).replace(/[、の。]+$/, "") + "。";
}
const p = (n: number, at: number, ...more: Inline[]): Block => ({ p: [ja(n, at), ...more] });

const A: Article = {
  slug: "3fa91c07d2b8e6",
  title: "🚀 Fixture Tool × Sample Station：もう前のバージョンまで戻さなくても良いのか...?",
  date: "2025-07-31",
  category: "技術",
  minutes: 6,
  tags: ["fixture", "station", "sample", "fixturetool", "example"],
  body: [
    { h: 2, id: "intro", text: "📖 はじめに - 見本ツールの応答が遅くなった話" },
    p(54, 0),
    { ul: [[ja(23, 1)], [ja(22, 2)], [ja(25, 3)]] },
    p(61, 4),
    { p: [["ref", "https://example.com/fixture/tool/issues/4120"]] },
    { p: [ja(40, 5), ["code", "fixture"], "と", ["code", "fixturex"], ja(40, 6)] },
    { p: [["strong", "そこで見つけたのが「見本の局」です。"]] },
    { h: 2, id: "what", text: "🎯 見本の局とは？" },
    p(120, 7),
    p(153, 8),
    p(46, 9),
    { p: [["ref", "https://example.com/fixture/station/README.md"]] },
    { h: 2, id: "setup", text: "🛠 見本の環境での準備" },
    p(45, 10),
    { h: 3, id: "before", text: "📋 前提条件" },
    { ul: [[ja(28, 11)], [ja(21, 12)], [ja(18, 13)]] },
    { h: 3, id: "way-1", text: "方法1: 見本コマンドで直接動かす（推奨）" },
    p(63, 14),
    { p: [["ref", "https://example.com/fixture/station/README.md#using-fixturex"]] },
    { h: 4, id: "way-1-step-1", text: "Step 1: 見本の道具を入れる" },
    { code: "# 見本の道具を入れる\nfixture-pkg install fx", language: "bash" },
    { h: 4, id: "way-1-step-2", text: "Step 2: 見本端末への登録" },
    p(19, 0),
    { code: "fixture-tool stations add fixture-station -- fixturex --from git+https://example.com/fixture/station fixture-station start --ctx fx", language: "bash" },
    { h: 3, id: "way-2", text: "方法2: 手元に置いて動かす" },
    p(37, 1),
    { p: [["ref", "https://example.com/fixture/station/README.md#local-installation"]] },
    { h: 4, id: "way-2-step-1", text: "Step 1: 見本の取得と導入" },
    {
      code: "# 作業の場所を作る\nmkdir -p ~/fixture\ncd ~/fixture\n# 見本の局を取ってくる\nfixture-get https://example.com/fixture/station.git\ncd station\nfixture-pkg sync\n# 局を起動する\nfixture-pkg run fixture-station",
      language: "bash",
    },
    { h: 4, id: "way-2-step-2", text: "Step 2: 見本端末への登録" },
    { code: "# 見本の場所で実行する\nfixture-tool stations add fixture-station -- fixture-pkg run --directory ~/fixture/station fixture-station", language: "bash" },
    { h: 3, id: "way-3", text: "方法3: 見本の箱(⚠️)" },
    { p: [["strong", "注意"], ": " + ja(60, 3)] },
    { p: [["ref", "https://example.com/fixture/station/README.md#using-a-box-experimental"]] },
    { code: "# 見本の箱を使う\nfixture-box run --rm -i \\\n  --network host \\\n  -v ~/fixture:/work \\\n  example/fixture-station", language: "bash" },
    { h: 3, id: "way-4", text: "方法4: 待ち受けモード（確かめる用）" },
    { p: [["ref", "https://example.com/fixture/station/README.md#listen-mode"]] },
    p(21, 5),
    {
      code: "# 待ち受けモードで局を起動する\nfixture-pkg run fixture-station --transport listen --port 9121\n\n# 見本端末の設定で接続先を指定する\n# http://localhost:9121/listen を指定\nfixture-tool stations add --transport listen fixture-station http://localhost:9121/listen\n",
      language: "bash",
    },
    { h: 3, id: "check", text: "✅ 動作確認" },
    { code: "# 局の状態を確かめる\nfixture-tool stations list\n\n# 出力の例：\n# Stations:\n# - fixture-station (connected) ✅", language: "bash" },
    { p: [ja(23, 6), ["code", "https://example.com/fixture/station/dashboard/index.html"], ja(12, 7)] },
    { h: 2, id: "use", text: "🎮 実際の使い方" },
    { h: 3, id: "use-init", text: "1️⃣ 見本の初期化" },
    p(24, 8),
    { code: "# 見本の場所で\ncd /path/to/fixture\n\n# 見本端末を起動\nfixture-tool", language: "bash" },
    { hr: true },
    { p: [ja(14, 9), ["code", "/fx"], ja(24, 10)] },
    { p: [ja(14, 11), ["img", images.servers]] },
    { hr: true },
    p(28, 12),
    { code: "見本の局で、見本の場所を最初から読み込んで" },
    p(9, 13),
    { code: "見本の局の、最初の案内を読んでください" },
    { hr: true },
    p(147, 14),
    { h: 2, id: "settings", text: "🔧 見本の設定の見直し" },
    { h: 3, id: "settings-all", text: "全体の設定" },
    { p: [["code", "~/.fixture/fixture_config.yml"], ja(14, 15)] },
    { p: [["ref", "https://example.com/fixture/station/src/fixture/resources/fixture_config.template.yml"]] },
    { h: 3, id: "settings-one", text: "見本ごとの設定" },
    { p: [["code", ".fixture/project.yml"], ja(18, 1)] },
    { p: [["ref", "https://example.com/fixture/station/.fixture/project.yml"]] },
    { h: 2, id: "more", text: "🚀 さらに使う" },
    { h: 3, id: "more-tools", text: "他の道具との連携" },
    p(69, 3),
    { ul: [[["strong", "見本の編集器"], ": Alpha, Beta, Gamma"], [["strong", "見本の端末"], ": Delta, Echo, Foxtrot"], [["strong", "そのほか"], ": Golf, Hotel"]] },
    { h: 3, id: "more-people", text: "見本の仲間と相談先" },
    { ul: [[["a", "Fixture Repository", "https://example.com/fixture/station"]], [["a", "Changelog", "https://example.com/fixture/station/CHANGELOG.md"]], [["a", "Roadmap", "https://example.com/fixture/station/ROADMAP.md"]]] },
    { h: 2, id: "summary", text: "🎯 まとめ" },
    p(169, 4),
    p(61, 5),
    { p: [ja(72, 6), ["ref", "https://example.com/fixture-writer/articles/7c1e4b9a2f"]] },
  ],
};

const B: Article = {
  slug: "b6e20d4f9a13c8",
  title: "見本会議 FXCON 2025参加レポ （見本の仕様ってどうやってできてるの？）",
  date: "2025-12-10",
  category: "生活",
  minutes: 10,
  tags: ["fixture", "fxcon", "samples", "event", "fixturereport"],
  body: [
    { h: 2, id: "intro", text: "はじめに" },
    { p: [ja(42, 0), ["code", "FXCN"], ja(17, 1)] },
    { p: [["ref", "https://example.com/2025/FXCON/"]] },
    p(54, 2),
    p(114, 3),
    { h: 2, id: "about", text: "FXCONとは" },
    { p: [ja(6, 4), ["code", "Fixture Conference Plenary Assembly Club"], ja(64, 5)] },
    p(47, 6),
    { p: [["ref", "https://example.com/2025/FXCON/schedule.html"]] },
    p(32, 7),
    { img: images.timetable },
    { h: 2, id: "impressions", text: "参加した感想" },
    { p: [ja(66, 8), ["code", "見本の会議を知る"]] },
    p(19, 9),
    p(89, 10),
    { p: [ja(12, 11), ["img", images.badge]] },
    { hr: true },
    p(82, 12),
    p(184, 13),
    p(25, 14),
    { h: 3, id: "day-1", text: "11/10 (月曜日)1日目" },
    p(51, 15),
    { img: images.sign },
    p(34, 0),
    { p: [["ref", "https://example.com/fixture-venue/access/index.html"]] },
    p(136, 1),
    { p: [ja(18, 2), ["ref", "https://example.com/2025/FXCON/rooms/fixture-room.html"]] },
    { hr: true },
    { p: [ja(97, 2), ["code", "fixture-assembly-group"]] },
    p(189, 3),
    { p: [ja(21, 4), ["ref", "https://fixtures.example.com/fixture-notes/"]] },
    p(69, 4),
    p(16, 5),
    { ul: [[ja(8, 6)], [ja(16, 7)], [ja(21, 8)]] },
    p(82, 9),
    p(85, 10),
    p(211, 11),
    { img: images.room },
    p(337, 12),
    p(38, 13),
    { h: 3, id: "day-2", text: "11/11 (火曜日)２日目" },
    p(123, 14),
    { p: [ja(34, 6), ["ref", "https://example.com/fixture/specs/issues/1172"]] },
    p(159, 15),
    p(164, 0),
    p(77, 1),
    { p: [["ref", "https://example.com/2025/11/fixture-assembly-minutes.html#item-04"]] },
    p(181, 2),
    p(153, 3),
    p(85, 4),
    { p: [ja(5, 5), ["code", "fixture-assembly-group@example.com"], ja(65, 6)] },
    p(20, 7),
    { h: 2, id: "last", text: "最後に" },
    p(107, 8),
    p(183, 9),
    p(32, 10),
  ],
};

const C: Article = {
  slug: "c07d5e1a84f2b9",
  title: "見本の記事：Markdown の要素をすべて並べる",
  date: "2026-01-20",
  category: "技術",
  minutes: 4,
  tags: ["fixture", "markdown", "every-element"],
  body: [
    { h: 2, id: "text", text: "文章の要素" },
    { p: [ja(60, 0), ["fn", 1], ja(30, 1)] },
    { p: [ja(20, 2), ["a", "見本の外のサイト", "https://example.com/fixture/elsewhere"], "と", ["a", "見本の記事一覧", at("/blog.html")], "と", ["a", "この頁の表", "#tables"], ja(14, 3)] },
    { quote: [p(70, 4), p(40, 5)] },
    { ol: [[ja(20, 6)], [ja(24, 7), ["ul", [[ja(14, 8)], [ja(18, 9)]]]], [ja(16, 10)]] },
    { ul: [[ja(18, 11), ["ol", [[ja(12, 12)], [ja(15, 13)]]]], [ja(20, 14)]] },
    { h: 2, id: "code", text: "コードの要素" },
    p(30, 15),
    { code: "<?php\n\nreturn [\n    'station' => 'fixture-station',\n    'readings' => ['human', 'machine'],\n];", language: "php", title: "config/fixture.php" },
    { code: " const station = 'fixture';\n-const readings = 1;\n+const readings = 2;\n export { station, readings };", language: "js", diff: true },
    { code: " fixture:\n-  rain: falling\n+  rain: held\n   theme: night", language: "yaml", title: "src/fixtures/fixture-station.yml", diff: true },
    { h: 2, id: "notes", text: "注記の要素" },
    { callout: [p(50, 0)] },
    { callout: [p(46, 1), p(30, 2)], alert: true },
    { callout: [p(20, 3), { ul: [[ja(16, 4)], [ja(14, 5)]] }, { code: "fixture-tool check --all", language: "bash" }] },
    { details: "見本の補足を開く", body: [p(60, 6)] },
    { details: "見本の設定と注意", open: true, body: [p(36, 7), { code: "fixture-tool stations list", language: "bash" }, { callout: [p(40, 8)] }] },
    { h: 2, id: "tables", text: "表とリスト" },
    { table: { head: ["見本の項目", "値"], align: [null, "right"], rows: [["見本の局", "3"], ["見本の記事", "12"], ["見本の端末", "1"]] } },
    {
      table: {
        head: ["見本の名前", "見本の説明", "見本の場所", "見本の状態", "見本の更新日"],
        rows: [
          ["fixture-station", "一つのデータから二つの表示を作る見本の局", "https://example.com/fixture/station", "動いています", "2026-01-20"],
          ["fixture-terminal", "記録したセッションを見せる見本の端末", "https://example.com/fixture/terminal", "止まっています", "2026-01-12"],
        ],
      },
    },
    { tasks: [[true, ja(16, 9)], [false, ja(18, 10)]] },
    { p: [ja(40, 11), ["fn", 2], ja(10, 12)] },
    { footnotes: [[ja(30, 13)], [ja(24, 14)]] },
  ],
};

export const articles = { a: A, b: B, c: C };
export type ArticleKey = keyof typeof articles;
/** Newest first, as the index lists them; A and B are each other's Older and Newer (04). */
export const order: ArticleKey[] = ["c", "b", "a"];
