import { By, Key, WebDriver } from "selenium-webdriver";
import { beforeAll, afterAll, it, describe, expect } from "vitest";
import { getDriver } from "../lib/driver";
import {
  compareTableRows,
  getTableRows,
  ListConfig,
  listConfigs,
} from "../lib/list";
import { db } from "../data/database";
import { category, person } from "../drizzle/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { sendKeys } from "../lib/input";

let driver: WebDriver;
function tableFinder() {
  return driver.findElement(By.css("#list-data table"));
}

async function setAge(
  config: ListConfig,
  name: "age_from" | "age_to",
  value: number,
): Promise<void> {
  await driver.findElement(By.css(`input[name="${name}"]`)).click();
  await sendKeys(driver, [
    Key.ARROW_RIGHT,
    Key.ARROW_RIGHT,
    Key.ARROW_RIGHT,
    Key.BACK_SPACE,
    Key.BACK_SPACE,
    Key.BACK_SPACE,
    ...String(value),
  ]);

  if (config.js === false) {
    await driver
      .findElement(By.css(`#list form :is(button, input[type="submit"])`))
      .click();
  }
}

function setAgeFrom(config: ListConfig, value: number): Promise<void> {
  return setAge(config, "age_from", value);
}

function setAgeTo(config: ListConfig, value: number): Promise<void> {
  return setAge(config, "age_to", value);
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

    it("Can filter by age", async () => {
      const dbRows53_ = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(gte(person.age, 53))
        .orderBy(asc(person.name))
        .limit(100);

      await setAgeFrom(config, 53);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows53_);
        },
        2500,
        "All people with age below 50 are removed",
        100,
      );

      const url53_ = new URL(await driver.getCurrentUrl());
      expect(
        url53_.searchParams.get("age_from"),
        "Seacrh param for age_from is set",
      ).toBe("53");

      const dbRows53_70 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(and(gte(person.age, 53), lte(person.age, 70)))
        .orderBy(asc(person.name))
        .limit(100);

      await setAgeTo(config, 70);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows53_70);
        },
        2500,
        "All people with age above 88 are removed",
        100,
      );

      const url53_70 = new URL(await driver.getCurrentUrl());
      expect(
        url53_70.searchParams.get("age_from"),
        "Seacrh param for age_from is set",
      ).toBe("53");
      expect(
        url53_70.searchParams.get("age_to"),
        "Seacrh param for age_to is set",
      ).toBe("70");

      const dbRows_70 = await db
        .select()
        .from(person)
        .leftJoin(category, eq(person.categoryId, category.id))
        .where(lte(person.age, 70))
        .orderBy(asc(person.name))
        .limit(100);

      await setAgeFrom(config, 0);
      await driver.wait(
        async () => {
          const pageRows = await getTableRows(tableFinder);
          return compareTableRows(pageRows, dbRows_70);
        },
        2500,
        "All people with age below 53 are added back",
        100,
      );

      const url_70 = new URL(await driver.getCurrentUrl());
      expect(
        url_70.searchParams.get("age_to"),
        "Seacrh param for age_to is set",
      ).toBe("70");

      await setAgeTo(config, 10);
      await driver.wait(
        async () => {
          return (
            (await getTableRows(tableFinder)).length === 0 &&
            (await driver.findElements(By.css("#list-data p"))).some(
              async (element) =>
                (await element.getText()) ===
                "No entries matched the filter settings.",
            )
          );
        },
        2500,
        "There are no people in the list",
        100,
      );

      const url_10 = new URL(await driver.getCurrentUrl());
      expect(
        url_10.searchParams.get("age_to"),
        "Seacrh param for age_to is set",
      ).toBe("10");
    });
  });
}
