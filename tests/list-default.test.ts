import { By, type WebDriver } from "selenium-webdriver";
import { expect, beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import { getTableRows, listConfigs } from "../lib/list";
import { category, person } from "../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { db } from "../data/database";
import { pages } from "../lib/pages";

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

for (const config of listConfigs) {
  describe(`List component form input: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, { js: config.js });
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Has default data", async () => {
      const pageRows = await getTableRows(tableFinder);

      expect(pageRows.length, "List has correct number of entries").toBe(
        config.page === pages.home ? 8 : 100,
      );

      const dbRows = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.name))
        .limit(100);

      for (const [index, pageRow] of pageRows.entries()) {
        const dbRow = dbRows[index];
        expect(pageRow[0], `Row ${index} has correct name`).toBe(
          dbRow.person.name,
        );
        expect(pageRow[1], `Row ${index} has correct age`).toBe(
          String(dbRow.person.age),
        );
        expect(pageRow[2], `Row ${index} has correct category`).toBe(
          dbRow.category?.name,
        );
      }
    });
  });
}
