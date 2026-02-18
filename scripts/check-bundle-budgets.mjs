import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const DIST_DIR = "dist";
const BUDGETS_FILE = "bundle-budgets.json";

const defaultBudgets = {
  defaultGzipKb: 90,
  routes: {
    "/": 8,
    "/404": 8,
    "/aboutus": 8,
    "/pprivacy": 8,
    "/terms": 8,
    "/cotizador": 85,
    "/consultoriati": 86,
    "/licencias": 80,
    "/cmcocom": 80,
    "/genpass": 75,
    "/plantillas": 75,
    "/knowip": 74,
  },
};

const toKb = (bytes) => Number((bytes / 1024).toFixed(2));

const walkHtml = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(fullPath, acc);
      continue;
    }

    if (fullPath.endsWith(".html")) {
      acc.push(fullPath);
    }
  }

  return acc;
};

const routeFromHtml = (htmlPath) => {
  const normalized = htmlPath.replaceAll("\\", "/");
  if (normalized === `${DIST_DIR}/index.html`) {
    return "/";
  }

  if (normalized === `${DIST_DIR}/404.html`) {
    return "/404";
  }

  return `/${normalized
    .slice(`${DIST_DIR}/`.length)
    .replace(/\/index\.html$/, "")
    .replace(/\.html$/, "")}`;
};

const extractEntryRefs = (html) => {
  const refs = new Set();
  const patterns = [
    /<script[^>]*\ssrc="([^"]+)"/g,
    /<astro-island[^>]*\scomponent-url="([^"]+)"/g,
    /<astro-island[^>]*\srenderer-url="([^"]+)"/g,
    /<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const ref = match[1];
      if (ref.startsWith("/_astro/") && ref.endsWith(".js")) {
        refs.add(ref);
      }
    }
  }

  return [...refs].sort();
};

const importCache = new Map();
const STATIC_IMPORT_RE = /\bimport\s*(?:[^"'()]*?from\s*)?["']([^"']+)["']/g;

const getStaticImports = (filePath) => {
  if (importCache.has(filePath)) {
    return importCache.get(filePath);
  }

  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];

  for (const match of code.matchAll(STATIC_IMPORT_RE)) {
    imports.push(match[1]);
  }

  importCache.set(filePath, imports);
  return imports;
};

const collectTransitiveJsDeps = (entryPath, deps = new Set()) => {
  if (deps.has(entryPath)) {
    return deps;
  }

  deps.add(entryPath);

  for (const specifier of getStaticImports(entryPath)) {
    if (!specifier.startsWith(".") || !specifier.endsWith(".js")) {
      continue;
    }

    const nextFile = path.resolve(path.dirname(entryPath), specifier);
    if (fs.existsSync(nextFile)) {
      collectTransitiveJsDeps(nextFile, deps);
    }
  }

  return deps;
};

const loadBudgets = () => {
  if (!fs.existsSync(BUDGETS_FILE)) {
    fs.writeFileSync(BUDGETS_FILE, `${JSON.stringify(defaultBudgets, null, 2)}\n`, "utf8");
    return defaultBudgets;
  }

  const content = fs.readFileSync(BUDGETS_FILE, "utf8");
  const parsed = JSON.parse(content);

  return {
    defaultGzipKb: Number(parsed.defaultGzipKb ?? defaultBudgets.defaultGzipKb),
    routes: { ...defaultBudgets.routes, ...(parsed.routes ?? {}) },
  };
};

if (!fs.existsSync(DIST_DIR)) {
  console.error("[bundle-budget] dist/ no existe. Ejecuta `npm run build` antes.");
  process.exit(1);
}

const budgets = loadBudgets();
const rows = [];

for (const htmlPath of walkHtml(DIST_DIR).sort()) {
  const route = routeFromHtml(htmlPath);
  const html = fs.readFileSync(htmlPath, "utf8");
  const entries = extractEntryRefs(html);

  const deps = new Set();
  for (const entry of entries) {
    const entryPath = path.join(DIST_DIR, entry.slice(1));
    if (!fs.existsSync(entryPath)) {
      continue;
    }

    collectTransitiveJsDeps(entryPath, deps);
  }

  let rawBytes = 0;
  let gzipBytes = 0;
  for (const dep of deps) {
    const buf = fs.readFileSync(dep);
    rawBytes += buf.length;
    gzipBytes += zlib.gzipSync(buf, { level: 9 }).length;
  }

  const gzipKb = toKb(gzipBytes);
  const rawKb = toKb(rawBytes);
  const budgetKb = Number(budgets.routes[route] ?? budgets.defaultGzipKb);
  const status = gzipKb <= budgetKb ? "PASS" : "FAIL";

  rows.push({
    route,
    files: deps.size,
    rawKb,
    gzipKb,
    budgetKb,
    status,
  });
}

console.log("\nRoute JS bundle budget report (initial + static transitive deps):");
console.log("route\tfiles\trawKB\tgzipKB\tbudgetKB\tstatus");
for (const row of rows) {
  console.log(
    `${row.route}\t${row.files}\t${row.rawKb}\t${row.gzipKb}\t${row.budgetKb}\t${row.status}`
  );
}

const failures = rows.filter((row) => row.status === "FAIL");
if (failures.length > 0) {
  console.error(`\n[bundle-budget] ${failures.length} ruta(s) exceden el presupuesto.`);
  process.exit(1);
}

console.log("\n[bundle-budget] OK: todas las rutas están dentro del presupuesto.");
