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
    "sort=name&age-from=zero&age-to=hundred&category=four&size=normal&page=first",
    "String integers",
  ],
  [
    "sort=name&age-from=-1&age-to=-100&&category=-3&size=-1&page=-1",
    "Negative params",
  ],
  [
    "sort=name&age-from=Infinity&age-to=Infinity&category=Infinity&size=Infinity&page=Infinity",
    "Infinity params",
  ],
  [
    "sort=name&age-from=NaN&age-to=NaN&category=NaN&size=NaN&page=NaN",
    "NaN params",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=5&category=4&category=3&category=2&category=1&page=1",
    "Invalid category",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&page=0",
    "Page 0",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&page=-0",
    "Page -0",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&page=2000001",
    "Page is one-off invalid",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&size=0&page=1",
    "Size 0",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&size=-0&page=1",
    "Size -0",
  ],
  [
    "sort=name&age-from=0&age-to=100&category=4&category=3&category=2&category=1&size=1001&page=1",
    "Size is one-off invalid",
  ],
  ["sort=name&age-from=126&age-to=126", "Numbers matching Java byte limit -1"],
  ["sort=name&age-from=127&age-to=127", "Numbers matching Java byte limit"],
  ["sort=name&age-from=128&age-to=128", "Numbers matching Java byte limit +1"],
  [
    "sort=name&age-from=4892&age-to=1953&page=7301",
    "Numbers between byte and smallint/short limits",
  ],
  [
    "sort=name&age-from=32766&age-to=32766&page=32766",
    "Numbers matching Postgres smallint and Java short limit -1",
  ],
  [
    "sort=name&age-from=32767&age-to=32767&page=32767",
    "Numbers matching Postgres smallint and Java short limit",
  ],
  [
    "sort=name&age-from=32768&age-to=32768&page=32768",
    "Numbers matching Postgres smallint and Java short limit +1",
  ],
  [
    "sort=name&age-from=96740&age-to=56490&page=80032",
    "Numbers between smallint/short and numeric limits",
  ],
  [
    "sort=name&age-from=131071&age-to=131071&page=131071",
    "Numbers matching Postgres numeric limit -1",
  ],
  [
    "sort=name&age-from=131072&age-to=131072&page=131072",
    "Numbers matching Postgres numeric limit",
  ],
  [
    "sort=name&age-from=131073&age-to=131073&page=131073",
    "Numbers matching Postgres numeric limit +1",
  ],
  [
    "sort=name&age-from=11468940&age-to=684920310&page=823032777",
    "Numbers between numeric and integer/int limits",
  ],
  [
    "sort=name&age-from=2147483646&age-to=2147483646&category=2147483646&size=2147483646&page=2147483646",
    "Numbers matching Postgres integer, C# int, Java int, and PHP int limit -1",
  ],
  [
    "sort=name&age-from=2147483647&age-to=2147483647&category=2147483647&size=2147483647&page=2147483647",
    "Numbers matching Postgres integer, C# int, Java int, and PHP int limit",
  ],
  [
    "sort=name&age-from=2147483648&age-to=2147483648&category=2147483648&size=2147483648&page=2147483648",
    "Numbers matching Postgres integer, C# int, Java int, and PHP int limit +1",
  ],
  [
    "sort=name&age-from=67393759202037&age-to=87234510930111&category=578396052781095&size=100038592197&page=6582930050000",
    "Numbers between integer/int and Number limits",
  ],
  [
    "sort=name&age-from=9007199254740990&age-to=9007199254740990&category=9007199254740990&size=9007199254740990&page=9007199254740990",
    "Numbers matching Javascript Number limit -1",
  ],
  [
    "sort=name&age-from=9007199254740991&age-to=9007199254740991&category=9007199254740991&size=9007199254740991&page=9007199254740991",
    "Numbers matching Javascript Number limit",
  ],
  [
    "sort=name&age-from=9007199254740992&age-to=9007199254740992&category=9007199254740992&size=9007199254740992&page=9007199254740992",
    "Numbers matching Javascript Number limit +1",
  ],
  [
    "sort=name&age-from=106849305968812678&age-to=112869504997846371&category=66749029675811059&size=234875980900010000&page=77859486028677589",
    "Numbers between Number and long limits",
  ],
  [
    "sort=name&age-from=9223372036854775806&age-to=9223372036854775806&category=9223372036854775806&size=9223372036854775806&page=9223372036854775806",
    "Numbers matching C# long and Java long limit -1",
  ],
  [
    "sort=name&age-from=9223372036854775807&age-to=9223372036854775807&category=9223372036854775807&size=9223372036854775807&page=9223372036854775807",
    "Numbers matching C# long and Java long limit",
  ],
  [
    "sort=name&age-from=9223372036854775808&age-to=9223372036854775808&category=9223372036854775808&size=9223372036854775808&page=9223372036854775808",
    "Numbers matching C# long and Java long limit +1",
  ],
  [
    "sort=name&age-from=1042233720368547758080&age-to=9223371002036854775808&category=92233720368568394864775808&size=92233720000000236854775808&page=2000003434223372036854775808",
    "Numbers larger than long limits",
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
    describe(`List component URL invalid numeric input: ${page.url.pathname}`, async () => {
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
        await driver.get(page.url.href);
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
