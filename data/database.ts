import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import * as relations from "../drizzle/relations";
import { databaseUrl } from "../lib/env";

export const db = drizzle({
  connection: { connectionString: databaseUrl },
  schema: { ...schema, ...relations },
});
