// Point the app's Prisma client at the test database before any module loads it.
// Integration tests are skipped entirely when TEST_DATABASE_URL is not set.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
}
