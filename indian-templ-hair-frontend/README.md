# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Styling (Tailwind CSS v4)

The whole UI is styled with Tailwind utility classes. There are no per-page CSS files.

- `src/index.css` is the only stylesheet: `@import "tailwindcss"`, design tokens in `@theme`
  (colours, fonts, shadows, animations) and a few base rules.
- `src/lib/ui.js` holds shared class recipes (buttons, inputs, chips, cards).
- Reusable primitives: `Button`, `Container`, `Section`, `Field` (Input/Textarea/Select/Check),
  `Badge`, `Overlay`, `PageTitle`, `SummaryCard`, `StatusPill`, `QtyStepper`.
- Brand colours are utilities: `bg-espresso`, `text-champagne`, `border-line`, `bg-brand`, etc.
- Custom breakpoint `nav:` (70rem) switches the header between mobile and desktop.

New route: `/account/orders/:id` (order detail, uses the existing `ordersApi.get`).
