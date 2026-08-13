# Thaumcraft Recipe Explorer

A browser-based explorer for finding crafting paths between Thaumcraft aspects
across Thaumcraft 4.x and 5.x versions.

Choose a **From** aspect, a **To** aspect, and a minimum number of steps. The
application finds a shortest path through the aspect-combination tree while
avoiding aspects that are not available. Hovering an aspect in the results
shows its crafting recipe when one exists.

## Origin and acknowledgment

This project is a modernized UI and TypeScript/React port inspired by the
original [glowredman/tcresearch](https://github.com/glowredman/tcresearch)
project. The original project provided the research pathfinding functionality
and the Thaumcraft aspect data that this application builds upon. Many thanks
to its author and contributors for making that work available.

## Stack

- React 19 and TypeScript
- MUI 7 with light and dark themes
- Vite Plus
- Zustand for persisted UI state
- Geist Sans and Geist Mono

Everything runs in the browser; there is no backend service.

## Development

```bash
pnpm install
pnpm --dir front dev
```

The development server runs at <http://localhost:5173>.

Useful checks:

```bash
pnpm --dir front build
pnpm --dir front lint
pnpm --dir front test
```

## Project structure

```text
front/src/core/data/          Version, addon, and aspect data
front/src/core/pathfinding/   Graph construction and pathfinding
front/src/core/store/         Zustand application state
front/src/view/components/    React UI components
front/public/aspects/         Color and monochrome aspect icons
deploy/build/                 Docker and Kubernetes deployment helpers
```
