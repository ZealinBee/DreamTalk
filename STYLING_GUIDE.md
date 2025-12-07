# DreamTalk Styling Guide

## Overview

DreamTalk features a cozy, journal-like aesthetic designed to create an immersive dream-recording experience. The design evokes the feeling of opening a personal journal with a warm, comforting atmosphere.

## Color Palette

### Primary Colors

- **Sage Green** (`#DAFEB7`): Primary accent color, used for buttons and highlights
- **Warm Grey** (`#605B56`): Text and UI elements
- **Cream** (`#F2FBE0`): Backgrounds and soft surfaces

### Derived Colors

- **Sage Light** (`#E8FFCE`): Lighter sage for gradients
- **Sage Muted** (`#C8EDA0`): Muted sage for interactive elements
- **Cream Darker** (`#E8F5CC`): Darker cream for depth
- **Warm Grey Light** (`#8B8680`): Secondary text
- **Warm Grey Dark** (`#4A4540`): Dark text on light backgrounds
- **Text Muted** (`#9A958F`): Tertiary text

## Design Principles

### 1. Generous Spacing

- Minimum padding: 1.5rem-2rem
- Card spacing: 1.5rem-2rem gaps
- Sections have ample breathing room (3rem-5rem)

### 2. Soft Visual Cues

- Borders use low opacity (`rgba(96, 91, 86, 0.08-0.15)`)
- Soft shadows with warm grey tones
- Minimal contrast dividers

### 3. Layered Depth

- **Surface levels:**
  - Base: `rgba(255, 255, 255, 0.65-0.75)`
  - Elevated: `rgba(255, 255, 255, 0.85-0.95)`
  - Maximum: `rgba(255, 255, 255, 1)`
- Backdrop blur: 8px-20px for glass-morphism effect
- Inset highlights: `inset 0 1px 0 rgba(255, 255, 255, 0.9)`

### 4. Typography

- **Font Family:** System sans-serif stack
  - `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif`
- **Font Weights:**
  - Light headings: 300-400
  - Body text: 400-500
  - Emphasis: 500-600
- **Letter Spacing:**
  - Large headings: -0.02em to -0.03em
  - Body: normal to -0.01em
  - Small caps: 0.02em to 0.08em

### 5. Immersive Touches

#### Animations

- **Fade In:** Subtle upward movement (8px-12px) with opacity
- **Gentle Pulse:** Soft pulsing on recording states
- **Hover Effects:** Smooth translations (2px-4px) like turning a page
- **Duration:** 0.3s-0.4s with `cubic-bezier(0.4, 0, 0.2, 1)`

#### Border Radius

- Small elements: 12px
- Cards: 20px
- Modals: 24px
- Pills/Buttons: 50px

#### Shadows

```css
/* Soft shadow */
box-shadow: 0 2px 12px rgba(96, 91, 86, 0.06), 0 1px 4px rgba(96, 91, 86, 0.03);

/* Elevated shadow */
box-shadow: 0 8px 28px rgba(96, 91, 86, 0.12), 0 2px 8px rgba(96, 91, 86, 0.06);

/* With inset highlight */
box-shadow: 0 4px 20px rgba(96, 91, 86, 0.08), 0 1px 4px rgba(96, 91, 86, 0.04),
  inset 0 1px 0 rgba(255, 255, 255, 0.9);
```

## Component Styles

### Buttons

- **Primary:** Sage gradient with white inset highlight
- **Secondary:** White background with soft border
- **Hover:** 2px-3px translateY with enhanced shadow
- **Border radius:** 50px (pill shape)

### Cards

- **Background:** `rgba(255, 255, 255, 0.7)` with blur
- **Border:** `1px solid rgba(255, 255, 255, 0.6)`
- **Hover:** Lift 4px with enhanced shadow
- **Animation:** Fade in on load

### Modals

- **Overlay:** `rgba(96, 91, 86, 0.35)` with 8px blur
- **Modal:** 95% opacity white with 20px blur
- **Animation:** Slide up with scale (0.96 to 1)
- **Close button:** Rotate 90deg on hover

### Inputs

- **Background:** `rgba(255, 255, 255, 0.7)`
- **Border:** `1.5px solid rgba(96, 91, 86, 0.15)`
- **Focus:** Sage border with soft glow shadow
- **Placeholder:** 60% opacity warm grey

### Recording Button

- **Idle:** Sage gradient, 96px circle
- **Recording:** Green-yellow gradient with pulse
- **Hover:** Scale 1.05 with lifted shadow
- **Border:** 3px white with 60% opacity

## Gradients

### Backgrounds

```css
/* Page background */
background: linear-gradient(145deg, #f2fbe0 0%, #dafeb7 50%, #e8ffce 100%);

/* Interactive elements */
background: linear-gradient(135deg, #dafeb7 0%, #c8eda0 100%);

/* Info panels */
background: linear-gradient(135deg, #f2fbe0 0%, #e8ffce 100%);
```

## Focus States

- Outline: `2px solid var(--color-sage-muted)`
- Outline offset: 3px
- Border radius: 4px

## Scrollbars

- Width: 6px-8px
- Track: transparent
- Thumb: `rgba(96, 91, 86, 0.2)`
- Thumb hover: `rgba(96, 91, 86, 0.3)`
- Border radius: 10px

## Responsive Breakpoints

### Mobile (max-width: 640px)

- Reduce padding by 25-33%
- Font sizes scale down 10-15%
- Stack flex layouts to column

### Tablet (max-width: 768px)

- Sidebar becomes full-width
- Grid columns collapse to single column
- Maintain spacing proportions

## Accessibility

- All interactive elements have focus states
- Color contrast meets WCAG AA standards
- Hover states clearly indicate interactivity
- Transitions respect `prefers-reduced-motion` (future enhancement)

## Best Practices

1. Always use CSS variables from `globals.css`
2. Maintain consistent spacing scale (0.375rem, 0.625rem, 0.875rem, 1rem, 1.25rem, etc.)
3. Use backdrop-filter for layered surfaces
4. Include inset highlights on elevated surfaces
5. Keep animations subtle and purposeful
6. Test hover states on touch devices (use media queries)

---

_Last updated: December 7, 2025_
