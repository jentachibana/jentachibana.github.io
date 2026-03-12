# Interview: Movement Page
<!-- Generated: 2026-03-11 | Edit answers below, then tell Claude to continue -->
<!-- Check boxes with [x], add notes, or check Skip to omit a question -->

## Layout & Structure

### Should the movement page follow the same sidebar + main area layout as cooking?
- [ ] Yes — sidebar with activity list, main area with photo grid (same as cooking page)
- [ x] Different — no sidebar, activity toggles across the top, photos fill the full width below
- [ ] Different — activity toggles as a horizontal bar, photos below, no persistent sidebar
- Skip: [ ]
Notes:

### How should dance sub-categories (lindy hop, fusion) work?
- [ x] Clicking "dance" expands to show lindy hop / fusion as nested sub-options in the nav
- [ ] Clicking "dance" shows all dance photos, with lindy hop / fusion as filter tabs within the photo area
- [ ] Dance, lindy hop, and fusion are all top-level options (no nesting)
- Skip: [ ]
Notes:

## Photos & Content

### Where will movement photos come from?
- [ ] Synced from an Obsidian vault folder (like recipes from ~/Sync/Recipes) — I'll set up a sync script
- [ ] Manually added to assets/images/movement/ in the repo
- [ ] A mix — some synced, some manual
- Skip: [ ]
Notes:

### How should photos be organized in the filesystem?
- [ ] One folder per activity: assets/images/movement/lindy-hop/, assets/images/movement/gym/, etc.
- [ ] All in one flat folder with naming convention: assets/images/movement/lindy-hop-001.jpg
- [ ] Defined in a YAML data file (_data/movement.yml) that maps activities to image paths
- Skip: [ ]
Notes:

### What happens when you click on an individual photo?
- [x ] Nothing — just a grid of photos, no detail view
- [ ] Lightbox — photo expands to fill the screen, click/esc to close
- [ ] Opens a detail view like cooking recipes (with caption, date, or other metadata)
- Skip: [ ]
Notes:

## Visual Design

### Should the movement page share the same color scheme as cooking (#f5f0e8 warm beige)?
- [ ] Yes — same background and font styling across all hobby pages
- [x ] No — each hobby page should have its own color palette (what colors for movement?)
- Skip: [ ]
Notes:

### Photo grid style?
- [ ] Uniform grid — all photos same size, square crop (like cooking)
- [ ] Masonry / Pinterest-style — photos keep their natural aspect ratio, staggered layout
- [ x] Mix of sizes — some photos larger/featured, others smaller in a grid
- Skip: [ ]
Notes:

## Scope & Non-Goals

### What should NOT be included in the first version?
- [ ] No video support — photos only for now
- [ ] No captions or metadata on photos — just the images
- [ ] No filtering beyond the activity toggles (no date filters, location filters, etc.)
- [ ] All of the above — keep it minimal
- Skip: [ x]
Notes:

### Should there be a "back to sloppy popsicle" link like the cooking page has?
- [ x] Yes — same style link back to homepage
- [ ] No — use browser back / nav header instead
- Skip: [ ]
Notes:
