<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Generated `dist` directories

- Treat every `dist` directory as read-only generated output.
- Never manually create, edit, delete, move, rename, format, patch, clean up, or refactor files inside `dist`.
- Make all fixes in source files or configuration files. Never use `dist` as the source of truth.
- Do not run a separate command to regenerate `dist`. It may change only as a compilation side effect of the user-requested `npm start` workflow.
- Never include `dist` files in manual migrations, import cleanup, or repository refactoring.
- For every workspace-wide search, replacement, rename, formatting operation, or migration, explicitly exclude all `dist`, `out-tsc`, and `dist-types` directories before running the command.
- Before applying a workspace-wide mutation, inspect the matched file list and limit changes to source files, configuration files, manifests, documentation, and lockfiles.
- A request to change something "everywhere" never includes generated output. Do not modify generated directories even when a broad replacement is requested.

# Workspace verification policy

Do not run verification, validation, compilation, formatting, or test commands automatically after making changes. Every check is opt-in and may run only when the user explicitly requests that specific category of check.

This restriction includes, but is not limited to:

- `git diff --check` and other Git-based validation commands;
- `typecheck`, TypeScript compilation, and declaration generation;
- `build`, bundle analysis, and production compilation;
- `lint`, formatting, and format-check commands;
- unit, integration, end-to-end, conformance, and smoke tests;
- application startup, preview, health-check, and runtime verification commands;
- workspace-wide validation scripts and combined check commands.

Read-only source inspection is allowed when needed to implement a requested change. Do not present an unrequested check as completed or use a different validation command as a substitute.

- A request for `typecheck` authorizes only type checking.
- A request for `build` authorizes only building.
- A request for `lint` authorizes only linting.
- A request for `git diff --check` authorizes only that Git validation command.
- A request for tests authorizes only the requested test scope and test category.
- A general request such as "run all checks" authorizes all checks named by the user or clearly included in that request.
- Prefer the smallest affected project scope. Do not run the same check for the whole workspace when a project-level command is sufficient.
- Do not repeat a successful check unless relevant files changed after it or the user explicitly asks to rerun it.
- Report the exact command and its result when a requested check is run.

## Nx command reference

Use the workspace package manager and Nx for task execution:

| Check or task | Project command | Multiple projects |
| --- | --- | --- |
| TypeScript type checking | `npm exec nx -- run <project>:typecheck` | `npm exec nx -- run-many --target=typecheck --projects=<projects>` |
| Production build | `npm exec nx -- run <project>:build` | `npm exec nx -- run-many --target=build --projects=<projects>` |
| ESLint | `npm exec nx -- run <project>:lint` | `npm exec nx -- run-many --target=lint --projects=<projects>` |
| Unit tests | `npm exec nx -- run <project>:test` | `npm exec nx -- run-many --target=test --projects=<projects>` |
| End-to-end tests | `npm exec nx -- run <project>:e2e` | `npm exec nx -- run-many --target=e2e --projects=<projects>` |
| Inspect project targets | `npm exec nx -- show project <project>` | `npm exec nx -- show projects` |

Check command syntax with `npm exec nx -- <command> --help` when a flag or target is uncertain. Do not guess flags.

# Application startup policy

- The user starts the application from their own console. Never start the application automatically.
- Before running `npm start`, `npm run dev`, any Nx `serve` target, or any other command that starts an application or development server, ask the user for explicit permission and state the exact command that would be run.
- Permission applies only to the specific startup command and run that the user approved. Do not treat an earlier approval as permission for later restarts.
- If the user does not explicitly approve the startup, or denies it, do not run the command. Stop all further work that depends on the application being running; do not substitute another startup command or use an indirect workaround.
- Do not leave an agent-started application running after the approved diagnostic work is complete. Stop the process before returning control to the user.

# Color usage

- When introducing a color, use only a standard CSS named-color hexadecimal code documented by MDN/W3C.
- Do not invent custom hexadecimal values or use framework shade palettes such as `amber-300` or `emerald-700` for new colors.
- Reuse the exact documented code consistently for the same semantic state.

# Codebase language and naming unification

- Use English for the entire codebase structure and all newly created or renamed technical identifiers.
- Write variable, constant, function, method, type, interface, enum, class, component, service, provider, module, route, and configuration names in English.
- Name files, folders, packages, projects, targets, database objects, API fields, and public exports in English.
- When a name represents a branded or vendor-specific implementation inside a provider abstraction, include `Provider` in the file, class, type, function, token, and configuration name. Do not use a brand-only provider name such as `firebase-supabase.configuration`; use an explicit name such as `firebase-supabase-provider.configuration`.
- Write code comments, documentation added to source files, fallback messages, logs, and developer-facing text in English.
- Write every message produced by `throw`, built-in exceptions, custom exceptions, repository errors, and custom error classes in English.
- Apply this language and naming unification consistently across frontend, backend, shared packages, services, provider implementations, tests, scripts, and workspace configuration.
- Do not introduce non-English technical names or pass non-English custom error text across service boundaries.
