import { BRAND, ENV } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";

const ASCII = [
  "  ___ _   _ ___ ___ ___ ___ ___ _____      _____ ___ ",
  " / __| | | |_ _| _ \\ __| _ \\ _ \\_   _|/\\__ /\\ __| _ \\",
  " \\__ \\ |_| || ||  _/ _||   /  _/ | |  ( o.o ) _||   /",
  " |___/\\___/|___|_| |___|_|_\\_|   |_|   \\___/\\___|_|_\\",
];

export function printBanner(): void {
  if (process.env[ENV.NO_BANNER]) return;
  for (const line of ASCII) console.log(accent(line));
  console.log("");
  console.log(`  ${bold(BRAND.PRODUCT_NAME_TITLE)} ${muted("·")} ${dim(BRAND.TAGLINE)}`);
  console.log(`  ${muted(BRAND.WEBSITE_URL)}`);
  console.log("");
}
