#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");

function loadHxTables() {
  const sourcePath = resolve(root, "raw13/hx_tables.js");
  const source = readFileSync(sourcePath, "utf8");
  const transformed = source.replace(
    /^export\\s+const\\s+HX1400_TABLES\\s*=/m,
    "const HX1400_TABLES =",
  );

  assert.notEqual(
    transformed,
    source,
    "Could not find the HX1400_TABLES declaration",
  );

  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(
    transformed + "\\n;globalThis.__HX1400_TABLES = HX1400_TABLES;",
    sandbox,
    { filename: sourcePath, timeout: 1000 },
  );

  return sandbox.__HX1400_TABLES;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

const tables = loadHxTables();
const snapshot = JSON.parse(
  readFileSync(resolve(root, "research/hen14/hx_tables.json"), "utf8"),
);

for (const [name, expected] of [
  ["P", 31],
  ["PG", 24],
  ["PGL", 24],
  ["PGN", 24],
  ["PGW", 24],
]) {
  assert.ok(Array.isArray(tables[name]), name + " must be an array");
  assert.equal(tables[name].length, expected, name + " length");
  assert.deepEqual(Array.from(tables[name]), snapshot[name],
    name + " must match the checked-in JSON snapshot");
}

assert.equal(tables.PKB.length, 1264, "PKB hex length");
assert.match(tables.PKB, /^(?:[0-9a-f]{2})+$/i, "PKB must be hexadecimal");
assert.equal(tables.PKB_SHA256, snapshot.PKB_SHA256, "PKB digest metadata");
assert.equal(tables.PKB_BYTES, snapshot.PKB_BYTES, "PKB byte metadata");

const embedded = Buffer.from(tables.PKB, "hex");
assert.equal(embedded.length, 632, "embedded patch blob size");
assert.equal(
  sha256(embedded),
  "165d2ad966b3829d1fbcb53d5e7ecbc20563de4a6a49ee70d8126d0256a49c02",
  "embedded patch blob SHA-256",
);

for (const relativePath of ["patches/1400.bin", "raw13/patches/1400.bin"]) {
  const actual = readFileSync(resolve(root, relativePath));
  assert.deepEqual(actual, embedded, relativePath + " must match embedded PKB");
}

assert.equal(tables.P[0], 0x01102d88, "SE11 anchor");
assert.equal(tables.P[1], 0x000250be, "KEXECG marker");
assert.equal(tables.P[2], 562240, "HEN payload size");
assert.equal(tables.P[3], 0x00004aab, "HEN entry marker");
assert.equal(tables.P[12], 0x00798754, "kernel anchor marker");

const hxSource = readFileSync(resolve(root, "raw13/hx1400_port.js"), "utf8");
assert.match(hxSource, /export\\s+async\\s+function\\s+runHx1400\\s*\\(/);
assert.match(
  hxSource,
  /kbase discovery complete; stopping before socket spray\\/kernel writes/,
  "research module must retain its explicit discovery-only stop marker",
);

const rootJb = readFileSync(resolve(root, "jb.js"), "utf8");
const importMatch = rootJb.match(
  /import\\(["'](\\.\\/hx1400_port\\.js(?:\\?[^"']*)?)["']\\)/,
);

if (importMatch) {
  const importPath = importMatch[1].split("?")[0];
  const resolved = resolve(root, importPath);
  if (!existsSync(resolved)) {
    console.warn(
      "[BLOCKER] jb.js references " + importPath +
      ", but that file is absent from the repository root. " +
      "The experimental module lives under raw13/ and is intentionally not wired " +
      "into the main execution path by this audit.",
    );
  }
} else {
  console.log("[INFO] No root-level HX1400 dynamic import found.");
}

console.log("[PASS] HX1400 table lengths and JSON snapshot");
console.log("[PASS] Embedded PKB size and SHA-256");
console.log("[PASS] Both 1400.bin copies match embedded PKB");
console.log("[PASS] Firmware table anchor values");
console.log("[PASS] HX1400 research module remains discovery-only");
console.log("[INFO] This audit validates static repository consistency only.");
console.log("[INFO] It does not build, modify, or validate a GoldHEN 14.00 payload.");
