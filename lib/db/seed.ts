import { getDb } from "./client";
import { newBugId, countBugs } from "./repo";
import { bugs, type NewBugRow } from "./schema";
import type {
  BugStatus,
  Category,
  Effort,
  Severity,
} from "../domain/constants";

interface SeedBug {
  title: string;
  description: string;
  severity: Severity;
  effort: Effort;
  category: Category;
  status: BugStatus;
  reportedBy: string;
  ageDays: number;
  updatedDaysAgo: number;
}

const DAY = 24 * 60 * 60 * 1000;

const SEED_BUGS: SeedBug[] = [
  {
    title: "Checkout total resets to $0 after removing a promo code",
    description:
      "Repro: add two items → apply SAVE10 → remove the code. The order summary drops to $0 while line items stay intact. Blocks checkout for affected carts.",
    severity: "critical",
    effort: 2,
    category: "backend",
    status: "in_progress",
    reportedBy: "claude",
    ageDays: 2,
    updatedDaysAgo: 1,
  },
  {
    title: "Session cookie still valid after logout",
    description:
      "Logging out clears the UI but the session token remains usable for at least 24 hours. Replaying the cookie grants access to the previous account.",
    severity: "critical",
    effort: 2,
    category: "security",
    status: "open",
    reportedBy: "opencode",
    ageDays: 1,
    updatedDaysAgo: 1,
  },
  {
    title: "Dashboard crashes when a workspace has zero members",
    description:
      "A newly created workspace throws a TypeError in the members widget before the first invite. 500 page instead of an empty state.",
    severity: "critical",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "claude",
    ageDays: 0,
    updatedDaysAgo: 0,
  },
  {
    title: "Invoice PDF exports a blank page on Safari",
    description:
      "Repro on Safari 17: open an invoice → Export PDF. The downloaded file has the correct page count but every page is blank. Chrome works.",
    severity: "high",
    effort: 3,
    category: "backend",
    status: "open",
    reportedBy: "human",
    ageDays: 9,
    updatedDaysAgo: 4,
  },
  {
    title: "Search ignores active filters after pagination",
    description:
      "Apply a status filter, go to page 2, then change the query. The filter silently resets and unrelated rows appear.",
    severity: "high",
    effort: 2,
    category: "backend",
    status: "open",
    reportedBy: "claude",
    ageDays: 5,
    updatedDaysAgo: 5,
  },
  {
    title: "Sidebar overlaps main content at 1024px",
    description:
      "At exactly 1024px the collapsed sidebar sits on top of the first table column, hiding the checkbox and ID.",
    severity: "medium",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 12,
    updatedDaysAgo: 12,
  },
  {
    title: "Slow initial load for accounts with 10k+ records",
    description:
      "Dashboard first paint takes 14s for large accounts. The members list query fetches all rows before pagination. Needs server-side pagination and indexes.",
    severity: "high",
    effort: 4,
    category: "performance",
    status: "in_progress",
    reportedBy: "claude",
    ageDays: 21,
    updatedDaysAgo: 3,
  },
  {
    title: "Password reset email consistently lands in spam",
    description:
      "Transactional reset mail fails SPF alignment after the domain migration. Gmail and Outlook both mark it as spam for new recipients.",
    severity: "high",
    effort: 3,
    category: "infra",
    status: "open",
    reportedBy: "human",
    ageDays: 16,
    updatedDaysAgo: 10,
  },
  {
    title: "CSV import silently drops duplicate rows",
    description:
      "Importing a CSV with repeated emails keeps the first occurrence and discards the rest with no warning. A summary of skipped rows would prevent silent data loss.",
    severity: "high",
    effort: 2,
    category: "data",
    status: "open",
    reportedBy: "opencode",
    ageDays: 6,
    updatedDaysAgo: 6,
  },
  {
    title: "Tooltip text clipped on narrow screens",
    description:
      "The keyboard shortcut tooltip in the command palette overflows the viewport on widths below 480px and cannot be scrolled.",
    severity: "low",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 32,
    updatedDaysAgo: 32,
  },
  {
    title: "Malformed JSON returns 500 instead of 400",
    description:
      "POST /api/events with broken JSON produces an unhandled SyntaxError and a 500. The route should return a structured 400 response.",
    severity: "medium",
    effort: 1,
    category: "backend",
    status: "fixed",
    reportedBy: "opencode",
    ageDays: 10,
    updatedDaysAgo: 2,
  },
  {
    title: "Search shortcut conflicts with browser find",
    description:
      "Cmd/Ctrl+F is captured globally even when no search field is focused, so users cannot use the browser's native find.",
    severity: "low",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 18,
    updatedDaysAgo: 18,
  },
  {
    title: "Database connection pool leaks under load test",
    description:
      "A 10-minute soak test exhausts the pool: connections are checked out by analytics queries and never released on timeout. Requires a finally block and pool cap.",
    severity: "critical",
    effort: 4,
    category: "infra",
    status: "in_progress",
    reportedBy: "claude",
    ageDays: 4,
    updatedDaysAgo: 0,
  },
  {
    title: "OAuth token refresh fails after a timezone change",
    description:
      "Users who travel across timezones get signed out because the refresh window is evaluated with a naive local timestamp. Store and compare UTC only.",
    severity: "high",
    effort: 3,
    category: "security",
    status: "open",
    reportedBy: "opencode",
    ageDays: 27,
    updatedDaysAgo: 14,
  },
  {
    title: "Date picker breaks on February 29",
    description:
      "Selecting Feb 29 in a leap year shifts the value to Mar 1 after blur. Formatting uses a hard-coded 365-day offset.",
    severity: "medium",
    effort: 2,
    category: "ui",
    status: "fixed",
    reportedBy: "human",
    ageDays: 44,
    updatedDaysAgo: 5,
  },
  {
    title: "Bulk delete confirmation shows the wrong count",
    description:
      "The confirmation modal always says \"Delete 1 item\" because it reads the previous selection instead of the current one.",
    severity: "low",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 23,
    updatedDaysAgo: 23,
  },
  {
    title: "Legacy avatars served over HTTP trigger mixed content",
    description:
      "Older profile images are still pinned to http://cdn and get blocked on HTTPS pages. A one-time backfill is needed for legacy uploads.",
    severity: "medium",
    effort: 4,
    category: "infra",
    status: "open",
    reportedBy: "claude",
    ageDays: 58,
    updatedDaysAgo: 40,
  },
  {
    title: "Mobile navigation traps keyboard focus",
    description:
      "Opening the mobile menu and pressing Tab cycles inside the overlay forever. Focus should return to the trigger when closed.",
    severity: "medium",
    effort: 2,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 12,
    updatedDaysAgo: 12,
  },
  {
    title: "API rate limits are not documented",
    description:
      "Developers only discover the 429 threshold in production. The docs need the per-key limits, burst behavior, and retry guidance.",
    severity: "low",
    effort: 1,
    category: "docs",
    status: "open",
    reportedBy: "opencode",
    ageDays: 30,
    updatedDaysAgo: 30,
  },
  {
    title: "Metrics endpoint exposes internal hostnames",
    description:
      "The unauthenticated /metrics response leaks internal service names and ports. Restrict to the private network and redact labels.",
    severity: "high",
    effort: 1,
    category: "security",
    status: "fixed",
    reportedBy: "claude",
    ageDays: 6,
    updatedDaysAgo: 1,
  },
  {
    title: "Retry logic duplicates webhook deliveries",
    description:
      "A slow consumer causes the sender to retry a request that already succeeded, producing duplicate charge events downstream. Needs idempotency keys.",
    severity: "high",
    effort: 3,
    category: "backend",
    status: "open",
    reportedBy: "human",
    ageDays: 15,
    updatedDaysAgo: 8,
  },
  {
    title: "Dark mode contrast fails on disabled buttons",
    description:
      "Disabled labels use 2.1:1 contrast against the warm charcoal surface. Raise the muted token by one step for disabled text.",
    severity: "low",
    effort: 1,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 8,
    updatedDaysAgo: 8,
  },
  {
    title: "Multi-select export ignores selected rows",
    description:
      "Choosing ten rows and clicking Export downloads the entire filtered dataset. The selected IDs are not sent to the export endpoint.",
    severity: "medium",
    effort: 2,
    category: "data",
    status: "open",
    reportedBy: "claude",
    ageDays: 10,
    updatedDaysAgo: 10,
  },
  {
    title: "Cold start exceeds 12 seconds on serverless deploy",
    description:
      "The first request after idle loads the entire ORM schema graph into every function. Bundle tracing shows 38 MB of unused dependencies.",
    severity: "high",
    effort: 5,
    category: "performance",
    status: "open",
    reportedBy: "opencode",
    ageDays: 35,
    updatedDaysAgo: 20,
  },
  {
    title: "Sentry source maps missing for production builds",
    description:
      "Production stack traces point to minified chunks. The upload step silently skips when the auth token env var is absent.",
    severity: "medium",
    effort: 2,
    category: "infra",
    status: "fixed",
    reportedBy: "human",
    ageDays: 19,
    updatedDaysAgo: 3,
  },
  {
    title: "Typography shifts when web fonts load",
    description:
      "Metric headings reflow after the font swap, causing layout shift on every dashboard load. Needs size-adjust fallbacks and preload.",
    severity: "low",
    effort: 3,
    category: "ui",
    status: "open",
    reportedBy: "human",
    ageDays: 26,
    updatedDaysAgo: 26,
  },
  {
    title: "Audit log retention policy not enforced",
    description:
      "Audit records older than the contractual 90 days are still retained. A scheduled purge exists but is not enabled in production.",
    severity: "high",
    effort: 4,
    category: "data",
    status: "open",
    reportedBy: "claude",
    ageDays: 40,
    updatedDaysAgo: 22,
  },
  {
    title: "Rate limiter counts successful requests twice",
    description:
      "The middleware increments the bucket on both request start and response finish, halving the documented quota for healthy traffic.",
    severity: "high",
    effort: 2,
    category: "backend",
    status: "open",
    reportedBy: "opencode",
    ageDays: 3,
    updatedDaysAgo: 3,
  },
  {
    title: "Consolidate duplicate notification services",
    description:
      "Two internal notification services overlap for email and in-app alerts. Low user-visible gain, but the duplication makes every incident harder.",
    severity: "low",
    effort: 4,
    category: "infra",
    status: "open",
    reportedBy: "human",
    ageDays: 52,
    updatedDaysAgo: 45,
  },
  {
    title: "Replace the legacy chart renderer",
    description:
      "The old SVG renderer is inflexible and blocks accessibility work. A migration would take weeks but delivers little visible value this quarter.",
    severity: "low",
    effort: 5,
    category: "other",
    status: "open",
    reportedBy: "human",
    ageDays: 61,
    updatedDaysAgo: 61,
  },
];

export interface SeedResult {
  inserted: number;
  skipped: boolean;
  total: number;
}

export function seedDemoData(options: { force?: boolean } = {}): SeedResult {
  const existing = countBugs();
  if (existing > 0 && !options.force) {
    return { inserted: 0, skipped: true, total: existing };
  }

  const db = getDb();
  if (options.force) db.delete(bugs).run();

  const now = Date.now();
  const rows: NewBugRow[] = SEED_BUGS.map((bug) => {
    const created = new Date(now - bug.ageDays * DAY);
    const updated = new Date(
      now - Math.min(bug.updatedDaysAgo, bug.ageDays) * DAY,
    );
    return {
      id: newBugId(),
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      effort: bug.effort,
      category: bug.category,
      status: bug.status,
      reportedBy: bug.reportedBy,
      createdAt: created,
      updatedAt: updated,
    };
  });

  db.insert(bugs).values(rows).run();
  return { inserted: rows.length, skipped: false, total: countBugs() };
}
