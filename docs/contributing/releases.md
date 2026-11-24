# Releases (/docs/contributing/releases)



# Releases [#releases]

## Changesets [#changesets]

Kwiva uses changesets (`.changeset/`):

* Add a changeset file in `.changeset/` for user-facing changes
* `bunx changeset status` to see pending

## Versioning [#versioning]

Packages: `@kwiva/*` — see [Versioning](/reference/versioning).

## Branch rules [#branch-rules]

* `main` — only from approved PRs (squash-merge)
* `feat/`, `fix/`, `chore/` — short-lived

## Checklist [#checklist]

* [ ] Changeset added
* [ ] Tests pass (`bun test`)
* [ ] Lint passes (`oxlint`)
* [ ] Typecheck passes (`bun run typecheck`)
* [ ] API docs updated (if public)
