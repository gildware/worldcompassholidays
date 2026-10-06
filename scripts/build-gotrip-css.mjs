import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import prefixSelector from "postcss-prefix-selector";
import * as sass from "sass";

const travelRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gotripRoot = path.join(travelRoot, "vendor/gotrip");

const compiled = sass.compile(path.join(gotripRoot, "styles/index.scss"), {
  loadPaths: [path.join(travelRoot, "node_modules")],
  silenceDeprecations: ["import", "legacy-js-api", "global-builtin", "slash-div"],
  style: "expanded",
});

const bootstrapPath = path.join(
  travelRoot,
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
);
const bootstrapCss = readFileSync(bootstrapPath, "utf8");
const css = `${bootstrapCss}\n${compiled.css.replace(
  /@import\s+["']bootstrap\/dist\/css\/bootstrap\.min\.css["'];?/,
  "",
)}`.replace(/url\((['"]?)(?:\.\.\/)+fonts\//g, "url($1/fonts/");

const prefix = ".gotrip-page";

function scopeSelector(selector) {
  return selector
    .split(",")
    .map((part) => {
      const piece = part.trim();
      if (!piece || piece.startsWith("@")) return piece;
      if (piece === "html" || piece === "body" || piece === ":root") return prefix;
      if (piece.startsWith(":root")) return piece.replace(":root", prefix);
      if (piece.startsWith("html")) return `${prefix}${piece.slice(4)}`;
      if (piece.startsWith("body")) return `${prefix}${piece.slice(4)}`;
      return `${prefix} ${piece}`;
    })
    .join(", ");
}

const result = await postcss([
  prefixSelector({
    prefix,
    transform(_prefix, selector, prefixedSelector) {
      if (selector.startsWith(prefix)) return selector;
      return scopeSelector(selector) || prefixedSelector;
    },
  }),
]).process(css, { from: undefined });

const extra = `
${prefix} {
  flex: 1 0 auto;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  --font-primary: var(--font-jost), "Jost", sans-serif;
  font-family: var(--font-jost), "Jost", sans-serif;
}
`;

const outFile = path.join(travelRoot, "src/styles/gotrip-home.css");
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, `${result.css}\n${extra}`);
console.log(`wrote ${outFile} (${Math.round(result.css.length / 1024)}kb)`);
