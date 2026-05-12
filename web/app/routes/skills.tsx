import type { Route } from "./+types/skills";
import { SkillsPage } from "~/components/pages/skills/skills-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Skills · Suiperpower" },
    {
      name: "description",
      content:
        "Browse every Suiperpower skill, by phase: Learn, Idea, Build, Ship, Grow.",
    },
  ];
}

export default function Skills() {
  return <SkillsPage />;
}
