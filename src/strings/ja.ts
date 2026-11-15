// Chrome strings, Japanese. To be reviewed by wadakatu before 1.0.0 (09, task 2.6).
import type { Strings } from "./index.ts";

export default {
  skip: "本文へ移動",
  menu: "メニュー",
  nav: "メイン",
  hold: "雨を止める",
  palette: "オペレーター配色",
  theme: "デイライト",
  reading: "表示",
  status: { machine: "機械用で表示中", human: "人間用で表示中" },
  moved: { title: "移動しました", text: "このページは移動しました。" },
  other: { lang: "en", label: "English" },
} satisfies Strings;
