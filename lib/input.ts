import type { WebDriver } from "selenium-webdriver";
import { sleep } from "./sleep";

const TYPING_SPEED = 30;

export async function sendKeys(driver: WebDriver, keys: string[]) {
  for (const key of keys) {
    driver.actions().sendKeys(key).perform();
    await sleep(TYPING_SPEED);
  }
}
