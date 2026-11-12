---
type: coverage-report
source_id: gaskell-dictionary-julian-1960
created: 2026-11-06
review_status: full-import
tags:
  - source/gaskell
  - note/meta
---

# Coverage Report - Full Import

## Counts

| Metric | Count |
|---|---|
| EPUB page HTML files present | 3 |
| Numeric gaps in 0–856 | 1–7, 851–854 (absent from EPUB) |
| New OCR page notes created this import | 826 + notice.md |
| Pre-existing Stage-1 page notes skipped | 20 |
| Machine-segmented entries | 3126 |
| New entry notes created | 3118 |
| Pre-existing Stage-1 entry notes reused | 8 |
| Nested-colon candidates rejected | 3 |
| See targets resolved to an indexed entry | 9434 |
| See targets unresolved | 16277 |
| Source images in Assets after import | image_0000, image_0010 (pre-existing) + image_0856 (new if created) |

## Methods

- **Page text:** HTML tag strip + entity unescape; stable block IDs `gaskell-1960-pN-full`.
- **Entry segmentation:** locate `:—` markers; extract preceding uppercase head including unicode dashes; soft filter for probable nested second colons; **no** alphabetical-backwards mass rejection (OCR order is noisy).
- **Crossrefs:** normalize See targets and match to entry heads / first comma-segment; unresolved remain plain text.
- **Review state:** new entries tagged `machine-extracted-unreviewed`. Stage-1 eight remain as previously written.

## Uncertainty

- OCR errors create false/merged/split heads and garbled See targets.
- Some nested headings may still be over-segmented or under-segmented (only 3 hard-rejected).
- Diagrams/tables are preserved as OCR text; not visually reconstructed.
- Heuristic entry count is **not** a publisher’s authoritative lemma count.

## Distinctions

1. **Entire source imported** ≈ available OCR spine pages preserved in vault notes.
2. **Dictionary entries indexed** ≈ 3126 segmented entry notes + A–Z indices.
3. **Interpretation reviewed** ≈ Stage-1 sample only (8), unless later reviewed.

## Stage-1 shortcomings noted (not modified)

- Stage-1 coverage report remains historical for the sample only.
- Stage-1 hub still describes sample status; full navigation is via [[Reference/Gaskell/Start Here|Gaskell Dictionary - Complete Index]].

## Links

- [[Reference/Gaskell/Start Here|Gaskell Dictionary - Complete Index]]
- [[Supporting Material/Gaskell/Reports/Gaskell Usage Guide|Gaskell Usage Guide]]
- [[Reference/Gaskell/Context/Gaskell Dictionary Hub|Gaskell Dictionary Hub]]
