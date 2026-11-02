# GoldHEN 14.00 — read-only repository audit

This directory contains a reproducible, non-destructive audit for the existing
14.00 research artifacts.

## What it verifies

- The five HX1400 tables have their expected lengths.
- The checked-in JavaScript table and JSON snapshot agree.
- The embedded 632-byte PKB blob has the recorded SHA-256.
- Both checked-in `1400.bin` copies exactly match the embedded PKB data.
- The table's payload-size, entry, and anchor metadata match the checked-in
  research summary.
- The HX1400 research module retains its explicit stop before socket spraying
  and kernel writes.

## Important status

The current `raw13/hx1400_port.js` reaches kernel-base discovery and then
returns `false`. It does not complete the later kernel-write or payload-loading
stages. The root `jb.js` also refers to a root-level `hx1400_port.js` path
that is absent; this audit reports that mismatch but deliberately does not wire
the experimental module into the main execution path.

These checks prove only repository artifact consistency. They do not prove
firmware 14.00 execution on hardware, do not build GoldHEN, and do not produce
a GoldHEN 14.00 payload.

## Run locally

```sh
node research/goldhen14/validate_tables.mjs
```

No third-party Node packages are required.
