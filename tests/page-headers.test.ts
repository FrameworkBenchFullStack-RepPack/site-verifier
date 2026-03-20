import { expect, beforeAll, it, describe } from "vitest";
import { pages } from "../lib/pages";

let response: Response;

for (const [name, meta] of Object.entries(pages)) {
  describe(`Page header tests: ${name}`, () => {
    beforeAll(async () => {
      response = await fetch(meta.url);
    });

    it("Uses a content security policy", async () => {
      const csp = response.headers.get("Content-Security-Policy");
      expect(csp, "CSP is used").not.toBeNull();
      expect(csp, "CSP restricts default source to self").toContain(
        `default-src 'self'`,
      );
      expect(csp, "CSP restricts base-uri to self or none").toMatch(
        /base-uri '(?:self|none)';/v,
      );
      expect(csp, "CSP blocks frame-ancestors").toContain(
        `frame-ancestors 'none';`,
      );
      expect(csp, "CSP blocks object-src").toContain(`object-src 'none';`);
      expect(csp, "CSP restricts form-action to self").toContain(
        `form-action 'self';`,
      );
    });

    it("Requests process isolation", async () => {
      const corp = response.headers.get("Cross-Origin-Resource-Policy");
      const coep = response.headers.get("Cross-Origin-Embedder-Policy");
      const coop = response.headers.get("Cross-Origin-Opener-Policy");
      expect(corp, "Requests that only this origin can fetch data").toBe(
        "same-origin",
      );
      expect(coep, "Requests data can only be fetched in CORS mode").toBe(
        "require-corp",
      );
      expect(coop, "Requests cross-origin isolation").toBe("same-origin");
    });

    it("Disables content type sniffing", async () => {
      const xcto = response.headers.get("X-Content-Type-Options");
      expect(xcto, "Requests that content types are not sniffed").toBe(
        "nosniff",
      );
    });

    it("Uses compression", async () => {
      const ce = response.headers.get("Content-Encoding");
      expect(ce, "Uses brotli or zstd compression").toMatch(/^(?:br|zstd)$/v);
    });
  });
}
