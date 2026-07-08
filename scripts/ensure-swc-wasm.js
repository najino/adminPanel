/**
 * Removes native @next/swc-* binaries that crash on some Linux setups
 * (glibc mismatch, LD_PRELOAD, AppImage sandboxes). Next.js falls back
 * to @next/swc-wasm-nodejs when NEXT_DISABLE_SWC_BINARY=1 is set.
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", "node_modules", "@next");
const nativePackages = ["swc-linux-x64-gnu", "swc-linux-x64-musl", "swc-linux-x64-gnu", "swc-linux-arm64-gnu"];

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

for (const pkg of nativePackages) {
  const pkgPath = path.join(nextDir, pkg);
  if (fs.existsSync(pkgPath)) {
    fs.rmSync(pkgPath, { recursive: true, force: true });
    console.log(`[postinstall] Removed native SWC package: @next/${pkg}`);
  }
}
