// Single source of truth for every brand string.
// Anywhere else that needs a brand string imports from here. Never hardcode
// product name, URLs, env vars, or paths in another file.

export const BRAND = {
  PRODUCT_NAME: "suiperpower",
  PRODUCT_NAME_TITLE: "Suiperpower",
  TAGLINE: "Build something meaningful, on Sui",
  DESCRIPTION: "skills, knowledge, and a CLI for shipping production Sui products",

  INSTALL_URL: "https://suiperpower.dev/setup.sh",
  WEBSITE_URL: "https://suiperpower.dev",

  GH_REPO: "pivyme/suiperpower",
  GH_URL: "https://github.com/pivyme/suiperpower",

  NPM_PKG: "suiperpower",
  CONFIG_DIR: ".suiperpower",

  CONVEX_URL_DEFAULT: "<convex-url-placeholder>",

  TELEGRAM_URL: "https://go.sui.io/suioverflow2026-tg",
  HACKATHON_URL: "https://overflow.sui.io",
  SUBMISSION_URL: "https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf",
} as const;

export const ENV = {
  NO_BANNER: "SUIPERPOWER_NO_BANNER",
  AGENT: "SUIPERPOWER_AGENT",
  DEBUG: "SUIPERPOWER_DEBUG",
  TELEMETRY: "SUIPERPOWER_TELEMETRY",
  CONVEX_URL: "SUIPERPOWER_CONVEX_URL",
} as const;

export const PATHS = {
  CLAUDE_SKILLS: "~/.claude/skills",
  CODEX_SKILLS: "~/.codex/skills",
  CURSOR_RULES: "~/.cursor/rules",
  HOME_CONFIG: `~/${BRAND.CONFIG_DIR}`,
  PROJECT_CONTEXT: BRAND.CONFIG_DIR,
} as const;
