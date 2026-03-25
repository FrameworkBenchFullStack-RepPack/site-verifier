import { By, WebDriver, WebElementPromise } from "selenium-webdriver";
import { PageMeta, pages } from "./pages";
import { sleep } from "./sleep";

export type ListConfig = {
  page: PageMeta;
  js: boolean;
};

export const listConfigs: ListConfig[] = [
  { page: pages.list, js: true },
  { page: pages.list, js: false },
  { page: pages.home, js: true },
  { page: pages.home, js: false },
];

export async function getTableRows(
  tableFinder: () => WebElementPromise,
): Promise<string[][]> {
  let retries = 0;
  while (true) {
    try {
      const rows = await tableFinder().findElements(By.css("tbody tr"));
      const textRows: string[][] = [];
      for (const row of rows) {
        const cells = await row.findElements(By.css("td"));
        const texts: string[] = [];
        for (const cell of cells) {
          texts.push(await cell.getText());
        }
        textRows.push(texts);
      }
      return textRows;
    } catch (error) {
      retries++;
      if (retries > 10) {
        throw error;
      }
      await sleep(retries * 50);
    }
  }
}

export function compareTableRows(
  pageRows: string[][],
  dbRows: {
    person: { name: string; age: number };
    category: { name: string } | null;
  }[],
): boolean {
  for (const [index, pageRow] of pageRows.entries()) {
    const dbRow = dbRows[index];
    if (dbRow.category === null) throw new TypeError("Category join failed");
    if (
      pageRow[0] !== dbRow.person.name ||
      pageRow[1] !== String(dbRow.person.age) ||
      pageRow[2] !== dbRow.category.name
    ) {
      return false;
    }
  }
  return true;
}
