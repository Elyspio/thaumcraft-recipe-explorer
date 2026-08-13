# Thaumcraft Recipe Explorer

A modernized UI for the Thaumcraft 4.x–5.x research aspect pathfinder, based on
[glowredman/tcresearch](https://github.com/glowredman/tcresearch). The original
functionality and aspect icons are preserved; only the UI was rebuilt.

Pick a **From** and **To** aspect plus a minimum number of steps, and the tool
finds the shortest path connecting them through the aspect-combination tree.
Disable aspects you don't have access to and the search will route around them.

## Stack

- **React 19** + **TypeScript**
- **MUI 7** (`sx` styling, design-token theme, light/dark)
- **vite-plus** (`vp`) with `@elyspio/vite-eslint-config`
- **zustand** for UI state (persisted: theme, version, min steps)
- **Geist Sans / Mono** fonts

No backend — everything (aspect graph, pathfinding) runs in the browser.

## Scripts

```bash
pnpm dev      # start the dev server (http://localhost:5173)
pnpm build    # type-check + production build
pnpm test     # run the pathfinding unit tests (vitest)
pnpm lint     # lint
```

## Structure

```
public/aspects/{color,mono}/   Aspect icons (color + greyed-out variants)
src/config/                    Design tokens + MUI theme
src/core/data/                 Ported data: versions, addons, aspect names/icons
src/core/pathfinding/          Graph builder + BFS find() (+ unit tests)
src/core/store/                zustand app store
src/view/components/           UI: Topbar, controls, aspect grid, addons, results
```

The pathfinding (`src/core/pathfinding/find.ts`) is a faithful port of the
original `find()`, with a result-preserving upper bound on path length so it
terminates on unreachable targets instead of looping.
