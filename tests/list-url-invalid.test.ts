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
    "sort=&age-from=&age-to=&category=&category=&size=&page=",
    "Params with no specified data",
  ],
  [
    "sort=name&age-from=0&age-to=&category=&category=&size=&page=",
    "All params with only partial specified data",
  ],
  ["sort=name&age-from=0", "Only partial params"],
  ["sort=name&age-from=0&po&0=age-to", "Partial params with mangled data"],
  [
    "sort=hair&age-from=0&age-to=100&category=4&category=3&category=2&category=1&page=1",
    "Invalid sort param",
  ],
  [
    "sort=name&age-from=0.3&age-to=99.8&category=3.5&page=1.1",
    "Decimal params",
  ],
  ["sort=name&age-from=-1&age-to=-100&&category=-3&page=-1", "Negative params"],
  [
    "sort=name&age-from=0&age-to=100&category=5&category=4&category=3&category=2&category=1&page=1",
    "Invalid category",
  ],
  [
    "sort=name&age-from=9007199254740991&age-to=8007199254740991&category=907199254740991&page=907199254740991",
    "Large numbers",
  ],
  [
    "sort=name&age-from=900719925474099100&age-to=90407199254740991579394&category=904071992547409915347939&page=9410071943454925474099100",
    "Very large numbers",
  ],
  [
    "sort=name&age-from=zero&age-to=hundred&category=four&page=first",
    "String integers",
  ],
  ["sort={}&age-from={}&age-to={}&category={}&page={}", "Object params"],
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
