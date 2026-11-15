import { execSync } from "node:child_process";

/** Resets the test database to the latest migrations once per test run. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn("[tests] TEST_DATABASE_URL not set: skipping integration tests.");
    return;
  }
  execSync("pnpm exec prisma migrate reset --force --skip-seed --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}
