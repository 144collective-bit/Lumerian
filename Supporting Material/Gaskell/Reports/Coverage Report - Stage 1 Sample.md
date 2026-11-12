---
type: coverage-report
source_id: gaskell-dictionary-julian-1960
created: 2026-11-06
review_status: sample-draft
tags:
  - source/gaskell
  - note/meta
  - review/sample
---

# Coverage Report — Stage 1 Sample

Finite inventory for the bounded Gaskell stage (front matter + small A-entry sample).

## Processed in this stage

### Source EPUB
- `Dictionary of All Scriptures & Myths GASKELL.epub` (local Raw Epubs; SHA256 snapped in build logs)

### Preserved OCR text pages (`02 Text`)
- `page_8` … `page_26` (19 pages)
- `page_849` (life-cycle / zodiac diagram; linked from planes note)

### Assets
- `Assets/image_0000_00.jpeg` (referenced by EPUB `page_0`)
- `Assets/image_0010_00.jpeg` (referenced by EPUB `page_10`)

### Front-matter notes
- [[Reference/Gaskell/Context/00 Overview]]
- [[Reference/Gaskell/Context/Preface (OCR context)]]
- [[Reference/Gaskell/Context/Foreword (OCR context)]]
- [[Reference/Gaskell/Context/Introduction (OCR context)]]
- [[Reference/Gaskell/Context/Planes and Tables (OCR)]]

### Sample entries (8)
- [[Reference/Gaskell/Entries/A/AARON, THE HIGH PRIEST]] — EPUB pages `page_24` — `gaskell-1960-entry-aaron-the-high-priest`
- [[Reference/Gaskell/Entries/A/AARU]] — EPUB pages `page_24` — `gaskell-1960-entry-aaru`
- [[Reference/Gaskell/Entries/A/AAT REGION]] — EPUB pages `page_24` — `gaskell-1960-entry-aat-region`
- [[Reference/Gaskell/Entries/A/AAT-SHATET]] — EPUB pages `page_24` — `gaskell-1960-entry-aat-shatet`
- [[Reference/Gaskell/Entries/A/AAT OF THE WATERS]] — EPUB pages `page_24`, `page_25` — `gaskell-1960-entry-aat-of-the-waters`
- [[Reference/Gaskell/Entries/A/AB, THE HEART]] — EPUB pages `page_25` — `gaskell-1960-entry-ab-the-heart`
- [[Reference/Gaskell/Entries/A/ABEL, A KEEPER OF SHEEP]] — EPUB pages `page_25` — `gaskell-1960-entry-abel-a-keeper-of-sheep`
- [[Reference/Gaskell/Entries/A/ABLUTION BY USE OF WATER]] — EPUB pages `page_25` — `gaskell-1960-entry-ablution-by-use-of-water`

### Hub
- [[Reference/Gaskell/Context/Gaskell Dictionary Hub]]

## Explicitly skipped / not done
- Full dictionary digestion (all letters)
- Entry `ABERAMENTHO` (nested `:—` in OCR made automatic delimiting unreliable; used only as a boundary for [[Reference/Gaskell/Entries/A/ABEL, A KEEPER OF SHEEP]])
- Mass promotion into `03 Symbols & Concepts`
- Print-page number claims
- Outside biographical/historical research
- Reconstruction of unclear multi-column tables on `page_13`–`page_14` into grids
- EPUB pages outside the preserved set (including missing `page_1`–`page_7`, `page_851`–`page_854`)

## Checks performed
- Each sample headword needle appears **exactly once** in the `page_24`–`page_26` OCR concat used for delimiting
- Each sample entry body is an **exact substring** of that OCR concat (after removing page markers)
- Quoted definition sentences used in entry notes were checked with substring assertions against the entry body
- Wikilinks in this stage point only to notes created in this stage (unresolved See targets listed as plain text, not dangling wikilinks)
- Existing vault notes/templates are validated unchanged via before/after hashes after the machine write

## Limits
- Entry-detection heuristics elsewhere are **not** a complete dictionary count
- OCR errors are pervasive (names, See-targets, punctuation)
- Locators are EPUB `page_N` file IDs only
- This sample is for method review before any larger batch

## Unresolved See targets in the sample (review queue)

| Entry | OCR See target |
|---|---|
| AARON, THE HIGH PRIEST | `ADVARYA` |
| AARON, THE HIGH PRIEST | `AGNIDHRA` |
| AARON, THE HIGH PRIEST | `ATHOBNE` |
| AARON, THE HIGH PRIEST | `CaLF (molten)` |
| AARON, THE HIGH PRIEST | `CHRYSE` |
| AARON, THE HIGH PRIEST | `HIGH PRIEST` |
| AARON, THE HIGH PRIEST | `PontirF` |
| AARON, THE HIGH PRIEST | `Porr` |
| AARON, THE HIGH PRIEST | `Priest` |
| AARON, THE HIGH PRIEST | `SCAPEGOAT` |
| AARON, THE HIGH PRIEST | `TEMPLE` |
| AARON, THE HIGH PRIEST | `URiIM` |
| AARU | `SEKHET` |
| AAT,—REGION | `ASons` |
| AAT OF THE WATERS | `BuppHa` |
| AAT OF THE WATERS | `CHRIST’s SECOND COMING` |
| AAT OF THE WATERS | `COMETS` |
| AAT OF THE WATERS | `CONFLAGRATION` |
| AAT OF THE WATERS | `Horse (white)` |
| AAT OF THE WATERS | `JUDGMENT Day` |
| AAT OF THE WATERS | `Kaiki` |
| AAT OF THE WATERS | `KARSHVARES` |
| AAT OF THE WATERS | `PLANETABRY` |
| AAT OF THE WATERS | `AB REGIONS` |
| AAT OF THE WATERS | `REGNAROK` |
| AAT OF THE WATERS | `RENOVATION` |
| AAT OF THE WATERS | `SosiosH` |
| AAT OF THE WATERS | `SPRINGTIME` |
| AAT OF THE WATERS | `THIRST` |
| AB, THE HEART | `Causat` |
| AB, THE HEART | `Heart` |
| AB, THE HEART | `Inace` |
| AB, THE HEART | `JOB` |
| AB, THE HEART | `JUDGMENT-HALL` |
| AB, THE HEART | `MICROCOsM` |
| AB, THE HEART | `TEMPLE` |
| ABEL, A KEEPER OF SHEEP | `Atom` |
| ABEL, A KEEPER OF SHEEP | `Carn` |
| ABEL, A KEEPER OF SHEEP | `Lams` |
| ABEL, A KEEPER OF SHEEP | `SETH` |
| ABLUTION BY USE OF WATER | `BaptisM` |
| ABLUTION BY USE OF WATER | `WASHED` |
| ABLUTION BY USE OF WATER | `WATER` |

## Links
- Hub: [[Reference/Gaskell/Context/Gaskell Dictionary Hub]]
- Overview: [[Reference/Gaskell/Context/00 Overview]]
