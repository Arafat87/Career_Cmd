/**
 * Post-build script: assembles the Next.js standalone output + static assets
 * into electron-resources/ for electron-builder to package.
 *
 * Structure:
 *   electron-resources/
 *     .next/standalone/   ← server.js + node_modules (minimal)
 *     .next/static/       ← Next.js static chunks
 *     public/             ← public assets
 *     careercmd.db        ← SQLite database (copied if exists)
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const dest = path.join(root, "electron-resources");

function copySync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copySync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Clean previous build
rmDir(dest);
fs.mkdirSync(dest, { recursive: true });

// 1. Copy standalone server + bundled node_modules
console.log("Copying standalone output...");
copySync(standalone, dest);

// 2. Copy static assets into the expected location
console.log("Copying .next/static...");
copySync(
  path.join(root, ".next", "static"),
  path.join(dest, ".next", "static")
);

// 3. Copy public folder
console.log("Copying public/...");
copySync(path.join(root, "public"), path.join(dest, "public"));

// 4. Copy SQLite database if it exists
const dbFile = path.join(root, "careercmd.db");
if (fs.existsSync(dbFile)) {
  console.log("Copying careercmd.db...");
  fs.copyFileSync(dbFile, path.join(dest, "careercmd.db"));
}

// 5. Copy .env.local for production
const envFile = path.join(root, ".env.local");
if (fs.existsSync(envFile)) {
  console.log("Copying .env.local...");
  fs.copyFileSync(envFile, path.join(dest, ".env.local"));
}

// 6. Ensure better-sqlite3 native addon is present
// The standalone output should include it, but double-check
const bSqliteSrc = path.join(root, "node_modules", "better-sqlite3");
const bSqliteDest = path.join(dest, "node_modules", "better-sqlite3");
if (fs.existsSync(bSqliteSrc) && !fs.existsSync(bSqliteDest)) {
  console.log("Copying better-sqlite3 (native module)...");
  copySync(bSqliteSrc, bSqliteDest);
}

console.log("Electron resources ready at:", dest);
