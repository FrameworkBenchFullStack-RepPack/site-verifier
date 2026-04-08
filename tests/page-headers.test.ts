import { expect, beforeAll, it, describe } from "vitest";
import { pages } from "../lib/pages";
import { By } from "selenium-webdriver";
import { getDriver } from "../lib/driver";

type LinkMeta = {
  url: URL;
  type: string;
  optional?: boolean;
};

const links: Map<string, LinkMeta> = new Map();

links.set("/partials/list", {
  url: new URL("/partials/list", pages.home.url),
  type: "text/html",
  optional: true,
});
links.set("/api/live", {
  url: new URL("/api/live", pages.home.url),
  type: "text/event-stream",
  optional: true,
});

for (const [name, meta] of Object.entries(pages)) {
  links.set(meta.url.pathname, { url: meta.url, type: "text/html" });

  const driver = await getDriver(meta.url);

  const linkElements = await driver.findElements(By.css("link[type][href]"));
  for (const linkElement of linkElements) {
    const url = new URL(await linkElement.getAttribute("href"), meta.url);
    const type = await linkElement.getAttribute("type");
    links.set(url.pathname, { url, type });
  }

  const stylesheetElements = await driver.findElements(
    By.css(`link[rel="stylesheet"][href]`),
  );
  for (const stylesheetElement of stylesheetElements) {
    const url = new URL(await stylesheetElement.getAttribute("href"), meta.url);
    links.set(url.pathname, { url, type: "text/css" });
  }

  const scriptElements = await driver.findElements(By.css("script[src]"));
  for (const scriptElement of scriptElements) {
    const url = new URL(await scriptElement.getAttribute("src"), meta.url);
    links.set(url.pathname, { url, type: "application/javascript" });
  }

  await driver.quit();
}

for (const [pathname, link] of links.entries()) {
  let response: Response;
  describe(`Header tests: ${pathname}`, () => {
    beforeAll(async () => {
      response = await fetch(link.url);
    });

    if (
      link.type.includes("html") ||
      link.type.includes("xml") ||
      link.type.includes("svg")
    ) {
      it("Uses a content security policy", async () => {
        if (response.status !== 200 && link.optional) return;
        const csp = response.headers.get("Content-Security-Policy");
        expect(csp, "CSP is used").not.toBeNull();
        expect(csp, "CSP restricts default source to self").toContain(
          `default-src 'self'`,
        );
        expect(csp, "CSP restricts base-uri to self or none").toMatch(
          /base-uri '(?:self|none)'/v,
        );
        expect(csp, "CSP blocks frame-ancestors").toContain(
          `frame-ancestors 'none';`,
        );
        expect(csp, "CSP blocks object-src").toContain(`object-src 'none'`);
        expect(csp, "CSP restricts form-action to self").toContain(
          `form-action 'self'`,
        );
      });
    }

    it("Requests process isolation", async () => {
      if (response.status !== 200 && link.optional) return;
      const corp = response.headers.get("Cross-Origin-Resource-Policy") ?? "";
      const coep = response.headers.get("Cross-Origin-Embedder-Policy") ?? "";
      const coop = response.headers.get("Cross-Origin-Opener-Policy") ?? "";
      expect(corp, "Requests that only this origin can fetch data").toBe(
        "same-origin",
      );
      expect(coep, "Requests data can only be fetched in CORS mode").toBe(
        "require-corp",
      );
      expect(coop, "Requests cross-origin isolation").toBe("same-origin");
    });

    it("Disables content type sniffing", async () => {
      if (response.status !== 200 && link.optional) return;
      const xcto = response.headers.get("X-Content-Type-Options") ?? "";
      expect(xcto, "Requests that content types are not sniffed").toBe(
        "nosniff",
      );
    });

    it("Controls caching", () => {
      if (response.status !== 200 && link.optional) return;
      const cc = response.headers.get("Cache-Control");
      expect(cc, "Sets a Cache-Control header").not.toBeNull();
      if (link.type.includes("event-stream")) {
        expect(cc, "Blocks caching of data").toContain("no-cache");
        expect(cc, "Blocks storage of data").toContain("no-store");
      } else {
        expect(cc, "Allows public caching").toContain("public");
        expect(cc, "Sets the max age").toContain("max-age=");
        const match = cc?.match(/max-age=(?<secs>\d+)/v);
        const secStr = match?.groups?.secs;
        expect(secStr, "Max age directive sets an age").toBeTruthy();
        const secs = Number.parseInt(secStr as string);
        expect(secs, "Max age is proper number").not.toBeNaN();
        if (link.type === "text/html") {
          expect(
            secs,
            "Max age is set to at least 1 hour",
          ).toBeGreaterThanOrEqual(3600);
        } else {
          expect(
            secs,
            "Max age is set to at least 1 day",
          ).toBeGreaterThanOrEqual(86400);
        }
      }
    });

    if (!link.type.includes("event-stream")) {
      it("Uses compression", async () => {
        if (
          (response.status !== 200 && link.optional) ||
          (await response.clone().arrayBuffer()).byteLength < 1024
        ) {
          return;
        }
        const ce = response.headers.get("Content-Encoding") ?? "";
        expect(ce, "Compression header is present").toMatch(
          /^(?:gzip|br|zstd)$/v,
        );
      });
    }
  });
}
