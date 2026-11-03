# Design System & UI Skills Guidelines

Documented design decisions and engineering constraints for **Sistem Inventarisasi & Pemetaan Dialektometri Bahasa Daerah (Derana)**, aligned with `ui-skills` (by Julien Thibeaut / @ibelick) and production frontend design craftsmanship.

---

## 1. Visual Direction & Identity

- **Design Philosophy**: Quiet, authoritative, scientific-editorial UI designed for academic researchers, dialectologists, and field surveyors.
- **Surface Elevation**: Clean, crisp borders (`border-slate-200/90 dark:border-slate-800`) paired with subtle shadows (`shadow-2xs` / `shadow-xs`).
- **Anti-AI Slop Rules**:
  - **Zero Purple/Rainbow Gradients**: Primary actions and structural containers avoid multi-color or purple gradients. Use solid, purposeful colors.
  - **Zero Glow Effects**: Never use neon glow or soft dropshadow as primary affordances.
  - **Single Accent Color per View**: Primary brand accent is Indigo (`#4F46E5`), paired with clear semantic indicators:
    - **Emerald** (`#059669`): Tervalidasi resmi, survei selesai 100%, status aman.
    - **Amber** (`#D97706`): Dalam proses, batas waktu < 3 hari, butuh perhatian kurator.
    - **Sky / Blue** (`#0284C7`): Waktu penyelesaian (turnaround), geospasial Leaflet, demografi.
    - **Rose** (`#E11D48`): Aksi destruktif, peringatan kritis.

---

## 2. Typography & Numerical Data

- **Headings**: Must use `text-balance` to prevent dangling orphan words.
- **Body & Paragraphs**: Must use `text-pretty` for optical ragging and natural text wrapping.
- **Numbers, Timers & Percentages**: Must strictly use `tabular-nums` so numbers align neatly across columns and avoid layout shifts during real-time updates.
- **Hierarchy**:
  - Display KPI Numbers: `text-xl sm:text-2xl font-extrabold tabular-nums`
  - Section Headings: `text-base sm:text-lg font-bold text-slate-900 dark:text-white text-balance`
  - Meta & Labels: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider`

---

## 3. Components & Accessibility

- **Icon-Only Buttons**: Must always have an explicit `aria-label` attribute describing the action for screen readers.
- **Square Elements**: Prefer Tailwind `size-*` (e.g. `size-10`, `size-8`, `size-5`) over separate `w-* h-*`.
- **Keyboard & Focus**: All interactive triggers retain visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Destructive Confirmations**: Irreversible actions (such as survey deletion or revocation) require confirmation modals before state mutation.
- **Paste Preservation**: Input and textarea fields must never prevent clipboard paste events.

---

## 4. Animation & Motion Performance

- **Compositor Properties**: Animate strictly GPU-accelerated compositor properties (`transform`, `opacity`). Never animate `width`, `height`, `top`, `left`, or `margin`.
- **Feedback Speed**: Micro-interactions and state changes must resolve quickly (duration <= 200ms with `ease-out`).
- **Reduced Motion**: Respect system `prefers-reduced-motion` settings.

---

## 5. Viewport & Layout

- **Dynamic Viewport**: Use `h-dvh` instead of `h-screen` to prevent iOS/Android mobile address bar layout jumps.
- **Safe Area Insets**: Floating toasts, banners, and modals respect safe-area margins for notched and edge-to-edge displays.
