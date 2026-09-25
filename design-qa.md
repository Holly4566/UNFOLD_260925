# Design QA

- source visual truth path: `D:\Projects\人生群岛\人生群岛参考图.png`
- implementation screenshot path: `D:\Projects\人生群岛\outputs\qa-desktop.png`
- combined comparison: `D:\Projects\人生群岛\outputs\qa-comparison.png`
- supporting mobile screenshot: `D:\Projects\人生群岛\outputs\qa-mobile.png`
- desktop viewport: 1536 × 1024 CSS px, deviceScaleFactor 1
- source pixels: 1536 × 1024
- implementation pixels: 1536 × 1024
- mobile viewport: 390 × 844 CSS px, deviceScaleFactor 1
- state: fresh empty map on desktop; completed mystery-event flow on mobile

## Full-view comparison evidence

The implementation preserves the reference's full-screen cinematic sea, elevated islands, misty palette, sparse cream controls and quiet exploratory mood. The empty-map composition intentionally contains fewer ordinary islands because the approved product state starts without sample life islands.

## Required fidelity surfaces

- Fonts and typography: restrained Chinese system sans for controls and Song-style serif for poetic/title text; hierarchy and mobile wrapping are clear.
- Spacing and layout rhythm: full-bleed map, compact floating chrome and generous open water match the reference's visual economy.
- Colors and tokens: muted blue-green sea, fog white, charcoal controls and warm paper surfaces remain close to the source palette.
- Image quality: ocean, ordinary island, mystery island, boat and bottle are separate high-resolution project assets; no reference screenshot is used as the background.
- Copy and content: only approved product copy appears; no dashboard navigation or invented metrics were added.

## Focused evidence

The mobile screenshot verifies the most visually dense state: the mystery sheet fits the 390 × 844 viewport, keeps the map visible behind it, and gives the primary bottle action visual priority. No additional crop was required because all controls and typography are readable at native resolution.

## Interaction and runtime checks

- Created and edited an island on a touch-enabled mobile context.
- Changed island status and closed the editor.
- Opened the mystery island, drew a random event, accepted it and marked it complete.
- Confirmed persisted localStorage state.
- Loaded desktop and mobile views with no browser console errors or Vite error overlay.

## Findings

No actionable P0, P1 or P2 mismatches remain. The difference in ordinary island density is an intentional empty-state product requirement, not visual drift.

## Comparison history

- Initial mobile capture exposed uncovered canvas below the world and remote-font console failures.
- Fixed by calculating the initial viewport from the current screen, removing the network font dependency and adding an inline favicon.
- Post-fix desktop and mobile captures cover the viewport, preserve readable controls and report no console errors.

final result: passed
