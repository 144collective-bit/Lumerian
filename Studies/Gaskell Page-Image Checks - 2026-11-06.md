---
type: study
created: 2026-11-06
updated: 2026-11-06
tags:
  - study
  - vault/maintenance
  - review/page-image
---

# Gaskell page-image checks — 6 November 2026 (Europe/London)

Independent check of **selected** pages used by the fourteen shared concept hubs, against scan page images. This does **not** review the rest of the dictionary.

## Source of the images

| Item | Detail |
|---|---|
| Internet Archive | [`dictionary-of-all-scriptures-myths-gaskell`](https://archive.org/details/dictionary-of-all-scriptures-myths-gaskell) (Public Domain Mark 1.0) |
| Vault EPUB | `Raw Epubs/Dictionary of All Scriptures & Myths GASKELL.epub` |
| Identity | EPUB MD5 `5f6d40f9b213feab9c2c48a2e6f76e46` matches the IA EPUB exactly |
| Images read from | IA scan PDF `Dictionary of All Scriptures & Myths GASKELL.pdf` (154,388,933 bytes; 857 pages; PDF metadata names HathiTrust / “Dictionary of all scriptures and myths”) |
| Not used as images | The EPUB itself contains only three JPEGs (`image_0000`, `image_0010`, `image_0856`) — not dictionary body pages |
| Mapping used | EPUB `page_N` = IA leaf `N` = **PDF page N+1** = printed page **N−7** (for body leaves). Calibration: PDF page 161 shows printed **153** CHRIST; PDF page 160 showed printed 152 and was rejected as the wrong leaf |

The 1960 Julian Press reprint and this scan PDF are treated as the edition already named in the vault. Print page numbers below are the numbers printed on the scanned leaves.

Original OCR notes were **not** silently rewritten.

## Promoted scripture locators (printed text read on the scan)

These were previously OCR-damaged candidates. The printed book is clear; the damage was in the EPUB OCR string.

| Entry | EPUB page | PDF page | Print page | OCR string (preserved) | Printed locator | Installed KJV target | Status |
|---|---:|---:|---:|---|---|---|---|
| [[Reference/Gaskell/Entries/C/CURSE ON THE SERPENT]] | page_203 | 204 | 196 | `Grn. iii. 14` | **GEN. iii. 14** | [[Books/King James Bible (Project Gutenberg 10)/01 Genesis/Genesis 003#^kjv-gen-3-14]] | `image_validated_print_locator` |
| [[Reference/Gaskell/Entries/S/SERPENT, BRAZEN]] | page_681 | 682 | 674 | (overlay: `JonN ii. 14`) | **JOHN iii. 14** | [[Books/King James Bible (Project Gutenberg 10)/43 John/John 003#^kjv-jhn-3-14]] | `image_validated_print_locator` |
| [[Reference/Gaskell/Entries/T/TREADING UNHARMED ON SERPENTS AND SCORPIONS]] | page_771 | 772 | 764 | (overlay: `BLuUuKe x. 19, 20`) | **LUKE x. 19, 20** | [[Books/King James Bible (Project Gutenberg 10)/42 Luke/Luke 010#^kjv-luk-10-19]] and [[Books/King James Bible (Project Gutenberg 10)/42 Luke/Luke 010#^kjv-luk-10-20]] | `image_validated_print_locator` |
| [[Reference/Gaskell/Entries/M/MELCHIZEDEK]] | page_499 | 500 | 492 | `HEs. vii. 2, 3` | **HEB. vii. 2, 3** | [[Books/King James Bible (Project Gutenberg 10)/58 Hebrews/Hebrews 007#^kjv-heb-7-2]]–[[Books/King James Bible (Project Gutenberg 10)/58 Hebrews/Hebrews 007#^kjv-heb-7-3]] | `image_validated_print_locator` (no prior overlay; see new note) |

Also seen while reading the same leaves (not previously in the damaged-OCR cluster):

- [[Reference/Gaskell/Entries/T/TABERNACLE]] print 739: **HEB. viii. 5** visible, matching the existing parser bridge.
- [[Reference/Gaskell/Entries/V/VEIL OF ISIS]] print 788: **PROV. viii. 23** visible, matching the existing parser bridge.

Promotion means the **printed locator** was read on the scan and matches the installed KJV passage already linked. It does **not** mean Gaskell’s interpretation equals the verse.

## Hub openings checked against the scan

Only the opening definition (and, where noted, an OCR typo) was checked. Later columns / following pages of long entries were not fully read.

| Hub / entry | EPUB | PDF | Print | Opening as printed | OCR issues noticed |
|---|---|---:|---:|---|---|
| CHRIST | page_160 | 161 | 153 | “Christ, or the Higher Self, is the fundamental principle underlying the idea of personal Godhood…”; also “He alone is the Way, the Truth, and the Life…” | OCR `fandamental` ← printed **fundamental**; OCR `fortu` ← printed **forth** |
| CROSS | page_194 | 195 | 187 | “A symbol of the manifested life of the Logos—the higher and lower natures, and the Divine Ray passing through the quaternary.” Golden Legend four-woods story present | Opening matches |
| SERPENT | page_680 | 681 | 673 | “A symbol of the inner forces of the relative existence…”; higher atma-buddhic / lower kama-manasic | OCR `inger` ← printed **inner** |
| SERPENT, BRAZEN | page_681 | 682 | 674 | “A symbol of the buddhic forces acting through the mind, which raise and heal the soul.” + JOHN iii. 14 | Locator recovered (above) |
| SUN | page_737 | 738 | 730 | “The great and universal symbol of the Higher Self,—God manifest,—the central source of Light and Life within the soul.” | OCR had run-on “Self,God”; printed has dashes |
| TREE OF LIFE | page_772 | 773 | 765 | “A symbol of the Divine Life which spreads through the universe and soul…” | Opening matches |
| SEPHIROTH OR NUMERATIONS | page_679 | 680 | 672 | “These ten conditions of being constitute with their relations a scheme of life…” | Opening matches |
| ALCHEMY | page_45 | 46 | 38 | “This signifies the production, by unperceived processes, of the higher qualities from the lower…” | Opening matches |
| VEIL OF ISIS | page_795 | 796 | 788 | “A symbol of the higher mind inaccessible to the lower consciousness.” | Opening matches; PROV. viii. 23 on the same leaf |
| MELCHIZEDEK | page_499 | 500 | 492 | “A symbol of the Higher Self.” + HEB. vii. 2, 3 | OCR `HEs.` ← printed **HEB.** |
| TABERNACLE | page_746 | 747 | 739 | “A symbol in its higher aspect of the causal-body; in its lower aspect, of the astro-mental body.” | Opening matches; HEB. viii. 5 on the same leaf |
| FIRE | page_281 | 282 | 274 | Higher aspect = Divine love / Atma-buddhi; lower = strong desire or passion | Opening matches |
| WATER (HIGHER ASPECT) | page_811 | 812 | 804 | “The great symbol of Truth or the eternal Reality and source of all manifestation.” | Opening matches |
| LOGOS (REASON-SPEECH) | page_464 | 465 | 457 | “A symbol of the Higher Self manifesting on the upper mental plane as a Divine outpouring of life and form,—the utterance of creative energy.” | Opening matches |
| LIGHT | page_458 | 459 | 451 | “A symbol of Truth, Wisdom and Knowledge, and of the consciousness which apprehends reality or relativity in each.” | Opening matches |
| WORD OF GOD | page_833 | 834 | 826 | “A symbol of the **expression of** Divine Truth in the **various scriptures** of the world.” | OCR short definition “Divine Truth in the tures of the world” is damaged; printed wording is as quoted |


## Added during linking pass 3 (baptism leaves)

These two leaves were read independently while opening the Baptism hub. They do not review the rest of either entry.

| Entry | EPUB page | PDF page | Print page | OCR string (preserved) | Printed locator / wording | Installed KJV target | Status |
|---|---:|---:|---:|---|---|---|---|
| [[Reference/Gaskell/Entries/B/BAPTISM OF WATER]] | page_98 | 99 | 91 | `Mart. xxviii. 19` | **MAT. xxviii. 19** (quotation uses “make disciples… into the name…”, not the installed KJV’s “teach… in the name…”) | [[Books/King James Bible (Project Gutenberg 10)/40 Matthew/Matthew 028#^kjv-mat-28-19]] | `image_validated_print_locator` |
| [[Reference/Gaskell/Entries/B/BAPTISM OF FIRE]] | page_99 | 100 | 92 | opening `Christhoo`; `Mar. iii. 11` / `Mat. iii. 11` | Opening printed **Christhood**. Quotation: “He shall baptize you with the Holy Ghost and with fire.” Same leaf has a parenthetical **MAT. iii. 11**. The abbreviation right after Gaskell’s lemma-quote was transcribed as `Mar. iii. 11`; the quoted words match Matthew 3:11, not Mark 3:11. | [[Books/King James Bible (Project Gutenberg 10)/40 Matthew/Matthew 003#^kjv-mat-3-11]] | quotation text confirmed; MAT/Mar abbreviation caution; existing parser bridge retained |

See [[Studies/Bible–Gaskell Cross References/Citation Corrections/baptism-of-water__matthew-28-19-image-validated]] and [[Symbols & Concepts/Baptism]].

## Not claimed

- The unqualified [[Reference/Gaskell/Entries/W/WATER]] note (`page_227`) was not separately image-checked in this pass.
- Following pages of multi-page entries (for example CHRIST `page_161`, SUN `page_738`–`page_739`) were extracted but not treated as fully read.
- No Gaskell entry `review_status` was changed to reviewed. Image checks apply to the openings and locators listed here only.

[[Studies/Linking Pass 2 - 2026-11-06]] · [[Studies/Linking Pass 3 - 2026-11-06]] · [[Symbols & Concepts/README]] · [[Home]]
