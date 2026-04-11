

## Plan: Futuristic Approved Jobs Page with Dialer-Style Job Selector

### Concept
Transform the Approved Jobs page (`ApprovedJobsSlider.tsx`) into a high-tech command center with two key elements:
1. **Left panel**: A "dialer" -- a vertical scroll wheel where job numbers roll up/down with 3D perspective, the selected item is centered and glowing
2. **Right panel**: A holographic job detail card with animated borders, data-stream effects, and a futuristic background

### 1. Dialer-Style Job Number Selector (Left Panel)

Replace the current flat list with a **3D rotating dial**:
- Show ~7 visible job numbers at a time in a vertical column
- The center item is large, bright, neon-glowing (selected)
- Items above/below progressively shrink, fade, and rotate away (CSS `perspective` + `rotateX` transforms)
- Mouse wheel / arrow keys / swipe scrolls through jobs with smooth CSS transitions
- Each item shows job number + mini status dot
- Up/Down chevron buttons at top and bottom with pulse animation

**Implementation**: Pure CSS transforms + React state. Each visible item gets a `rotateX` and `scale` based on distance from center. Wrap in a fixed-height container with `overflow: hidden`.

### 2. Futuristic Job Details Panel (Right Panel)

Redesign the right detail panel:
- **Background**: Animated radial gradient with slow-moving energy lines (CSS keyframes, no canvas)
- **Header**: Large holographic job number with text-shadow glow, pulsing hexagonal priority badge
- **Detail cards**: Glassmorphism with animated neon borders (`@keyframes border-travel`)
- **Data stream effect**: Subtle scrolling binary/hex text in the background (CSS animation on a pseudo-element)
- **Status badge**: Large, glowing, with animated ring around it

### 3. CSS Additions (`src/index.css`)

Add these gaming-mode specific classes:
- `.dialer-container` -- perspective container for 3D wheel
- `.dialer-item` -- base item with transition
- `.dialer-item-active` -- center glow + scale
- `.holographic-panel` -- animated gradient background with scanlines
- `.data-stream` -- scrolling pseudo-element with matrix-style text
- `@keyframes border-travel` -- animated border that moves around the card
- `.hex-priority` -- hexagonal priority indicator with pulse

### 4. File Changes

**`src/components/job-management/ApprovedJobsSlider.tsx`** -- Major rewrite of the layout:
- Left panel: Replace flat list with dialer component (inline, ~80 lines)
  - Calculate visible window of 7 items centered on `selectedJobIndex`
  - Apply `transform: perspective(800px) rotateX(Ndeg) scale(S)` per item based on offset
  - Mouse wheel handler for scrolling
- Right panel: Add holographic styling classes, animated background div, hex priority badge
- Keep all existing filter/search logic untouched
- Both panels adapt: normal mode stays clean, gaming mode gets the full futuristic treatment

**`src/index.css`** -- Add ~60 lines of gaming-mode CSS for dialer and holographic effects

### Summary

| File | Action |
|------|--------|
| `src/components/job-management/ApprovedJobsSlider.tsx` | Rewrite left panel as 3D dialer, restyle right panel as holographic display |
| `src/index.css` | Add dialer, holographic, data-stream, border-travel CSS |

