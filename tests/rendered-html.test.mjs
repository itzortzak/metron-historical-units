import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseLocalizedNumber } from "../app/parse-number.mjs";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Greek converter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /ΜΕΤΡΟΝ/);
  assert.match(html, /Από τον δάκτυλο/);
  assert.match(html, /Μετατροπέας/);
  assert.match(html, /Στάδιον/);
  assert.match(html, /Πλέθρον/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps historical uncertainty and sources explicit", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  assert.match(page, /Οι αρχαίες τιμές είναι συμβατικές ανακατασκευές|Το «≈» είναι ουσιώδες/);
  assert.match(page, /Athenian Agora X/);
  assert.match(page, /BIPM/);
  assert.match(page, /NIST/);
  assert.match(page, /Τάλαντον/);
  assert.match(page, /Μετρητής/);
  assert.match(layout, /lang="el"/);
  assert.match(layout, /twitter/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("accepts Greek and international number formatting", () => {
  assert.equal(parseLocalizedNumber("1.000"), 1000);
  assert.equal(parseLocalizedNumber("1.234,56"), 1234.56);
  assert.equal(parseLocalizedNumber("1,234.56"), 1234.56);
  assert.equal(parseLocalizedNumber("0.001"), 0.001);
  assert.equal(parseLocalizedNumber("− 2,5"), -2.5);
  assert.equal(parseLocalizedNumber("1.23.4"), null);
});
