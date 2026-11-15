// @wadakatu/matrix/strings: the chrome's words in each page language (L6).
import en from "./en.ts";
import ja from "./ja.ts";

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Strings = Widen<typeof en>;
export type Lang = "en" | "ja";

export const strings: Record<Lang, Strings> = { en, ja };
export { en, ja };
