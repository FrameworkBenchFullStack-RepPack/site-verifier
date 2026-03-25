import "dotenv/config";

if (!process.env.SITE_URL) throw new Error("No SITE_URL set in env.");
export const siteUrl: string = process.env.SITE_URL;

if (!process.env.DATABASE_URL) throw new Error("No DATABASE_URL set in env.");
export const databaseUrl: string = process.env.DATABASE_URL;
