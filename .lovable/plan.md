

## Plan: Cyberpunk Gaming Mode UI Transformation

### Priority 0: Fix Build Error
The `tsconfig.json` is missing `"baseUrl": "."` which breaks all `@/` path imports. This must be restored first.

### 1. Add Orbitron Font
- **`index.html`** -- Add Google Fonts link for Orbitron
- **`src/index.css`** -- Update `.gaming-mode` to use `'Orbitron', sans-serif` with letter-spacing

### 2. Gaming Mode CSS Variables and Theme
- **`src/index.css`** -- Add a `.gaming-mode` CSS variable set (like `.ramadan`) overriding all design tokens:
  - Dark backgrounds: `hsl(220 20% 4%)` 
  - Neon green primary: `hsl(150 100% 50%)`
  - Cyan accent: `hsl(180 100% 50%)`
  - Glassmorphism card styles, neon glow borders
  - Scanline overlay CSS (subtle repeating-linear-gradient)
  - Grid background pattern
  - Status-specific glow classes (pending=yellow, in-progress=blue, completed=green, urgent=red pulse)
  - Animated neon border pulse keyframe
  - Button hover glow + scale effects

### 3. Canvas Particle Background
- **`src/components/GamingParticles.tsx`** (new) -- Lightweight canvas component rendering floating particles (dots/lines) in neon green/cyan. Only renders when gaming mode is active. Uses `requestAnimationFrame` with ~50 particles.

### 4. System Boot Loading Animation
- **`src/components/GamingBootScreen.tsx`** (new) -- When gaming mode is first toggled ON, show a 2-second "SYSTEM INITIALIZING..." boot sequence overlay with typed text effect, then fade out. Uses localStorage to only show once per session.

### 5. Update App.tsx
- **`src/App.tsx`** -- Apply `.gaming-mode` class to root `<html>` element (already partially done). Add `<GamingParticles />` and `<GamingBootScreen />` conditionally when `gamingMode` is true.

### 6. Enhanced Component Styling
- **`src/components/job-list/JobCard.tsx`** -- When gaming mode active, apply glassmorphism card style, neon border based on status, hover glow + scale animation
- **`src/components/ModernDashboard.tsx`** -- Apply cyber-card styling to dashboard panels, neon text headers
- **`src/components/CardStackSlider.tsx`** -- Apply neon selected-card border highlight

### 7. Sound Feedback Toggle (Bonus)
- **`src/hooks/useGamingSound.ts`** (new) -- Simple hook using Web Audio API to generate short synth beeps on button clicks and card selections. Controlled by a sub-toggle in the sidebar under gaming mode. No external sound files needed -- uses `OscillatorNode` for cyberpunk-style bleeps.
- **`src/components/MinimalistSidebar.tsx`** -- Add sound toggle icon below gaming mode switch (only visible when gaming mode is on)

### Summary of Files

| File | Action |
|------|--------|
| `tsconfig.json` | Restore `baseUrl: "."` |
| `index.html` | Add Orbitron font |
| `src/index.css` | Gaming mode CSS variables, glassmorphism, scanlines, glow effects |
| `src/components/GamingParticles.tsx` | New -- canvas particle background |
| `src/components/GamingBootScreen.tsx` | New -- boot animation overlay |
| `src/hooks/useGamingSound.ts` | New -- synth sound feedback |
| `src/App.tsx` | Add particles + boot screen components |
| `src/components/job-list/JobCard.tsx` | Gaming mode card styling |
| `src/components/ModernDashboard.tsx` | Gaming mode dashboard styling |
| `src/components/MinimalistSidebar.tsx` | Sound toggle |
| `src/components/CardStackSlider.tsx` | Neon selection highlight |

