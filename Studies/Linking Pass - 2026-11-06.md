---
type: study
created: 2026-11-06
updated: 2026-11-06
tags:
  - study
  - vault/maintenance
  - vault/linking-pass
---

# Linking pass — 6 November 2026 (Europe/London)

Additive navigation and shared-concept pass over the **existing** vault only. No new books were ingested. No notes were deleted or renamed. Vault settings were not changed.

## What was added

Fourteen shared concept hubs under `Symbols & Concepts/`, plus an index. Hubs cover only themes that already had Gaskell entries and at least one other installed source or study-layer attachment.

Maintenance note (this file) and updates to `Home`, the Books / Studies folder notes, and the Gaskell / KJV / Hall / Bible–Gaskell start-here notes. Curated “Related shared concept” lines were added to the primary Gaskell entries featured by those hubs, and short reciprocal links were added to selected Hall analytical notes.

## What was not done

- No Drive / EPUB ingestion
- No mass OCR review and no `review_status` upgrades
- No deletion of the empty leftover folder `Books/King James Bible (Project Gutenberg 10)/` (seven 0-byte stubs) or of the 0-byte truncated KJV filenames under `Books/`
- No bulk rewrite of existing Bible–Gaskell bridge anchors
- `%2310` inside wikilinks was left as the vault’s established escape for the `#` in `Project Gutenberg #10` (14,065 such links; **0** raw `#10` wikilinks)

## Link-encoding finding

Path-qualified links use `King James Bible (Project Gutenberg 10)/…` so Obsidian does not treat `#10` as a heading. That encoding is intentional. A separate leftover directory whose *literal* name contains `%2310` holds empty stubs (Genesis 001, Genesis 007, Judges 005, Isaiah.md, Ezekiel 003, Mark 014, Revelation 001). Those stubs were not deleted.

Sampled Bible–Gaskell bridges often point at verse files with `#kjv-…` rather than `#^kjv-…`. Chapter notes store block IDs as `^kjv-…`. New concept hubs use the `#^` form. Bulk repair of older `#kjv-` anchors was left for a later dedicated pass.

## Sources actually in the vault at this pass

About **6,469** Markdown notes: Reference/Gaskell (3,161), Books (1,459: full KJV #10 + Hall STOTA text/notes/evidence), Studies (943, almost all Bible–Gaskell), Supporting Material/Gaskell (859), leftover `Gaskell's/` (38), Templates (3), root (4), Inbox (1), Symbols & Concepts (now the hubs above).

Detailed file list, hashes, and verification notes: on the assistant computer at `/workspace/lumerian-vault-audit/LINKING-PASS-2026-11-06.md`.

[[Home]] · [[Symbols & Concepts/README|Symbols & Concepts]]
