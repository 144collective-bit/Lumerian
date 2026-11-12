---
type: report
created: 2026-11-06
tags:
  - source/gaskell
  - report/repair
  - repair/r3-rename
---

# Rename Log R3 — Confirmed corrected entry filenames (2026-11-06)

**Authorised scope:** rename/move only entries with **confirmed** R1/R2 headword corrections; update generated links/indexes in the main Lumerian vault. No broad reparse. No Source Text / EPUB / KJV / `.obsidian` / `Gaskell's/` edits.

## Backup

- Outside vault: `C:\Users\mikem\Desktop\Lumerian Library Books RAW\_lumerian_build_logs\rename_r3_confirmed_heads_20261106_191358`
- `RENAME_MAP.tsv`, `MANIFEST_SHA256.tsv` (30 files), `plan.json`, `PATH_MAPPING.txt`
- Concurrent-edit hash guard: **0** collisions

## Renames (5)

| Old path | New path | Corrected headword | `entry_id` (preserved) |
|---|---|---|---|
| `Entries/S/S SERPENT.md` | `Entries/M/MIDGARD'S SERPENT.md` | MIDGARD'S SERPENT | `gaskell-1960-entry-s-serpent` |
| `Entries/S/SLAUGHTER, SOLDIERS, STRIFE, SWORD, VICTORY, WEAPONS, WARM AND COLD.md` | `Entries/W/WARM AND COLD.md` | WARM AND COLD | `gaskell-1960-entry-slaughter-soldiers-strife-sword-victory-weapons-warm-and-cold` |
| `Entries/W/LD AND HEAT, HEAT AND COLD, OPPOSITES, WARP AND WOOF OF THE UNIVERSE.md` | `Entries/W/WARP AND WOOF OF THE UNIVERSE.md` | WARP AND WOOF OF THE UNIVERSE | `gaskell-1960-entry-ld-and-heat-heat-and-cold-opposites-warp-and-woof-of-the-universe` |
| `Entries/D/S (OF CHINA).md` | `Entries/D/DYNASTY, HEAVEN'S (OF CHINA).md` | DYNASTY, HEAVEN'S (OF CHINA) | `gaskell-1960-entry-s-of-china` |
| `Entries/D/S (OF CHINA)-8b11d9.md` | `Entries/D/DYNASTY, EARTH'S (OF CHINA).md` | DYNASTY, EARTH'S (OF CHINA) | `gaskell-1960-entry-s-of-china-18d33759` |

Aliases on each note retain prior machine/OCR filename history (**not** claimed as synonymy). OCR `text` fences byte-identical to pre-move backups.

## Indexes

- Removed stale rows from Letter **S** (4) and Letter **L** (1).
- Added rows under Letter **M** (MIDGARD'S SERPENT), **W** (WARM AND COLD; WARP AND WOOF OF THE UNIVERSE), **D** (both DYNASTY…OF CHINA).

## Other generated link updates

- **20** See-status tables updated: Dynasty ambiguous candidates now path-link the three dynasty notes; `SLAUGHTER` first-segment candidates no longer point at the false merged filename (note that OCR token ≠ WARM AND COLD); DEVIL → MIDGARD'S SERPENT resolved to new path.
- Main-vault stale path scan for old `Entries/...` targets: **0** remaining (Source Text OCR and `Gaskell's/` excluded from mutation).
- `Gaskell's/` duplicate tree: **untouched**; may still mention old machine names (reported only).

## Counts

| Item | Count |
|---|---|
| Entry files renamed/moved | **5** |
| Letter index files edited | **5** (D,L,M,S,W) |
| See-status entry notes edited | **20** |
| New report | **1** (this file) |
| Raw pages / EPUB / KJV / `.obsidian` / `Gaskell's/` | **0** |

## Validation

- New paths present; old paths absent (moves, not deletes of content).
- OCR fence bodies match backup for all five.
- Letter membership: MIDGARD under M; WARM and WARP under W; both DYNASTY under D.
- No target-path collisions.

## Limits / still pending

- Broader boundary/See-list re-segmentation beyond these confirmed cases: **not** done.
- Not a claim that all dictionary faults are fixed or that full entry review is complete.
- Historical wording in older reports (e.g. Repair Log R2) may still name pre-rename paths as evidence of what was repaired then.