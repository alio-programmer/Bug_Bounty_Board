import { seedDemoData } from "../lib/db/seed";
import { getDatabasePath } from "../lib/db/client";

const force = process.argv.includes("--force");
const result = seedDemoData({ force });

if (result.skipped) {
  console.log(
    `Database already has ${result.total} bugs. Use "npm run db:seed -- --force" to replace them.`,
  );
} else {
  console.log(
    `Seeded ${result.inserted} demo bugs into ${getDatabasePath()}. ${result.total} total.`,
  );
}
