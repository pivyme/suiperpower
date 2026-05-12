import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconSearch,
  IconTerminal2,
} from "@tabler/icons-react";
import { GITHUB_LINK } from "~/config";
import { CliBox } from "~/components/ui/cli-box";
import { SiteFooter } from "~/components/pages/home/site-footer";
import {
  PHASE_META,
  SKILLS,
  skillRepoPath,
  type Skill,
  type SkillPhase,
} from "~/data/skills";
import skillsIndex from "~/data/skills-index.json";

type PhaseFilter = "all" | SkillPhase;

type IndexEntry = {
  id: string;
  phase: SkillPhase;
  description: string;
  tarballUrl: string;
  githubPath: string;
  npxCmd: string;
  sha256: string;
  size: number;
  version: string;
};

type MergedSkill = Skill & { index: IndexEntry };

const PHASE_ORDER: SkillPhase[] = ["learn", "idea", "build", "ship", "grow"];
const PHASE_RANK: Record<SkillPhase, number> = {
  learn: 0,
  idea: 1,
  build: 2,
  ship: 3,
  grow: 4,
};

const INDEX_BY_ID: Map<string, IndexEntry> = new Map(
  (skillsIndex.skills as IndexEntry[]).map((e) => [e.id, e]),
);

const MERGED: MergedSkill[] = SKILLS.flatMap((s) => {
  const entry = INDEX_BY_ID.get(s.name);
  return entry ? [{ ...s, index: entry }] : [];
});

function rawSkillUrl(skill: Skill): string {
  return `https://raw.githubusercontent.com/pivyme/suiperpower/main/${skillRepoPath(skill)}/SKILL.md`;
}

function githubTreeUrl(skill: Skill): string {
  return `${GITHUB_LINK}/tree/main/${skillRepoPath(skill)}`;
}

export function SkillsPage() {
  const [phase, setPhase] = useState<PhaseFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MERGED.filter((s) => {
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
      all: MERGED.length,
      learn: 0,
      idea: 0,
      build: 0,
      ship: 0,
      grow: 0,
    };
    for (const s of MERGED) map[s.phase] += 1;
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
          <IconChevronLeft className="size-4 text-neutral-500" />
          Back home
        </Link>

        <h1 className="mt-8 md:mt-10 text-4xl md:text-6xl font-semibold tracking-tight">
          Skills
        </h1>
        <p className="mt-4 md:mt-5 text-white/60 font-medium text-lg md:text-2xl max-w-3xl">
          {MERGED.length}+ skills your Sui agent can load on demand. Authored in
          plain markdown, audit-friendly, open source.
        </p>

        <div className="mt-10 md:mt-12 w-full max-w-2xl flex flex-col gap-3 md:gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium bg-white rounded-xl text-black px-5 py-2 text-sm md:text-base md:px-6">
              Install any skill
            </div>
            <a
              href={`${GITHUB_LINK}/tree/main/core/skills`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-medium text-sm"
            >
              <IconBrandGithub className="size-4" />
              View source on GitHub
            </a>
          </div>
          <CliBox
            command="npx skills add https://github.com/pivyme/suiperpower/tree/main/core/skills/<phase>/<name>"
            ariaLabel="Copy install command"
          />
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

function SkillGrid({ skills }: { skills: MergedSkill[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {skills.map((s) => (
        <SkillCard key={s.id} skill={s} />
      ))}
    </div>
  );
}

function SkillCard({ skill }: { skill: MergedSkill }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const githubUrl = githubTreeUrl(skill);
  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${
        menuOpen ? "z-20" : "z-0"
      }`}
    >
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg md:text-xl font-semibold text-white hover:text-white/90 transition-colors"
        >
          {skill.title}
        </a>

        <p className="text-sm md:text-[15px] text-white/65 font-medium leading-relaxed">
          {skill.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {skill.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs font-medium text-white/60 bg-white/[0.04] border border-white/10 rounded-md px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AgentBadges agents={skill.agents} />
            <SkillInstallMenu
              skill={skill}
              open={menuOpen}
              onOpenChange={setMenuOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillInstallMenu({
  skill,
  open,
  onOpenChange,
}: {
  skill: MergedSkill;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [copied, setCopied] = useState<null | "npx" | "raw">(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  async function copy(text: string, kind: "npx" | "raw") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // silent
    }
  }

  const npx = skill.index.npxCmd;
  const tarball = skill.index.tarballUrl;
  const raw = rawSkillUrl(skill);
  const github = githubTreeUrl(skill);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-2.5 py-1 text-xs font-semibold transition-colors"
      >
        Add
        <IconChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ transformOrigin: "top right" }}
          className="absolute right-0 top-full mt-2 z-20 w-72 rounded-xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden"
        >
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase text-white/40 font-semibold">
            One command
          </div>
          <button
            role="menuitem"
            onClick={() => copy(npx, "npx")}
            className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-white/[0.05] text-left transition-colors"
          >
            <IconTerminal2 className="size-4 text-white/60 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white">
                  Install with npx skills
                </span>
                {copied === "npx" ? (
                  <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <IconCopy className="size-3.5 text-white/40 shrink-0" />
                )}
              </div>
              <code className="block mt-1 text-[11px] font-mono text-white/50 truncate">
                {npx}
              </code>
            </div>
          </button>

          <div className="h-px bg-white/[0.06] mx-3" />

          <div className="px-3 pt-2 pb-1 text-[10px] uppercase text-white/40 font-semibold">
            Other options
          </div>
          <a
            role="menuitem"
            href={tarball}
            className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05] transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <IconDownload className="size-4 text-white/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white">
                Download .tar.gz
              </div>
              <div className="text-[11px] text-white/40">
                {formatBytes(skill.index.size)} · sha256 {skill.index.sha256.slice(0, 8)}
              </div>
            </div>
          </a>
          <button
            role="menuitem"
            onClick={() => copy(raw, "raw")}
            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05] text-left transition-colors"
          >
            <IconCopy className="size-4 text-white/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white">
                  Copy SKILL.md raw URL
                </span>
                {copied === "raw" ? (
                  <IconCheck className="size-3.5 text-emerald-400 shrink-0" />
                ) : null}
              </div>
              <div className="text-[11px] text-white/40 truncate">
                paste into any agent
              </div>
            </div>
          </button>
          <a
            role="menuitem"
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.05] transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <IconBrandGithub className="size-4 text-white/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white">
                  View on GitHub
                </span>
                <IconExternalLink className="size-3.5 text-white/40 shrink-0" />
              </div>
              <div className="text-[11px] text-white/40 truncate">
                {skillRepoPath(skill)}
              </div>
            </div>
          </a>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
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

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
