// The specimen build's base (06, "How a specimen is shown"): the Storybook serves the build under
// /specimens/ and the tests serve it at the same path, so every address one specimen writes to
// another is made here. The logo keeps /assets/logo/, which the Storybook serves already.
export const BASE = "/specimens/";
/** The address of a specimen page: `at("/home.html")` is `/specimens/home.html`. */
export const at = (path: string) => BASE + path.replace(/^\//, "");
