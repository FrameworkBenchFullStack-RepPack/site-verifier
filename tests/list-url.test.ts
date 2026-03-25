import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pages } from "../lib/pages";
import { By, WebDriver } from "selenium-webdriver";
import { getDriver } from "../lib/driver";
import { compareTableRows, getTableRows } from "../lib/list";
import { category, person } from "../drizzle/schema";
import { db } from "../data/database";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

for (const page of [pages.list, pages.home]) {
  describe(`List component URL input: ${page.url.pathname}`, async () => {
    beforeAll(async () => {
      const url = new URL(page.url);
      url.search =
        "sort=category&age-from=39&age-to=72&category=3&category=2&size=21&page=2";
      driver = await getDriver(url);
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Correctly parses URL params", async () => {
      const dbRows = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(
          and(
            gte(person.age, 39),
            lte(person.age, 72),
            inArray(person.categoryId, [3, 2]),
          ),
        )
        .orderBy(asc(category.name), asc(person.name))
        .limit(21)
        .offset(21);

      const tableRows = await getTableRows(tableFinder);
      expect(tableRows.length, "Table size follows URL param").toBe(21);
      expect(
        compareTableRows(tableRows, dbRows),
        "Table includes correct rows",
      ).toBeTruthy();
    });
  });
}
