export const GUIDELINES_MARKDOWN = `# Bug Board triage guidelines

## Severity (gain / impact)

| Severity | Weight | Use when |
| --- | --- | --- |
| critical | 4 | Production outage, data loss, security exposure, or complete loss of a core workflow. No workaround. |
| high | 3 | A major workflow is broken or unreliable. A workaround may exist but is painful. |
| medium | 2 | A feature is degraded but usable, or the bug affects a subset of users. A reasonable workaround exists. |
| low | 1 | Cosmetic, copy, minor polish, or an annoyance with an easy workaround. |

When torn between two levels, choose the lower one unless the user describes real user or business impact.

## Effort (1-5)

| Effort | Label | Typical size |
| --- | --- | --- |
| 1 | Trivial | Under 30 minutes, one-line fix, config or copy change |
| 2 | Small | About half a day, localized change with a test |
| 3 | Medium | 1-2 days, multiple files or a migration |
| 4 | Large | 3-5 days, cross-cutting change or infrastructure work |
| 5 | Epic | A week or more, architectural change or multi-team coordination |

Effort is engineering effort, not priority. Do not inflate effort to signal importance.

## Categories

- ui: visual, interaction, accessibility, or responsive layout issues
- backend: API, business logic, auth flow, or server behavior
- performance: latency, throughput, memory, or bundle size
- security: authz/authn, secrets, injection, data exposure
- data: imports, exports, migrations, integrity, or reports
- infra: deployment, observability, CI, DNS, storage, or platform
- docs: documentation, changelog, or API reference
- other: anything that genuinely does not fit

## Priority quadrants

- Quick wins: critical/high severity and effort 1-2. Do these first.
- Big bets: critical/high severity and effort 3-5. Worth planning and staffing.
- Fill-ins: medium/low severity and effort 1-2. Batch them when capacity allows.
- Time sinks: medium/low severity and effort 3-5. Deprioritize.

The priority score is severity weight divided by effort. It is a triage aid, not a substitute for judgment.

## Filing rules

- Always supply severity and effort.
- Search before creating a duplicate.
- Use one bug per distinct problem; split unrelated symptoms.
- Preserve reproduction steps the user gave. Do not invent them.
- Mark bugs "fixed" only when the user confirms the fix.
- Never delete bugs without an explicit request.
`;
