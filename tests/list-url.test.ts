import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pages } from "../lib/pages";
import { By, WebDriver } from "selenium-webdriver";
import { getDriver } from "../lib/driver";
import { compareTableRows, getTableRows } from "../lib/list";
import { category, person } from "../drizzle/schema";
import { db } from "../data/database";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

const paramConfigs = [
  [
    "sort=category&age_from=39&age_to=72&category=3&category=2&size=21&page_num=2",
    "Standard",
  ],
  [
    "sort=%63%61teg%6Fry&age_from=39&age_to=%372&category=3&category=%32&size=21&page_num=2",
    "URL-encoded values",
  ],
  [
    "s%6Frt=category&age_from=39&%61ge_to=72&category=3&category=2&siz%65=21&page_num=2",
    "URL-encoded keys",
  ],
];

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

for (const page of [pages.list, pages.home]) {
  for (const [params, description] of paramConfigs) {
    describe(`List component URL input: ${page.url.pathname}`, async () => {
      let driver: WebDriver;
      function tableFinder() {
        return driver.findElement(By.css("#list-data table"));
      }

      beforeAll(async () => {
        const url = new URL(page.url);
        url.search = params;
        driver = await getDriver(url, { waitForElement: By.id("list") });
      });

      afterAll(async () => {
        await driver.quit();
      });

      it(`${description}: ${params}`, async () => {
        expect(
          (await driver.findElements(By.css("#list-data table"))).length,
          "A page with a table is returned",
        ).toBe(1);
        const tableRows = await getTableRows(tableFinder);
        expect(tableRows.length, "Table size follows URL param").toBe(21);
        expect(
          compareTableRows(tableRows, dbRows),
          "Table includes correct rows",
        ).toBeTruthy();
      });
    });
  }
}
