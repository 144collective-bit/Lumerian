---
type: report
source_id: hall-stota-2009-web-pdf
status: pass3-guard-diagnosis
created: 2026-11-06
tags:
  - source/hall-stota
  - report/ops
---

# Pass 2 concurrency guard defect — diagnosis

## Root cause

Pass 2 installer expected manifest lines `sha256<TAB>rel`, but the real baseline manifest is:

`rel<TAB>sha256<TAB>bytes` (header `rel\tsha256\tbytes`)

plus `StartHere` backup key ↔ live `Start Here.md`. Parser therefore loaded **0** baseline entries and **degraded** to unconditional overwrite of staged research-layer targets.

## Reconciliation (read-only; Europe/London 2026-11-06)

| Check | Result |
|---|---|
| Baseline `hall_research_pass2_baseline_20261106_194436` preimages vs manifest | **808/808** hash OK; **0** missing |
| Staged Pass2 package files | **61** |
| Live Hall == staged | **61/61** |
| Live research files changed vs baseline **outside** staged set | **0** detected |
| Install log | 60 UPDATE + 1 CREATE |

**Cannot** retrospectively prove no concurrent human edit during the degraded window; we can only say current live research files match the staged Pass2 output exactly, and no non-staged research-layer drift vs baseline was found. Non-Hall / Text / Source Material were out of write scope; Text=52 and Source Material file/byte fingerprints recorded separately.

## Guard fix

New fail-closed guard (`concurrency_guard.py`): canonical manifest parse; Windows slash/case normalisation; refuse sha-first manifests; refuse empty/zero-match; block when live ≠ baseline for any update target. Simulation tests on box: happy path, concurrent edit, sha-first reject, empty reject, unknown-baseline reject — all passed. **No live mutation tests.**

## Pass 3 backup (before deepen writes)

`_lumerian_build_logs/hall_research_pass3_baseline_20261106_195623` — 809 manifest entries, verify_ok=809.
