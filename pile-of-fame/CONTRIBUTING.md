# Contributing

## Branching

- `main` is protected and should stay deployable.
- Create short-lived branches:
  - `feat/<topic>`
  - `fix/<topic>`
  - `chore/<topic>`

## Commit style

Use simple prefixes:

- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`

Examples:

- `feat: add canonical event mapping helper`
- `fix: mark feed route as force-dynamic`

## Pull Requests

- Open a PR to `main` (draft is fine initially).
- Keep PRs focused and small when possible.
- Use squash merge for a clean history.

### Required checks before merge

- `npm run lint`
- `npm run build`
- `npm run db:validate`

## Database changes

Follow `.clinerules/database_workflow.md`.

Quick rules:

- Local interactive migration creation:
  - `npm run db:migrate:create -- --name <change-name>`
- Non-interactive apply in CI/prod:
  - `npm run db:migrate:deploy`
- Avoid `db push` except prototyping/emergency sync.
