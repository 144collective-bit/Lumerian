---
type: report
source_id: hall-stota-2009-web-pdf
status: pass2-scripture-scan
created: 2026-11-06
tags:
  - source/hall-stota
  - report/scripture
---

# Scripture scan — Pass 2 (full Hall corpus)

Scanned all **675** page text extracts / **52** units with a strict `Book + chapter [+ .|: verse]` parser plus a small quotation-correspondence layer.

## Headline counts

| Class | Count |
|---|---|
| Explicit verse references | **9** |
| Quotation correspondence hits | **2** |
| Chapter-level forms (provisional) | **13** |
| Book-name mentions (no locator) | **208** |
| Rejected false positives / weak parses | **75** |
| Units with ≥1 verse or quotation hit | **7** |

## Explicit verse inventory (Hall form → target)

| Hall raw | Resolved | PDF | Unit | KJV block |
|---|---|---|---|---|
| `Ezekiel viii. 14` | Ezekiel 8:14 | 88 | Atlantis and the Godsof Antiquity | `^kjv-eze-8-14` |
| `John iii. 3` | John 3:3 | 125 | Isis, the Virginof the World | `^kjv-jhn-3-3` |
| `John iii. 3` | John 3:3 | 272 | Fishes, Insects, Animals, Reptiles and Birds Part Two | `^kjv-jhn-3-3` |
| `Ezekiel i. 14` | Ezekiel 1:14 | 352 | The Qabbalah, the Secret Doctrine of Israel | `^kjv-eze-1-14` |
| `Job. xxxvii. 6` | Job 37:6 | 353 | The Qabbalah, the Secret Doctrine of Israel | `^kjv-job-37-6` |
| `Psalms civ. 4` | Psalms 104:4 | 353 | The Qabbalah, the Secret Doctrine of Israel | `^kjv-psa-104-4` |
| `Gen. xviii. 2` | Genesis 18:2 | 384 | Qabbalistic Keys to the Creation of Man | `^kjv-gen-18-2` |
| `John ii. 20` | John 2:20 | 390 | Qabbalistic Keys to the Creation of Man | `^kjv-jhn-2-20` |
| `Rev. viii. 10-11` | Revelation 8:10-11 | 618 | The Mystery of the Apocalypse | `^kjv-rev-8-10` |

## Quotation correspondence

| Saying / label | PDF | Unit | Block |
|---|---|---|---|
| Luke 3:23 | 590 | Mystic Christianity | `^kjv-luk-3-23` |
| John 14:6 | 593 | Mystic Christianity | `^kjv-jhn-14-6` |

## Parser limits (documented — not claimed exhaustive of every style)

- Requires Book + chapter numeral (Roman or Arabic); verse only if : or . separator present
- Hall-style Roman chapters supported via subtractive Roman parser
- Author-name false positives (John Dee/Cremer/etc.) largely rejected
- Common-noun Numbers rejected
- Not exhaustive of every possible citation style (e.g., bare “xxiv, 15” without book name on same line)
- Quotation-correspondence layer covers a few famous sayings beyond numeral cites
- Chapter-only refs remain provisional until human review of context
- Bare verse numerals without a book token on the same match span are out of scope.
- Writer-attributed scripture inside Hall quotes is still Hall’s page evidence; this scan does not separately certify the quoted author’s accuracy.
- Prior handpicked 4-pattern list is superseded for inventory purposes by this corpus scan (those patterns remain useful as quotation aids).

## Deep analytical notes this pass

First **4** substantive chapters (source order after front matter): Ancient Mysteries I–III; Atlantis. Mystic Christianity pilot depth preserved separately. Chapters 5–8 of the substantive sequence not deepened this pass.



## Scripture corpus counts (corrected vocabulary)

| Metric | Value | Meaning |
|---|---|---|
| Explicit verse **occurrences** in Hall | **9** | Each Hall `Book + chapter + .|: + verse` hit (incl. duplicate John iii. 3 on two pages) |
| Distinct verse **targets** | **8** | Unique (book, chapter, verse[, end]) after normalisation |
| Quotation-correspondence **occurrences** | **2** | Famous-saying ↔ KJV matches (not numeral cites) |
| Distinct quotation targets | **2** | Unique labels/blocks |
| Validated KJV block IDs on disk | **10** | Physical `^kjv-…` anchors confirmed present (not the same as “number of citations”) |
| Chapter-level provisional forms | **13** | No verse; not counted as verse evidence |
| Book-name mentions | **208** | Not citations |

Do **not** equate validated block count with citation count. Example: 9 verse occurrences → 8 distinct targets (John 3:3 appears twice) + 2 quotation occurrences; 11 is the count of validated block checks across verse+quote occurrences, not 11 separate Hall references.

