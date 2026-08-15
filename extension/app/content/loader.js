// Classic content-script shim. Scripts injected via scripting.executeScript with
// `files` cannot be ES modules, so this loader dynamically imports the real module
// graph. The extension URL is same-origin and listed in web_accessible_resources,
// which Chrome and Firefox (89+) both require for dynamic import from a content
// script. The module registry is per-document, so repeated injection is idempotent.
//
// Dynamic import path is a fixed extension resource (`app/content/main.js`) only —
// never taken from the page, settings, or other external input. Firefox Add-ons
// Linter still warns about dynamic import; that warning is accepted here.
(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const CONTENT_MAIN = "app/content/main.js";
  // Firefox returns the completion value of an injected script to the background.
  // A dynamic import resolves to a module namespace object, which Firefox 140
  // cannot structured-clone. Always resolve this chain to null instead.
  import(api.runtime.getURL(CONTENT_MAIN))
    .then(() => null)
    .catch((error) => {
      console.error("[Element Deleter] failed to load content module", error);
      return null;
    });
})();
