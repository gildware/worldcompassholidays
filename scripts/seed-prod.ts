/**
 * Load the catalog into the production database and point images at Cloudinary.
 *
 * From the travel directory on the server:
 *   DATABASE_URL="file:/data/app.db" npm run db:seed-prod
 *
 * Optional admin account:
 *   SEED_ADMIN_EMAIL="you@example.com" SEED_ADMIN_PASSWORD="a-long-password" npm run db:seed-prod
 *
 * The Prisma schema in this project is SQLite. Point DATABASE_URL at the
 * SQLite file the app uses. A Postgres URL needs the datasource provider
 * switched to postgresql before this script can run.
 */
import { spawnSync } from "node:child_process";

function run(args: string[]) {
  const result = spawnSync("npx", args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Applying migrations...");
run(["prisma", "migrate", "deploy"]);
console.log("Seeding catalog and Cloudinary image links...");
run(["tsx", "prisma/seed.ts"]);
console.log("Production seed finished.");
