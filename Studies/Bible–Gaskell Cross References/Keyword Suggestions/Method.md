---
type: meta
created: 2026-11-06
tags:
  - crossref/bible-gaskell
  - tier/keyword
---

# Keyword / symbol suggestion method

**Separate tier** from explicit citations. Lexical matches are **not** interpretations and are **not** evidence that Gaskell cited the verse.

## Eligible headwords

- YAML `headword` + attested `aliases`
- Exclude uncertain segmentation heads (many commas / very long filenames)
- Length 4–60; reject comma-lists (≥3 commas)
- Reject stopword-only phrases
- Multiword heads searched as literal phrases with word boundaries
- Single-word heads: word-boundary token match (min 4 letters)

## Caps (explicit)

- Max term notes published: **400** (eligible terms with ≥1 hit, sorted by discovery order)
- Max verse links listed per term: **40** (full hit count still recorded)
- Remaining eligible terms not published due to term cap: **43**

## Rejected headword reasons (counts)

- `comma_list_head`: 35
- `too_long`: 20
- `too_short`: 14
- `uncertain_segmentation_head`: 11

## Obsidian native search (verified pattern)

Scoped path search in Obsidian’s search pane (no plugin required):

```text
path:"Books/King James Bible" altar
```

For a phrase:

```text
path:"Books/King James Bible" "burnt offering"
```

For Gaskell entries:

```text
path:"Reference/Gaskell/Entries" altar
```

## Regular plural forms (R2 2026-11-06)

- For single-token English heads, also match the attested regular plural (`serpent`/`serpents`) when that plural appears in KJV.
- Do **not** broad-stem (no `serp`, no `serpentin*`). Preserve per-form counts.
- Cap on listed verse links remains **40**; `total_hits` records the full either-form count.
