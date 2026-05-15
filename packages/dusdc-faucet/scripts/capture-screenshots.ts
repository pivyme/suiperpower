#!/usr/bin/env bun
/**
 * Capture demo screenshots for the README and web/public/demo/.
 *
 * Assumes the web dev server is running at http://localhost:3200. Launches
 * headless Chromium at 1280x720 dark mode, lets the grain gradient settle,
 * and writes five PNGs to both docs/screenshots/ and web/public/demo/.
 */

import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "playwright";

const URL_BASE = process.env.WEB_URL ?? "http://localhost:3200";
const VIEWPORT = { width: 1280, height: 720 } as const;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const docsDir = resolve(repoRoot, "docs/screenshots");
const publicDir = resolve(repoRoot, "web/public/demo");

mkdirSync(docsDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

async function shotBoth(page: Page, name: string): Promise<void> {
  const docsPath = resolve(docsDir, `${name}.png`);
  const publicPath = resolve(publicDir, `${name}.png`);
  await page.screenshot({ path: docsPath, fullPage: true });
  await page.screenshot({ path: publicPath, fullPage: true });
  const size = statSync(docsPath).size;
  process.stdout.write(`  ${name}.png, ${size} bytes\n`);
}

async function shotElement(page: Page, selector: string, name: string): Promise<void> {
  const docsPath = resolve(docsDir, `${name}.png`);
  const publicPath = resolve(publicDir, `${name}.png`);
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({ path: docsPath });
  await el.screenshot({ path: publicPath });
  const size = statSync(docsPath).size;
  process.stdout.write(`  ${name}.png, ${size} bytes\n`);
}

async function clickTab(page: Page, label: string): Promise<void> {
  const tab = page.getByRole("tab", { name: label });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
  await page.waitForTimeout(600);
}

async function main(): Promise<void> {
  process.stdout.write(`launching chromium against ${URL_BASE}\n`);
  // Use full chromium (headed-mode binary running headless) to avoid pulling
  // the separate chrome-headless-shell download.
  const browser = await chromium.launch({ headless: true, channel: "chromium" });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: "dark",
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(URL_BASE, { waitUntil: "domcontentloaded" });
  // Wait for the GrainGradient fade-in, motion entrance, and the first
  // VaultStats fetch to resolve. The backend poll is 10s but the initial
  // chain-read fallback usually returns within 4-5s.
  await page.waitForTimeout(7000);

  process.stdout.write("capturing hero (default Claim tab)\n");
  await shotBoth(page, "hero");
  await shotBoth(page, "claim");

  process.stdout.write("capturing Return tab\n");
  await clickTab(page, "Return DUSDC");
  await shotBoth(page, "return");

  process.stdout.write("capturing Refill tab\n");
  await clickTab(page, "Refill");
  await shotBoth(page, "refill");

  process.stdout.write("capturing VaultStats section\n");
  await page.goto(URL_BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  // VaultStats is the section between the hero and the FaucetCard.
  // Anchor on the literal label rendered by the component, scroll the
  // surrounding card into view, screenshot the nearest card-like ancestor.
  const vaultLabel = page.getByText("Vault stats", { exact: false }).first();
  if (await vaultLabel.count()) {
    await vaultLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // Fallback to a region-based shot: capture the top ~720px of the page
    // which contains hero + vault stats at this viewport.
    await page.screenshot({
      path: resolve(docsDir, "vault-stats.png"),
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
    await page.screenshot({
      path: resolve(publicDir, "vault-stats.png"),
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
    process.stdout.write(
      `  vault-stats.png, ${statSync(resolve(docsDir, "vault-stats.png")).size} bytes\n`,
    );
  } else {
    process.stdout.write("  vault-stats label not found, capturing full hero clip instead\n");
    await page.screenshot({
      path: resolve(docsDir, "vault-stats.png"),
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
    await page.screenshot({
      path: resolve(publicDir, "vault-stats.png"),
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });
  }

  await context.close();
  await browser.close();
  process.stdout.write("done.\n");
}

main().catch((err) => {
  process.stderr.write(
    `capture-screenshots failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
