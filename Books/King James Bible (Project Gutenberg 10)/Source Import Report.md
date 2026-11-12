---
type: import-report
source_id: pg-kjv-10
created: 2026-11-06
tags:
  - source/kjv
  - note/report
---

# Source Import Report — KJV (Project Gutenberg #10)

## Counts

| Metric | Value |
|---|---|
| Books imported | 66 |
| Chapters imported | 1189 |
| Unique verse labels imported | 31102 |
| Verse block IDs | 31102 |
| Independent source token count | 31102 |
| EPUB SHA256 | `DA304C854C96AB9B496A36678D28E2ED069D37AD7FEED952C7D8979C62FA8E29` |
| EPUB SHA match expected | True |
| Import verse fingerprint | `1844cf5c408634193c79fdf757eaa3c3d9ae59e8c6cb3428d741daccc58e86d0` |
| Independent parse fingerprint | `1844cf5c408634193c79fdf757eaa3c3d9ae59e8c6cb3428d741daccc58e86d0` |
| Fingerprints match | True |
| Phase-1 fingerprint match | False |

## Method

1. Unpack EPUB XHTML spine (`*_10-h-N.htm.xhtml`).
2. Split on book `<h2>` titles from the spine.
3. Extract `<p>` text; split each paragraph on `chapter:verse` labels (including mid-paragraph labels).
4. Preserve text before the first label in a run as unnumbered preface/superscription attached to the following verse.
5. Whitespace normalized to single spaces within a verse; punctuation and Unicode preserved.
6. Front matter + PG license stored under `Source Material/` inside this book folder.

## Limits

- Compared to the **supplied EPUB** only — not an independent historical KJV edition check.
- Not the 1611 first printing; PG text updated **29 October 2024** per front matter.
- No Apocrypha books in this EPUB.
- No commentary; no automatic cross-links to Gaskell or other vault notes.
- Chapters with source-absent verse numbers (should be empty if parse complete): **0**

## Unmatched / preserved fragments

- `{'book': 'Galatians', 'where': 'trailing', 'text': 'Amen. Amen.'}`
- `{'book': 'Ephesians', 'where': 'trailing', 'text': 'Amen. Amen.'}`
- `{'book': 'Revelation', 'where': 'outside-p', 'text': '*** END OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE *** Updated editions will replace the previous one—the old editions will be renamed. Creating the works from print editions not protected by U.S. copyright law means that no one owns a United States copyright in these works, so the Foundation (and you!) can copy and distribute it in the United States without permission and without paying copyright royalties. Special rules, set forth in the General Terms of Use part of this license, apply to copying and distributing Project Gutenberg™ electronic works to protect the PROJECT GUTENBERG™ concept and trademark. Project Gutenberg is a registered trademark, and may not be used if you charge for an eBook, except by following the terms of the trademark license, including paying royalties for use of the Project Gutenberg trademark. If you do not charge anything for copies of this eBook, complying with the trademark license is very easy. You may use this eBook for nearly any purpose such as creation of derivative works, reports, performances and research. Project Gutenberg eBooks may be modified and printed and given away—you may do practically ANYTHING in the United States with eBooks not protected by U.S. copyright law. Redistribution is subject to the trademark license, especially commercial redistribution. START: FULL LICENSE THE FULL PROJECT GUTENBERG LICENSE PLEASE READ THIS BEFORE YOU DISTRIBUTE OR USE THIS WORK To protect the Project Gutenberg™ mission of promoting the free distribution of electronic works, by using or distributing this work (or any other work associated in any way with the phrase “Project Gutenberg”), you agree to comply with all the terms of the Full Project Gutenberg™ License available with this file or online at www.gutenberg.org/license. Section 1. General Terms of Use and Redistributing Project Gutenberg™ electronic works 1.A. By reading or using any part of this Project Gutenberg™ electronic work, you indicate that you ha'}`

## Per-book totals

| # | Book | Chapters | Verses |
|---|---|---:|---:|
| 01 | Genesis | 50 | 1533 |
| 02 | Exodus | 40 | 1213 |
| 03 | Leviticus | 27 | 859 |
| 04 | Numbers | 36 | 1288 |
| 05 | Deuteronomy | 34 | 959 |
| 06 | Joshua | 24 | 658 |
| 07 | Judges | 21 | 618 |
| 08 | Ruth | 4 | 85 |
| 09 | 1 Samuel | 31 | 810 |
| 10 | 2 Samuel | 24 | 695 |
| 11 | 1 Kings | 22 | 816 |
| 12 | 2 Kings | 25 | 719 |
| 13 | 1 Chronicles | 29 | 942 |
| 14 | 2 Chronicles | 36 | 822 |
| 15 | Ezra | 10 | 280 |
| 16 | Nehemiah | 13 | 406 |
| 17 | Esther | 10 | 167 |
| 18 | Job | 42 | 1070 |
| 19 | Psalms | 150 | 2461 |
| 20 | Proverbs | 31 | 915 |
| 21 | Ecclesiastes | 12 | 222 |
| 22 | Song of Solomon | 8 | 117 |
| 23 | Isaiah | 66 | 1292 |
| 24 | Jeremiah | 52 | 1364 |
| 25 | Lamentations | 5 | 154 |
| 26 | Ezekiel | 48 | 1273 |
| 27 | Daniel | 12 | 357 |
| 28 | Hosea | 14 | 197 |
| 29 | Joel | 3 | 73 |
| 30 | Amos | 9 | 146 |
| 31 | Obadiah | 1 | 21 |
| 32 | Jonah | 4 | 48 |
| 33 | Micah | 7 | 105 |
| 34 | Nahum | 3 | 47 |
| 35 | Habakkuk | 3 | 56 |
| 36 | Zephaniah | 3 | 53 |
| 37 | Haggai | 2 | 38 |
| 38 | Zechariah | 14 | 211 |
| 39 | Malachi | 4 | 55 |
| 40 | Matthew | 28 | 1071 |
| 41 | Mark | 16 | 678 |
| 42 | Luke | 24 | 1151 |
| 43 | John | 21 | 879 |
| 44 | Acts | 28 | 1007 |
| 45 | Romans | 16 | 433 |
| 46 | 1 Corinthians | 16 | 437 |
| 47 | 2 Corinthians | 13 | 257 |
| 48 | Galatians | 6 | 149 |
| 49 | Ephesians | 6 | 155 |
| 50 | Philippians | 4 | 104 |
| 51 | Colossians | 4 | 95 |
| 52 | 1 Thessalonians | 5 | 89 |
| 53 | 2 Thessalonians | 3 | 47 |
| 54 | 1 Timothy | 6 | 113 |
| 55 | 2 Timothy | 4 | 83 |
| 56 | Titus | 3 | 46 |
| 57 | Philemon | 1 | 25 |
| 58 | Hebrews | 13 | 303 |
| 59 | James | 5 | 108 |
| 60 | 1 Peter | 5 | 105 |
| 61 | 2 Peter | 3 | 61 |
| 62 | 1 John | 5 | 105 |
| 63 | 2 John | 1 | 13 |
| 64 | 3 John | 1 | 14 |
| 65 | Jude | 1 | 25 |
| 66 | Revelation | 22 | 404 |
