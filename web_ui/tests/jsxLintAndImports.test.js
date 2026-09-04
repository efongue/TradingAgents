import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

function getSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith(".jsx") || entry.name.endsWith(".js"))) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseImportsAndDefs(content) {
  const importedIdentifiers = new Set();
  const declaredIdentifiers = new Set([
    "String",
    "Number",
    "Boolean",
    "Array",
    "Object",
    "Date",
    "Math",
    "JSON",
    "Set",
    "Map",
    "Promise",
    "Error",
    "URL",
    "URLSearchParams",
    "Intl",
    "window",
    "document",
    "localStorage",
    "console",
  ]);

  // Match: import { A, B as C } from "..." or import Default, { A, B } from "..."
  const namedImportRegex = /import\s*(?:[A-Za-z0-9_$]+\s*,\s*)?\{([^}]+)\}\s*from/g;
  let match;
  while ((match = namedImportRegex.exec(content)) !== null) {
    const rawList = match[1];
    for (const item of rawList.split(",")) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      if (trimmed.includes(" as ")) {
        const [, alias] = trimmed.split(/\s+as\s+/);
        importedIdentifiers.add(alias.trim());
      } else {
        importedIdentifiers.add(trimmed);
      }
    }
  }

  // Match: import DefaultName from "..."
  const defaultImportRegex = /import\s+([A-Za-z0-9_$]+)\s*(?:,\s*\{[^}]*\})?\s*from/g;
  while ((match = defaultImportRegex.exec(content)) !== null) {
    if (match[1] && match[1] !== "type") {
      importedIdentifiers.add(match[1].trim());
    }
  }

  // Match: function Foo( or const Foo = or let Foo = or class Foo
  const funcRegex = /(?:function|class)\s+([A-Za-z0-9_$]+)/g;
  while ((match = funcRegex.exec(content)) !== null) {
    declaredIdentifiers.add(match[1]);
  }

  const varRegex = /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/g;
  while ((match = varRegex.exec(content)) !== null) {
    declaredIdentifiers.add(match[1]);
  }

  // Match: const [a, b, Icon] = or const { a, icon: Icon } =
  const destructureRegex = /(?:const|let|var)\s*(?:\[|\{)([^\]}]+)(?:\]|\})\s*=/g;
  while ((match = destructureRegex.exec(content)) !== null) {
    for (const raw of match[1].split(",")) {
      const part = raw.trim();
      if (!part) continue;
      if (part.includes(":")) {
        const [, val] = part.split(":");
        declaredIdentifiers.add(val.trim());
      } else {
        declaredIdentifiers.add(part.trim());
      }
    }
  }

  // Match function/arrow function parameter destructuring: ({ Icon, ... }) or ([id, label, Icon])
  const paramDestructureRegex = /\(\s*(?:\{|\[)([^)\]}]+)(?:\}|\])[^)]*\)/g;
  while ((match = paramDestructureRegex.exec(content)) !== null) {
    for (const raw of match[1].split(",")) {
      const part = raw.trim();
      if (!part) continue;
      if (part.includes(":")) {
        const [, val] = part.split(":");
        declaredIdentifiers.add(val.trim());
      } else {
        declaredIdentifiers.add(part.trim());
      }
    }
  }

  return { importedIdentifiers, declaredIdentifiers };
}

function extractJsxComponents(content) {
  const components = [];
  // Match <ComponentName or <ComponentName.Sub
  const jsxTagRegex = /<([A-Z][A-Za-z0-9_]*)(?:\.[A-Za-z0-9_]+)?[\s\/>]/g;
  let match;
  while ((match = jsxTagRegex.exec(content)) !== null) {
    components.push({
      tag: match[1],
      index: match.index,
    });
  }
  return components;
}

test("JSX Integrity: Every React component and Lucide icon used in JSX is imported or declared", () => {
  const files = getSourceFiles(srcDir);
  assert.ok(files.length > 0, "Source files should exist in src/");

  const missingErrors = [];

  for (const filePath of files) {
    const relativePath = path.relative(srcDir, filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const { importedIdentifiers, declaredIdentifiers } = parseImportsAndDefs(content);
    const jsxComponents = extractJsxComponents(content);

    for (const { tag, index } of jsxComponents) {
      if (tag === "React") {
        if (!importedIdentifiers.has("React") && !declaredIdentifiers.has("React")) {
          const line = content.slice(0, index).split("\n").length;
          missingErrors.push(`${relativePath}:${line}: Component '<React.X>' used but 'React' is not imported.`);
        }
        continue;
      }
      if (tag === "Fragment") {
        if (!importedIdentifiers.has("Fragment") && !importedIdentifiers.has("React")) {
          const line = content.slice(0, index).split("\n").length;
          missingErrors.push(`${relativePath}:${line}: Component '<Fragment>' used but not imported.`);
        }
        continue;
      }
      // Also motion.tag handled as 'motion'
      if (tag === "motion") {
        if (!importedIdentifiers.has("motion") && !declaredIdentifiers.has("motion")) {
          missingErrors.push(`${relativePath}: Component '<motion...>' used but 'motion' is not imported.`);
        }
        continue;
      }
      if (tag === "AnimatePresence") {
        if (!importedIdentifiers.has("AnimatePresence") && !declaredIdentifiers.has("AnimatePresence")) {
          missingErrors.push(`${relativePath}: Component '<AnimatePresence>' used but not imported.`);
        }
        continue;
      }

      if (!importedIdentifiers.has(tag) && !declaredIdentifiers.has(tag)) {
        // Calculate line number
        const line = content.slice(0, index).split("\n").length;
        missingErrors.push(`${relativePath}:${line}: Component or Icon '<${tag} />' is used in JSX but is NOT imported or defined!`);
      }
    }
  }

  if (missingErrors.length > 0) {
    assert.fail(`Found ${missingErrors.length} undefined JSX tag(s):\n${missingErrors.join("\n")}`);
  }
});
