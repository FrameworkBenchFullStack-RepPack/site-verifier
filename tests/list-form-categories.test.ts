import { By, until, WebDriver } from "selenium-webdriver";
import { beforeAll, afterAll, it, describe } from "vitest";
import { getDriver } from "../lib/driver";
import {
  compareTableRows,
  getTableRows,
  ListConfig,
  listConfigs,
} from "../lib/list";
import { db } from "../data/database";
import { category, person } from "../drizzle/schema";
import { asc, eq, inArray } from "drizzle-orm";

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

async function toggleCategory(
  config: ListConfig,
  category: 1 | 2 | 3 | 4,
): Promise<void> {
  await driver
    .findElement(By.css(`input[name="category"][value="${category}"]`))
    .click();
  if (config.js === false) {
    await driver.findElement(By.css(`#list form button`)).click();
  }
}

for (const config of listConfigs) {
  describe(`List component form input: ${config.page.url.pathname}${config.js ? "" : " (js disabled)"}`, () => {
    beforeAll(async () => {
      driver = await getDriver(config.page.url, {
        js: config.js,
        waitForElement: By.id("list"),
      });
    });

    afterAll(async () => {
      driver.quit();
    });

    it("Can filter categories", async () => {
      const dbRows3 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(inArray(person.categoryId, [1, 3, 4]))
        .orderBy(asc(person.name))
        .limit(100);

      await toggleCategory(config, 2);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows3);
        },
        1500,
        "All people from the category are removed",
        100,
      );

      const dbRows2 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(inArray(person.categoryId, [1, 3]))
        .orderBy(asc(person.name))
        .limit(100);

      await toggleCategory(config, 4);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows2);
        },
        1500,
        "All people from the category are removed",
        100,
      );

      const dbRows1 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(inArray(person.categoryId, [1]))
        .orderBy(asc(person.name))
        .limit(100);

      await toggleCategory(config, 3);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows1);
        },
        1500,
        "All people from the category are removed",
        100,
      );

      const dbRows4 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .orderBy(asc(person.name))
        .limit(100);

      await toggleCategory(config, 1);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows4);
        },
        1500,
        "People from all categories are shown",
        100,
      );
    });
  });
}
