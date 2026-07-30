import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = path.join(projectRoot, "out");
const basePath = "/metron-historical-units";

test("exports the converter as the GitHub Pages entry page", async () => {
  const html = await readFile(path.join(outputRoot, "index.html"), "utf8");

  await access(path.join(outputRoot, "404.html"));
  await access(path.join(outputRoot, "favicon.svg"));
  await access(path.join(outputRoot, "og.png"));

  assert.match(html, /<html lang="el">/);
  assert.match(html, /ΜΕΤΡΟΝ/);
  assert.match(html, /Από τον δάκτυλο/);
  assert.match(html, /Μετατροπέας/);
  assert.doesNotMatch(html, /Τοπική εκτέλεση/);
  assert.doesNotMatch(html, /localhost/);
  assert.match(html, /https:\/\/itzortzak\.github\.io\/metron-historical-units\/og\.png/);
  assert.match(html, /https:\/\/itzortzak\.github\.io\/metron-historical-units\/favicon\.svg/);
});

test("prefixes and emits every Next.js asset for the project path", async () => {
  const html = await readFile(path.join(outputRoot, "index.html"), "utf8");
  const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => url.includes("/_next/"));

  assert.ok(assetUrls.length > 0, "expected exported Next.js assets");

  for (const assetUrl of assetUrls) {
    assert.ok(
      assetUrl.startsWith(`${basePath}/_next/`),
      `asset is missing the GitHub Pages base path: ${assetUrl}`,
    );

    const outputPath = assetUrl.slice(basePath.length + 1);
    await access(path.join(outputRoot, outputPath));
  }
});
