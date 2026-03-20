import { Builder, logging, WebDriver } from "selenium-webdriver";

export type DriverOptions = {
  js?: boolean;
};

const loggingPrefs = new logging.Preferences();
loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

export async function getDriver(
  url: URL | string,
  options?: DriverOptions,
): Promise<WebDriver> {
  let urlString = typeof url === "string" ? url : url.toString();
  let driver: WebDriver;
  try {
    driver = await new Builder()
      .forBrowser("chrome")
      .setLoggingPrefs(loggingPrefs)
      .build();

    await driver.get(urlString);
  } catch (error) {
    await driver!?.quit();
    throw error;
  }
  return driver!;
}
