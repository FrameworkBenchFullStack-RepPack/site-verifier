import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pages } from "../lib/pages";
import { By, logging, WebDriver } from "selenium-webdriver";
import { getDriver } from "../lib/driver";
import { compareTableRows, getTableRows } from "../lib/list";
import { category, person } from "../drizzle/schema";
import { db } from "../data/database";
import { asc, eq } from "drizzle-orm";

const paramConfigs = [
  [
    "sort=&age_from=&age_to=&category=&category=&size=&page=",
    "Params with no specified data",
  ],
  [
    "sort=name&age_from=0&age_to=&category=&category=&size=&page=",
    "All params with only partial specified data",
  ],
  ["sort=name&age_from=0", "Only partial params"],
  ["sort=name&age_from=0&po&0=age_to", "Partial params with mangled data"],
  ["sort=name&age_from=0&", "Partial params with dangling separator"],
  ["&sort=name&age_from=0", "Partial params with leading separator"],
  ["sort=name;age_from=0;age_to=100", "Partial params with wrong separator"],
  [
    "sort={}&age_from={}&age_to={}&category={}&size={}&page={}",
    "Object params",
  ],
  ["sort=[]&age_from=[]&age_to=[]&category=[]&size=[]&page=[]", "Array params"],
  [
    "sort=true&age_from=true&age_to=true&category=true&size=true&page=true",
    "Boolean true params",
  ],
  [
    "sort=false&age_from=false&age_to=false&category=false&size=false&page=false",
    "Boolean false params",
  ],
  [
    "sort=undefined&age_from=undefined&age_to=undefined&category=undefined&size=undefined&page=undefined",
    "Explicitly undefined params",
  ],
  [
    "sort=null&age_from=null&age_to=null&category=null&size=null&page=null",
    "Null params",
  ],
  [
    "sort=🫃🏽category&age_from=🚨40&age_to=💺40&category=🗣3&size=🌯2&page=🖱2",
    "Emoji params",
  ],
  [
    "sort=hair&age_from=0&age_to=100&category=4&category=3&category=2&category=1&page=1",
    "Invalid sort param",
  ],
  [
    "sort%3Dcategory%26age_from%3D39%26age_to%3D72%26category%3D3%26category%3D2%26size%3D21%26page%3D2",
    "Incorrect URL-encoding",
  ],
];

const dbRows = await db
  .select()
  .from(person)
  .leftJoin(category, eq(person.categoryId, category.id))
  .orderBy(asc(person.name))
  .limit(100);

for (const page of [pages.list, pages.home]) {
  for (const [params, description] of paramConfigs) {
    describe(`List component URL invalid input: ${page.url.pathname}`, async () => {
      let driver: WebDriver;
      function tableFinder() {
        return driver.findElement(By.css("#list-data table"));
      }

      beforeAll(async () => {
        const url = new URL(page.url);
        url.search = params;
        driver = await getDriver(url);
      });

      afterAll(async () => {
        driver.quit();
      });

      it(`${description}: ${params}`, async () => {
        expect(
          (await driver.findElements(By.css("#list-data table"))).length,
          "A page with a table is returned",
        ).toBe(1);
        const tableRows = await getTableRows(tableFinder);
        expect(tableRows.length, "Table size is correct").toBe(
          page === pages.home ? 8 : 100,
        );
        expect(
          compareTableRows(tableRows, dbRows),
          "Table includes correct rows",
        ).toBeTruthy();
        const logs = await driver.manage().logs().get(logging.Type.BROWSER);
        expect(logs.length, "Does not log to console").toBe(0);
      });
    });
  }
}
