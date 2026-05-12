import type { Route } from "./+types/skills";
import { SkillsPage } from "~/components/pages/skills/skills-page";

const SITE_URL = "https://suiperpower.dev";
const OG_IMAGE = `${SITE_URL}/assets/suiperpower-og.png`;

export function meta({}: Route.MetaArgs) {
  const title = "Sui Agent Skills, Learn, Idea, Build, Ship, Grow · Suiperpower";
  const description =
    "Browse every Suiperpower skill for Sui Move, PTBs, Walrus, DeepBook, Scallop, zkLogin, and more. Curated AI agent skills across Learn, Idea, Build, Ship, and Grow phases.";
  const keywords = [
    "Sui agent skills",
    "Sui Move skills",
    "AI skills for Sui",
    "Sui developer skills",
    "Claude Code skills Sui",
    "Cursor rules Sui",
    "Walrus skill",
    "DeepBook skill",
    "Scallop skill",
    "zkLogin skill",
    "Sui Overflow skills",
    "Suiperpower skills",
  ].join(", ");
  const url = `${SITE_URL}/skills`;

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { tagName: "link", rel: "canonical", href: url },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Suiperpower" },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:width", content: "1920" },
    { property: "og:image:height", content: "1080" },
    {
      property: "og:image:alt",
      content: "Suiperpower skills catalog for Sui developers",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@suiperpower" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: OG_IMAGE },
  ];
}

export default function Skills() {
  return <SkillsPage />;
}
