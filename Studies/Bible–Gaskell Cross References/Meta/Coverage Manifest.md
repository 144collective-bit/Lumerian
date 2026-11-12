---
type: coverage-manifest
created: 2026-11-06
tags:
  - crossref/bible-gaskell
---

# Coverage Manifest — Bible–Gaskell Cross References

## Scan

| Metric | Count |
|---|---:|
| Gaskell entries scanned | 3126 |
| Citation occurrences (deduped locator+span) | 500 |
| Unique normalised refs (all tiers) | 438 |
| Distinct verse targets (validated bridges) | 455 |
| Bridge notes published | 442 |
| Bible book indexes | 66 |
| Keyword term notes | 400 |
| Keyword eligible terms considered | 3018 |
| Keyword term-cap remainder | 43 |

## Tiers (parser)

- `chapter_only`: 45
- `citation_validated`: 404
- `queue_invalid`: 15
- `queue_ocr`: 36

## Resolve buckets

- `invalid_chapter`: 4
- `invalid_range`: 5
- `invalid_verse`: 6
- `ocr_suspicious_not_auto_linked`: 36
- `resolved_chapter`: 45
- `resolved_verses`: 404

## Limits

- Regex over OCR fences only — not exhaustive recall of all Scripture mentions.
- `citation_validated` = ID existence checks, **unreviewed** unless listed in Manual Sample Checks.
- Keyword tier is lexical only.
- No Apocrypha books in installed KJV (PG#10).
- Wisdom-of-Solomon false positives from bare word *wisdom* removed; only `Wisd.` style abbr accepted for that bucket.
