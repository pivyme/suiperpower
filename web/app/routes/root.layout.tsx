import { Outlet } from "react-router";
import type { Route } from "../+types/root";

const SITE_URL = "https://suiperpower.dev";
const OG_IMAGE = `${SITE_URL}/assets/suiperpower-og.png`;

export function meta({}: Route.MetaArgs) {
  const title = "Suiperpower, AI agent skills and CLI for Sui developers";
  const description =
    "Give Claude Code, Cursor, Codex, and Grok Build superpower on Sui. Skills, knowledge, CLI, and anti-slop quality gates for shipping real Sui Move products.";
  const keywords = [
    "Sui",
    "Sui development",
    "Sui developer tools",
    "AI agent skills Sui",
    "Sui Move",
    "Claude Code Sui",
    "Cursor Sui",
    "Codex Sui",
    "Grok Build Sui",
    "Sui CLI",
    "build on Sui",
    "Sui Overflow 2026",
    "Walrus",
    "DeepBook",
    "Sui hackathon",
    "Sui dapp",
    "zkLogin",
    "Sui Object model",
    "Programmable Transaction Blocks",
    "Suiperpower",
  ].join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: "Suiperpower",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/suiperpower-logo.webp`,
        sameAs: [
          "https://github.com/pivyme/suiperpower",
          "https://x.com/suiperpower",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Suiperpower",
        description,
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        name: "Suiperpower",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS, Linux, Windows",
        url: SITE_URL,
        description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": `${SITE_URL}/#org` },
      },
    ],
  };

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "author", content: "Pivy" },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { name: "theme-color", content: "#0b0b0f" },
    { name: "color-scheme", content: "dark light" },
    { name: "application-name", content: "Suiperpower" },
    { tagName: "link", rel: "canonical", href: SITE_URL },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: SITE_URL },
    { property: "og:site_name", content: "Suiperpower" },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:secure_url", content: OG_IMAGE },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1920" },
    { property: "og:image:height", content: "1080" },
    {
      property: "og:image:alt",
      content:
        "Suiperpower, build something meaningful on Sui. AI agent skills and CLI for Sui developers.",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@suiperpower" },
    { name: "twitter:creator", content: "@suiperpower" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
    {
      name: "twitter:image:alt",
      content:
        "Suiperpower, build something meaningful on Sui. AI agent skills and CLI for Sui developers.",
    },

    { "script:ld+json": jsonLd },
  ];
}

export default function RootLayout() {
  return <Outlet />;
}
