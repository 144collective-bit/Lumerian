---
type: report
created: 2026-11-06
tags:
  - source/gaskell
  - report/repair
---

# Repair Log R2 — Entry boundaries + serpent citation/keyword (2026-11-06)

**Scope authorised:** derived Gaskell entry notes + Bible–Gaskell crossref layer. Raw `Source Text/page_N`, EPUBs, `Gaskell's/`, KJV scripture, `.obsidian` **unchanged**.

**Method:** automated structural scan of 846 page notes vs 3126 entry nodes + targeted close review of serpent cluster and confirmed segmentation faults. **Not** a claim of manual visual review of every page image.

## Phase 1 — Backup

- Outside-vault baseline: `C:\Users\mikem\Desktop\Lumerian Library Books RAW\_lumerian_build_logs\repair2_entry_crossref_baseline_20261106_190148`
- Manifest rows (SHA256): **4071** markdown files (Entries + Cross References + Reports)
- PATH_MAPPING.txt and MANIFEST_SHA256.tsv in that folder
- Concurrent-edit guard: live file SHA256 compared to backup before overwrite

## Phase 2 — Page↔entry coverage (structural)

| Metric | Count |
|---|---|
| Raw page notes `page_*.md` | 846 |
| Entry notes | 3126 |
| Pages with ≥1 mapped entry | 825 |
| Substantial pages with 0 entries | 21 (front matter ~page_0,8–23; appendix ~849–850,855–856) |
| Entries missing source page links | 0 |
| Numerical page gaps in filenames | page_1–7 absent; page_851–854 absent — **not** treated as missing dictionary text without EPUB spine evidence |
| Multi-entry pages (≥3) | 696 |

### High-confidence entry repairs this chunk

| File (path preserved) | Change | Evidence |
|---|---|---|
| `Entries/S/S SERPENT.md` | Headword → `MIDGARD'S SERPENT`; aliases keep old title; OCR fence unchanged | `page_507` lemma `MIDGARD'S SERPENT :—` after `MIDGARD` |
| `Entries/S/SLAUGHTER, SOLDIERS, … WARM AND COLD.md` | Headword → `WARM AND COLD`; See-list body restored; aliases keep old title | `page_810` See-list then `WARM AND COLD :—` then `WARP AND WOOF…` |
| `Entries/W/LD AND HEAT, … WARP AND WOOF…` | Already R1-corrected headword `WARP AND WOOF OF THE UNIVERSE` — verified, no further body change | `page_810` |
| `Entries/A/ABERAMENTHO.md` | Present on `page_25` — **not** skipped; no destructive edit this chunk | page OCR |

### Flagged / not auto-deleted

- False or nested heads: prefer metadata deprecate later; **no deletes** this chunk (avoid broken refs).
- Front/appendix pages: Context candidates (diagrams/tables) — not fabricated as dictionary entries this chunk.

### Remaining (resumable)

- Full re-segmentation pass for other See-list→head mergers beyond page_810 cluster
- Systematic body-truncation restore where OCR fence ends mid-See (`See Co` pattern family)
- Index A–Z display names vs corrected headwords (filename letter folders may lag)
- Orphan-text review queue for pages with multi-head OCR blocks vs entry span coverage

## Phase 3 — Serpent citation + keyword

| Item | Action |
|---|---|
| SERPENT, BRAZEN | Overlay: OCR `JonN ii. 14` → proposed John 3:14 (`contextual_candidate_pending_review`) |
| CURSE ON THE SERPENT | Overlay: OCR `Grn. iii. 14` → proposed Genesis 3:14 |
| TREADING… SERPENTS AND SCORPIONS | Overlay: OCR `BLuUuKe x. 19, 20` → proposed Luke 10:19–20 |
| Keyword `serpent.md` | Forms `serpent`+`serpents`; **49** verses (was 36); listed cap 40 |
| Book indexes John / Luke | Status → `citation_corrections_pending_review`; clarify `no_confirmed_connections` |
| Genesis index | Pointer to curse overlay (parser Bridges unchanged) |
| KJV files | **Unchanged** |

New folder: `Studies/Bible–Gaskell Cross References/Citation Corrections/` (3 overlays + Start Here).

## Phase 4 — QA notes

- Overlay and entry links use path-qualified wikilinks with `%2310` and `#kjv-…` block IDs.
- Old entry filenames/`entry_id` preserved where titles corrected.
- Raw pages and EPUB hashes not modified.
- Span coverage ≠ interpretation complete.

## Counts this apply

- Entry notes modified: **5** (S SERPENT, WARM AND COLD/SLAUGHTER…, SERPENT BRAZEN, CURSE ON THE SERPENT, TREADING…)
- Crossref notes modified: **6** (serpent keyword, Method, Start Here, John, Luke, Genesis)
- Crossref notes created: **4** (3 overlays + Citation Corrections Start Here)
- Report notes created: **1** (this file)
- Raw pages / KJV / EPUB / `.obsidian`: **0**

## Integrity

- Backup root above; post-apply hash list written beside backup as `repair2_apply_*.tsv` by installer.
