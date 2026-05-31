---
name: react-ui
description: Use when building or reviewing React components, screens, accessibility, mobile layout, or game UI flows.
---

# React UI Skill

## UI priorities

- Mobile portrait first.
- Touch-friendly cells.
- Large number pad.
- Clear selected cell state.
- Clear peer highlighting.
- Clear conflict indication.
- Keyboard support for browser.
- Accessible labels.

## Boundaries

React components must not contain Sudoku solving/generation logic.

Components may:
- Render state.
- Dispatch actions.
- Call selectors.
- Show validation results from engine/state layer.

Components must not:
- Mutate engine grids directly.
- Store canonical game state in local component state.
- Access IndexedDB directly.

## Accessibility

Implement:
- ARIA labels for grid cells.
- Visible focus states.
- Keyboard navigation.
- Non-color-only conflict cues.
- Sufficient contrast.
- Reduced motion compatibility.

## Testing

For UI changes, add Playwright tests for user-facing flows when practical.
