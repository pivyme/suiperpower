import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconSearch,
} from "@tabler/icons-react";
import { GITHUB_LINK } from "~/config";
import { SiteFooter } from "~/components/pages/home/site-footer";
import {
  PHASE_META,
  SKILLS,
  skillRepoPath,
  type Skill,
  type SkillPhase,
} from "~/data/skills";

type PhaseFilter = "all" | SkillPhase;

const PHASE_ORDER: SkillPhase[] = ["learn", "idea", "build", "ship", "grow"];
const PHASE_RANK: Record<SkillPhase, number> = {
  learn: 0,
  idea: 1,
  build: 2,
  ship: 3,
  grow: 4,
};

export function SkillsPage() {
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SKILLS.filter((s) => {
      if (phase !== "all" && s.phase !== phase) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => PHASE_RANK[a.phase] - PHASE_RANK[b.phase]);
  }, [phase, query]);

  const counts = useMemo(() => {
    const map: Record<PhaseFilter, number> = {
      all: SKILLS.length,
      learn: 0,
      idea: 0,
      build: 0,
      ship: 0,
      grow: 0,
    };
    for (const s of SKILLS) map[s.phase] += 1;
    return map;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SkillsHero />

      <section className="relative w-full px-4 md:px-12 pt-10 md:pt-14 pb-24 flex flex-col items-center">
        <div className="max-w-5xl w-full">
          <Toolbar
            phase={phase}
            onPhaseChange={setPhase}
            query={query}
            onQueryChange={setQuery}
            counts={counts}
          />

          <div className="mt-10 md:mt-14">
            {filtered.length > 0 ? (
              <SkillGrid skills={filtered} />
            ) : (
              <div className="py-12 text-center">
                <p className="text-white/70 font-medium">
                  No skills match that search.
                </p>
                <p className="mt-1 text-white/40 text-sm">
                  Try a phase like Build, or a keyword like Walrus or zkLogin.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SkillsHero() {
  return (
    <div className="relative w-full px-4 md:px-12 pt-16 md:pt-24 pb-32 md:pb-48 min-h-[70vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #0a0a0a 0%, #0b1224 25%, #14254d 50%, #2f4d8a 75%, #6789c2 100%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="size-4 text-neutral-500" />
          Back home
        </Link>

        <h1 className="mt-8 md:mt-10 text-4xl md:text-6xl font-semibold tracking-tight">
          Skills
        </h1>
        <p className="mt-4 md:mt-5 text-white/60 font-medium text-lg md:text-2xl max-w-3xl">
          {SKILLS.length}+ skills your Sui agent can load on demand. Authored in
          plain markdown, audit-friendly, open source.
        </p>

        <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-3">
          <a
            href={`${GITHUB_LINK}/tree/main/core/skills`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white text-black hover:bg-white/90 transition-colors rounded-xl px-5 py-3 font-medium text-sm"
          >
            View source on GitHub
            <IconArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  phase,
  onPhaseChange,
  query,
  onQueryChange,
  counts,
}: {
  phase: PhaseFilter;
  onPhaseChange: (p: PhaseFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  counts: Record<PhaseFilter, number>;
}) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 backdrop-blur">
        <IconSearch className="size-5 text-white/40 shrink-0" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search skills"
          className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm md:text-base focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          active={phase === "all"}
          onClick={() => onPhaseChange("all")}
          label="All"
          count={counts.all}
        />
        {PHASE_ORDER.map((p) => (
          <FilterPill
            key={p}
            active={phase === p}
            onClick={() => onPhaseChange(p)}
            label={PHASE_META[p].label}
            count={counts[p]}
          />
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-white text-black"
          : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-xs font-mono ${
          active ? "text-black/50" : "text-white/30"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SkillGrid({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {skills.map((s) => (
        <SkillCard key={s.id} skill={s} />
      ))}
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const href = `${GITHUB_LINK}/tree/main/${skillRepoPath(skill)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <p className="text-lg md:text-xl font-semibold text-white">
          {skill.title}
        </p>

        <p className="text-sm md:text-[15px] text-white/65 font-medium leading-relaxed">
          {skill.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs font-medium text-white/60 bg-white/[0.04] border border-white/10 rounded-md px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
          <AgentBadges agents={skill.agents} />
        </div>
      </div>
    </a>
  );
}

function AgentBadges({ agents }: { agents: Skill["agents"] }) {
  const map: Record<Skill["agents"][number], { src: string; label: string }> = {
    claude: { src: "/assets/claude.webp", label: "Claude Code" },
    codex: { src: "/assets/codex.webp", label: "Codex" },
    cursor: { src: "/assets/cursor.webp", label: "Cursor" },
  };
  return (
    <div className="flex items-center -space-x-1.5 shrink-0">
      {agents.map((a) => (
        <img
          key={a}
          src={map[a].src}
          alt={map[a].label}
          title={map[a].label}
          className="size-4 rounded-full object-contain ring-1 ring-neutral-950 bg-neutral-900"
        />
      ))}
    </div>
  );
}
