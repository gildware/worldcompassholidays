/**
 * Lists public UI copy the language switch will leave in English.
 *
 * Fixed labels must match a row in site-phrases.json.
 * A line with a number or a name in it must come out fully translated
 * through the same matcher the site uses.
 *
 * Run: npm run i18n:audit
 */
import fs from "fs";
import path from "path";
import ts from "typescript";
import { buildPhraseMap, compilePhrases, speak } from "../src/i18n/apply-phrases";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const phrasePath = path.join(sourceRoot, "i18n/site-phrases.json");

const UI_PROPS = new Set([
  "title",
  "text",
  "label",
  "heading",
  "subtitle",
  "placeholder",
  "hint",
  "caption",
  "cta",
  "eyebrow",
  "detail",
  "motto",
  "question",
  "answer",
  "emptyLabel",
  "ariaLabel",
  "message",
  "description",
  "alt",
  "summary",
  "note",
  "helper",
  "lede",
  "error",
  "success",
]);

const UI_ATTRS = new Set(["placeholder", "aria-label", "title", "alt", "label"]);

const STOP = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "div",
  "span",
  "button",
  "submit",
  "email",
  "password",
  "hidden",
  "checkbox",
  "radio",
  "tel",
  "url",
  "date",
  "number",
  "search",
  "file",
  "image",
  "color",
  "range",
  "reset",
  "default",
  "primary",
  "secondary",
  "small",
  "large",
  "left",
  "right",
  "center",
  "row",
  "column",
  "grid",
  "flex",
  "absolute",
  "relative",
  "sticky",
  "fixed",
  "auto",
  "none",
  "block",
  "inline",
  "bold",
  "normal",
  "wrap",
  "nowrap",
  "pointer",
  "solid",
  "dashed",
  "visible",
  "scroll",
  "smooth",
  "eager",
  "lazy",
  "module",
  "production",
  "development",
  "client",
  "server",
  "ltr",
  "rtl",
  "asc",
  "desc",
  "href",
  "src",
  "type",
  "name",
  "value",
  "icon",
  "string",
  "object",
  "function",
  "return",
  "const",
  "async",
  "await",
  "export",
  "import",
  "from",
  "class",
  "props",
  "children",
  "className",
  "style",
  "ref",
  "key",
  "id",
  "html",
  "body",
  "head",
  "main",
  "form",
  "input",
  "script",
]);

type Spot = { file: string; line: number };

const fixed = new Map<string, Spot[]>();
const dynamic = new Map<string, { sample: string; spots: Spot[] }>();

function rel(file: string) {
  return path.relative(root, file).split(path.sep).join("/");
}

function skippedFile(file: string) {
  const name = rel(file);
  if (!/\.(tsx|ts|jsx|js)$/.test(name)) return true;
  if (name.endsWith(".d.ts")) return true;
  if (name.includes("/admin/")) return true;
  if (name.includes("/api/")) return true;
  if (name.includes("/demo/")) return true;
  if (name.includes("/lib/demo/")) return true;
  if (name.includes("/lib/field-help.ts")) return true;
  if (name.includes("/lib/auth/")) return true;
  if (name.includes("/i18n/home-copy.ts")) return true;
  if (name.includes("/i18n/contact-form.ts")) return true;
  if (name.includes("/i18n/messages.ts")) return true;
  if (name.includes("/i18n/site-phrases")) return true;
  if (name.includes("/i18n/apply-phrases.ts")) return true;
  return false;
}

function isClassList(value: string) {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 0) return false;
  return parts.every(
    (part) =>
      /^[.#@]?[a-z0-9_:[\]%/.-]+$/i.test(part) &&
      (part.includes("-") || part.includes("_") || part.includes(":") || part.includes("[") || part.startsWith(".") || part.startsWith("#") || part.startsWith("@")),
  );
}

function isCode(value: string) {
  const text = value.trim();
  if (/^(https?:|mailto:|tel:|\/|\.\/|#|data-)/.test(text)) return true;
  if (/\.(png|jpe?g|svg|webp|gif|css|scss|json|tsx?|jsx?|woff2?)(\?.*)?$/i.test(text)) return true;
  if (text.includes("=>") || text.includes("process.env") || text.includes("className")) return true;
  if (/^[a-z0-9]+([_./:-][a-z0-9]+)+$/i.test(text)) return true;
  if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(text)) return true;
  if (/^[A-Z0-9_]{2,}$/.test(text) && text.includes("_")) return true;
  return false;
}

function looksEnglish(text: string) {
  const letters = [...text].filter((char) => /\p{L}/u.test(char));
  if (letters.length === 0) return false;
  const latin = letters.filter((char) => /\p{Script=Latin}/u.test(char)).length;
  return latin / letters.length > 0.85;
}

function isSelector(text: string) {
  const value = text.trim();
  if (/^[.#:\[]/.test(value)) return true;
  if (value.includes("__") || value.includes(" > ") || value.includes("> li") || value.includes("> a")) return true;
  if (/^\([^)]*(?:prefers-|display-mode|pointer:)/.test(value)) return true;
  return false;
}

function isMarkup(text: string) {
  if (/[<>{}]|xmlns|font-family|\dpx\b|viewBox|stroke-width|\(\?:|\\b/.test(text)) return true;
  const parts = text.trim().split(/\s+/);
  const classLike = parts.filter((part) => /[.#_-]/.test(part) && /^[.#@a-z0-9_:[\]%/.-]+$/i.test(part)).length;
  return parts.length > 2 && classLike / parts.length > 0.6;
}

function visibleCopy(sample: string) {
  const stripped = renderHoles(sample)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped;
}

function inClassName(node: ts.Node) {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isJsxAttribute(current) && ts.isIdentifier(current.name) && (current.name.text === "className" || current.name.text === "class")) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function acceptable(text: string, allowShort: boolean) {
  if (!looksEnglish(text)) return false;
  if (text.length > 500) return false;
  if (isCode(text) || isClassList(text) || isSelector(text)) return false;
  if (text.includes(" ") || /[.!?]/.test(text)) return true;
  if (!allowShort) return false;
  if (!/^[A-Za-z][A-Za-z'’.-]{1,40}$/.test(text)) return false;
  if (STOP.has(text.toLowerCase())) return false;
  if (text === text.toLowerCase() && text.length < 4) return false;
  return true;
}

function addFixed(text: string, spot: Spot, allowShort: boolean) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!acceptable(clean, allowShort)) return;
  const spots = fixed.get(clean) ?? [];
  if (spots.length < 8 && !spots.some((item) => item.file === spot.file && item.line === spot.line)) spots.push(spot);
  fixed.set(clean, spots);
}

function addDynamic(sample: string, spot: Spot) {
  const clean = visibleCopy(sample);
  if (!clean.includes(" ") || !looksEnglish(clean)) return;
  if (isCode(clean) || isClassList(clean) || isSelector(clean) || isMarkup(clean)) return;
  if (/ViewportReset|AssistIcons|LanguageSwitcher|booking-notify|\/mail\.ts/.test(spot.file)) return;
  if (/\b(min-h|hic-|px-|py-|font-|shadow|rounded|dvh|guide-step|m-cal|object-cover|shrink-0)\b/.test(clean)) return;
  if (/\bdeg$/.test(clean) || /^header \d/.test(clean)) return;
  const current = dynamic.get(clean) ?? { sample: clean, spots: [] };
  if (current.spots.length < 8 && !current.spots.some((item) => item.file === spot.file && item.line === spot.line)) {
    current.spots.push(spot);
  }
  dynamic.set(clean, current);
}

function collectRendered(node: ts.Node | undefined, spotFor: (node: ts.Node) => Spot) {
  if (!node) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    addFixed(node.text, spotFor(node), true);
    return;
  }
  if (ts.isTemplateExpression(node)) {
    addDynamic(sampleTemplate(node), spotFor(node));
    return;
  }
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    collectRendered(node.expression, spotFor);
    return;
  }
  if (ts.isConditionalExpression(node)) {
    collectRendered(node.whenTrue, spotFor);
    collectRendered(node.whenFalse, spotFor);
    return;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    collectRendered(node.left, spotFor);
    collectRendered(node.right, spotFor);
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    node.elements.forEach((element) => collectRendered(element, spotFor));
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    node.properties.forEach((property) => {
      if (!ts.isPropertyAssignment(property)) return;
      const name = propertyName(property.name);
      if (name && UI_PROPS.has(name)) collectRendered(property.initializer, spotFor);
    });
  }
}

function propertyName(name: ts.PropertyName) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return "";
}

function sampleTemplate(node: ts.TemplateExpression) {
  let sample = node.head.text;
  for (const span of node.templateSpans) sample += `‹7›${span.literal.text}`;
  return sample;
}

function renderHoles(sample: string) {
  return sample.replace(/‹7›/g, (mark, offset: number, source: string) => {
    const before = source[offset - 1] ?? "";
    const after = source[offset + mark.length] ?? "";
    if (/[A-Za-z]/.test(before) && /[A-Za-z]/.test(after)) return "";
    if (!/[A-Za-z]/.test(before) && /[A-Za-z]/.test(after)) return "7 ";
    return "7";
  });
}

function scanFile(file: string) {
  const sourceText = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : file.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, kind);
  const spotFor = (node: ts.Node): Spot => ({
    file: rel(file),
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
  });

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isJsxText(node)) addFixed(node.text, spotFor(node), true);
    if (ts.isJsxExpression(node)) collectRendered(node.expression, spotFor);
    if (ts.isJsxAttribute(node)) {
      const name = ts.isIdentifier(node.name) ? node.name.text : "";
      if (UI_ATTRS.has(name) && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) addFixed(node.initializer.text, spotFor(node.initializer), true);
        else if (ts.isJsxExpression(node.initializer)) collectRendered(node.initializer.expression, spotFor);
      }
    }
    if (ts.isPropertyAssignment(node)) {
      const name = propertyName(node.name);
      if (UI_PROPS.has(name)) collectRendered(node.initializer, spotFor);
    }
    if (ts.isTemplateExpression(node) && !inClassName(node)) addDynamic(sampleTemplate(node), spotFor(node));
    ts.forEachChild(node, visit);
  }

  visit(source);
}

function resolveImport(fromFile: string, spec: string) {
  let base = "";
  if (spec.startsWith("@/")) base = path.join(sourceRoot, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return "";
  const candidates = [base, `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`, path.join(base, "index.tsx"), path.join(base, "index.ts")];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? "";
}

function importsOf(file: string) {
  const text = fs.readFileSync(file, "utf8").replace(/import\s+type\s+[^;]+;/g, "");
  const specs = new Set<string>();
  for (const match of text.matchAll(/from\s+["']([^"']+)["']/g)) specs.add(match[1]);
  for (const match of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) specs.add(match[1]);
  return [...specs].map((spec) => resolveImport(file, spec)).filter(Boolean);
}

function publicFiles() {
  const entryPoints: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "admin" || entry.name === "api" || entry.name === "demo" || entry.name === "node_modules") continue;
        walk(full);
        continue;
      }
      if (/\/(page|layout|template|loading|error|not-found|global-error)\.(tsx|jsx|ts|js)$/.test(full.split(path.sep).join("/"))) {
        entryPoints.push(full);
      }
    }
  }
  walk(path.join(sourceRoot, "app"));
  const seen = new Set<string>();
  const queue = [...entryPoints];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file) || skippedFile(file)) continue;
    seen.add(file);
    for (const next of importsOf(file)) queue.push(next);
  }
  return [...seen];
}

function latinWords(value: string) {
  return value.match(/[A-Za-z]{3,}/g) ?? [];
}

function spots(list: Spot[]) {
  return list.map((spot) => `${spot.file}:${spot.line}`).join(", ");
}

function main() {
  const rows = JSON.parse(fs.readFileSync(phrasePath, "utf8")) as { en: string; hi: string }[];
  const map = buildPhraseMap(rows.map((row) => [row.en, row.hi?.trim() ?? ""]));
  const phrases = compilePhrases(map);
  const files = publicFiles();
  files.forEach(scanFile);

  const missingFixed: { text: string; spots: Spot[] }[] = [];
  for (const [text, textSpots] of fixed) {
    const translated = speak(text, map, phrases, "hi");
    if (translated === text) missingFixed.push({ text, spots: textSpots });
  }
  missingFixed.sort((a, b) => a.text.localeCompare(b.text));

  const partial: { sample: string; translated: string; left: string[]; spots: Spot[] }[] = [];
  for (const item of dynamic.values()) {
    const translated = speak(item.sample, map, phrases, "hi");
    const original = new Set(latinWords(item.sample).filter((word) => !new RegExp(`${word}\\d`, "i").test(item.sample)));
    const left = [...new Set(latinWords(translated).filter((word) => original.has(word)))];
    if (left.length === 0) continue;
    partial.push({ sample: item.sample, translated, left, spots: item.spots });
  }
  partial.sort((a, b) => a.sample.localeCompare(b.sample));

  console.log(`Scanned ${files.length} public files.`);
  console.log("Admin, demo pages, database seed text, the home page copy table, and the contact form copy table are outside this scan.");
  console.log(`Fixed labels still English: ${missingFixed.length}`);
  console.log(`Lines with a number or name still partly English: ${partial.length}`);
  console.log("");
  console.log("Fixed labels");
  for (const item of missingFixed) {
    console.log(`- ${item.text}`);
    console.log(`  ${spots(item.spots)}`);
  }
  console.log("");
  console.log("Lines with a number or name");
  for (const item of partial) {
    console.log(`- ${item.sample}`);
    console.log(`  still English: ${item.left.join(", ")}`);
    console.log(`  hindi probe: ${item.translated}`);
    console.log(`  ${spots(item.spots)}`);
  }

  if (missingFixed.length > 0 || partial.length > 0) process.exitCode = 1;
}

main();
