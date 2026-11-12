---
type: study
created: 2026-11-06
updated: 2026-11-06
tags:
  - study
  - vault/maintenance
  - vault/linking-pass
---

# Linking pass 2 — 6 November 2026 (Europe/London)

Reliability pass: verse block-anchor syntax, then page-image checks of the fourteen hub openings and the damaged serpent / Melchizedek citations. No new books, deletions, or setting changes.

During this pass the parent folder on disk was relocated from `Desktop\Lumerian Library Books RAW` to `Desktop\Lumerian Library`. The vault itself is now `C:\Users\mikem\Desktop\Lumerian Library\Lumerian`. Rollback folders moved with it.

## 1. Verse anchors

Study-layer wikilinks used `#kjv-book-chapter-verse` (no caret). Target chapter notes store block IDs as `^kjv-book-ch-v` and headings as `###### Genesis 1:1`, not as `kjv-…`. So those links were heading lookups for a heading that does not exist.

Before repair (Bible–Gaskell tree): **7,740** `#kjv-` (no caret) links, **0** already using `#^kjv-`. All 7,740 were verse-shaped. Each target file was opened and the matching `^` block ID was found (**0** missing files, **0** missing blocks).

Repaired to `#^kjv-…`, preserving display text and the `%2310` path encoding, in **804** files (801 study notes that contained such links + 3 Gaskell entries that carried “Proposed vault link” lines). Total replacements: **7,744**. 141 backed-up study notes had no such links and were left unchanged. No hash mismatches against the pre-edit copies.

After repair, re-check: **7,740** study `#^kjv-` links, **0** remaining no-caret `#kjv-` in that tree, **0** double carets, **7,740** block IDs present in the target chapter files.

## 2. Page-image checks

Recorded in [[Studies/Gaskell Page-Image Checks - 2026-11-06|Gaskell page-image checks]]. Four printed locators were promoted to `image_validated_print_locator`. Original OCR strings were left in place.

## 3. Navigation

`Home` and the Symbols & Concepts index now state the evidence tiers (page-image check, installed source text, unreviewed OCR, explicit citation, overlay, keyword, editorial comparison).

## Rollback

`C:\Users\mikem\Desktop\Lumerian Library\_lumerian_linking_rollback\2026-11-06-pass2-2050\` (945 files + SHA256 list) and later copies for notes edited after the image-check write.

[[Home]] · [[Studies/Linking Pass - 2026-11-06|Pass 1]]
