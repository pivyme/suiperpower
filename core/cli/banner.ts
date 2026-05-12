import { BRAND, ENV } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";

const ASCII = [
  "  ____        _                                             ",
  " / ___| _   _(_)_ __   ___ _ __ _ __   _____      _____ _ __",
  " \\___ \\| | | | | '_ \\ / _ \\ '__| '_ \\ / _ \\ \\ /\\ / / _ \\ '__|",
  "  ___) | |_| | | |_) |  __/ |  | |_) | (_) \\ V  V /  __/ |   ",
  " |____/ \\__,_|_| .__/ \\___|_|  | .__/ \\___/ \\_/\\_/ \\___|_|   ",
  "               |_|             |_|                            ",
];

export function printBanner(): void {
  if (process.env[ENV.NO_BANNER]) return;
  for (const line of ASCII) console.log(accent(line));
  console.log("");
  console.log(`  ${bold(BRAND.PRODUCT_NAME_TITLE)} ${muted("·")} ${dim(BRAND.TAGLINE)}`);
  console.log(`  ${muted(BRAND.WEBSITE_URL)}`);
  console.log("");
}
