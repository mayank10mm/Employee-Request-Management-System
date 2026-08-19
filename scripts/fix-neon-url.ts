import { readFileSync, writeFileSync } from "fs";

const path = ".env";
const contents = readFileSync(path, "utf8");

const updated = contents.replace(/DATABASE_URL="([^"]+)"/, (_match, url) => {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("pgbouncer")) {
    parsed.searchParams.set("pgbouncer", "true");
  }
  if (!parsed.searchParams.has("connect_timeout")) {
    parsed.searchParams.set("connect_timeout", "15");
  }
  return `DATABASE_URL="${parsed.toString()}"`;
});

writeFileSync(path, updated);
console.log("DATABASE_URL query params updated");
