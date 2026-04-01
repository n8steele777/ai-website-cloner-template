import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import type { Result } from "axe-core";

/**
 * Automated WCAG pass: axe-core with WCAG 2.0/2.1 Level A & AA tags.
 * Run after production build: `npm run build && npm run test:a11y`
 */
const PATHS = ["/", "/work", "/about", "/work/baxo"] as const;

async function settleForAxe(page: Page, path: string): Promise<void> {
  await page.waitForTimeout(300);

  if (path === "/work") {
    const first = page.locator("[data-work-card]").first();
    await first.waitFor({ state: "visible", timeout: 30_000 });
    await expect(first).toHaveCSS("opacity", "1", { timeout: 15_000 });
  }
}

function formatViolations(violations: Result[]): string {
  return violations
    .map((v) => {
      const targets = v.nodes
        .map((n) => (n.target.length ? n.target.join(" ") : n.html))
        .slice(0, 5);
      return `${v.id} (${v.impact}): ${v.help}\n  ${targets.join("\n  ")}${v.nodes.length > 5 ? "\n  …" : ""}`;
    })
    .join("\n\n");
}

for (const path of PATHS) {
  test(`axe WCAG 2.1 A/AA: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "load", timeout: 90_000 });
    await page.locator("main").first().waitFor({ state: "visible", timeout: 30_000 });
    await settleForAxe(page, path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
}
