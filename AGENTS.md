# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace. The browser app lives in `front/` and uses React 19, TypeScript, and Vite Plus. Keep domain logic separate from UI:

- `front/src/core/data/`: Thaumcraft versions, addons, aspect metadata, and models.
- `front/src/core/pathfinding/`: graph construction, pathfinding, and unit tests.
- `front/src/core/store/`: persisted Zustand application state.
- `front/src/view/components/`: React UI components.
- `front/src/config/`: theme, design tokens, and runtime configuration.
- `front/public/aspects/{color,mono}/`: aspect image assets.
- `deploy/build/`: Docker and Kubernetes deployment helpers.
- `docs/screenshots/`: documentation screenshots.

## Build, Test, and Development Commands

Use Node.js 22 or newer and pnpm 11.21.0.

```bash
pnpm install                 # install workspace dependencies
pnpm dev                     # start the frontend dev server
pnpm build                   # type-check and create a production build
pnpm test                    # run Vitest tests
pnpm lint                    # run ESLint through Vite Plus
pnpm preview                 # serve the production build locally
pnpm deploy:dry-run          # validate deployment generation without publishing
```

## Coding Style & Naming Conventions

Use TypeScript with React function components and existing path aliases. Match the repository’s tab indentation and run Prettier and ESLint before submitting. Use PascalCase for component files and exported components, camelCase for functions and variables, and lowercase aspect identifiers/data keys. Keep UI styling in the existing MUI `sx`/theme system unless a feature requires otherwise.

## Testing Guidelines

Tests use Vitest and live beside the code they exercise, using the `*.test.ts` or `*.test.tsx` pattern (for example, `front/src/core/pathfinding/find.test.ts`). Add tests for pathfinding, data integrity, and edge cases such as disabled or unreachable aspects. No coverage threshold is declared; cover changed behavior directly. Run `pnpm --dir front test` before opening a pull request.

## Commit & Pull Request Guidelines

Git history uses short Conventional Commit-style prefixes, such as `feat:` and `docs:`. Write imperative, focused subjects and keep unrelated changes separate. PRs should explain the change, list validation commands run, and link an issue when one exists. Include updated screenshots for UI changes and call out any changes to aspect data or deployment configuration.

## Architecture & Configuration Notes

The application is fully client-side: aspect data, graph building, and pathfinding run in the browser; there is no backend or runtime secret configuration. Preserve the separation between `core` logic and `view` components, and avoid committing generated `dist/` output, local environment files, or dependency directories.
