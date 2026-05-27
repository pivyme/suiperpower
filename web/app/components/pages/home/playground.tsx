import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type DemoFile = { path: string; note: string };
type Demo = {
  id: string;
  title: string;
  prompt: string;
  skills: string[];
  knowledge: string[];
  files: DemoFile[];
  gate: string;
  pixels: number[][];
};

// 8x8 abstract pixel logos. 1 = filled, 0 = empty.
const PIXEL_PREDICTION = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_LAUNCHPAD = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
];

const PIXEL_GALLERY = [
  [1, 1, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_KIOSK = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
];

const PIXEL_SCALLOP = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

const PIXEL_ZKLOGIN = [
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
];

const DEMOS: Demo[] = [
  {
    id: "prediction-market",
    title: "Create a prediction market",
    prompt:
      "create a prediction market on Sui where users bet on outcomes with USDC",
    skills: [
      "/suiper:validate-idea",
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:build-with-move",
      "/suiper:deepbook-orderbook",
      "/suiper:verify-against-intent",
    ],
    knowledge: ["Move objects", "PTBs", "DeepBook v3", "Oracle patterns"],
    files: [
      { path: "sources/market.move", note: "shared Market object" },
      { path: "sources/outcome.move", note: "tradeable outcome shares" },
      { path: "sources/oracle.move", note: "resolution + settlement" },
      { path: "tests/market_tests.move", note: "edge cases covered" },
      { path: "Move.toml", note: "package manifest" },
    ],
    gate: "Outcome resolution path has a real oracle, not a TODO.",
    pixels: PIXEL_PREDICTION,
  },
  {
    id: "token-launchpad",
    title: "Build a token launchpad",
    prompt:
      "build a fair-launch token launchpad with vesting and a DEX listing",
    skills: [
      "/suiper:validate-idea",
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:build-with-move",
      "/suiper:deepbook-orderbook",
      "/suiper:verify-against-intent",
    ],
    knowledge: [
      "Coin standard",
      "TreasuryCap",
      "Clock object",
      "DeepBook pools",
    ],
    files: [
      { path: "sources/launchpad.move", note: "sale + contribution logic" },
      { path: "sources/token_factory.move", note: "Coin<T> creation" },
      { path: "sources/vesting.move", note: "linear unlock w/ Clock" },
      { path: "scripts/list-on-deepbook.ts", note: "PTB to seed liquidity" },
      { path: "tests/launchpad_tests.move", note: "refund + cap tests" },
    ],
    gate: "Vesting math is unit-tested, not just live on the UI.",
    pixels: PIXEL_LAUNCHPAD,
  },
  {
    id: "walrus-gallery",
    title: "Image gallery on Walrus",
    prompt: "build an image gallery that stores user uploads on Walrus",
    skills: [
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:walrus-storage",
      "/suiper:ptb-composer",
      "/suiper:verify-against-intent",
    ],
    knowledge: ["Walrus blobs", "Sui wallet adapter", "Object ownership"],
    files: [
      { path: "app/upload.tsx", note: "drag-drop + chunked upload" },
      { path: "app/gallery.tsx", note: "grid pulled from Walrus" },
      { path: "lib/walrus-client.ts", note: "publisher + aggregator" },
      { path: "sources/gallery.move", note: "on-chain index of blob ids" },
      { path: "tests/upload.test.ts", note: "retry + size limit" },
    ],
    gate: "Blob ids are pinned long enough for the demo to outlive judging.",
    pixels: PIXEL_GALLERY,
  },
  {
    id: "kiosk-marketplace",
    title: "NFT marketplace with Kiosk",
    prompt: "build an NFT marketplace using Kiosk with creator royalties",
    skills: [
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:build-with-move",
      "/suiper:kiosk-marketplace",
      "/suiper:verify-against-intent",
    ],
    knowledge: ["Kiosk", "TransferPolicy", "Display standard", "Royalties"],
    files: [
      { path: "sources/marketplace.move", note: "Kiosk-aware listings" },
      { path: "sources/royalty_rule.move", note: "TransferPolicy rule" },
      { path: "sources/display.move", note: "metadata fields" },
      { path: "app/list-item.tsx", note: "PTB: lock + list" },
      { path: "tests/marketplace_tests.move", note: "policy enforced" },
    ],
    gate: "Royalty rule is enforced on-chain, not just in the UI.",
    pixels: PIXEL_KIOSK,
  },
  {
    id: "scallop-dashboard",
    title: "Scallop lending dashboard",
    prompt:
      "build a dashboard that shows my Scallop positions and lets me supply USDC",
    skills: [
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:scallop-money-market",
      "/suiper:ptb-composer",
      "/suiper:verify-against-intent",
    ],
    knowledge: ["Scallop SDK", "Market pools", "Obligation accounts"],
    files: [
      { path: "app/dashboard.tsx", note: "positions + APY" },
      { path: "app/supply.tsx", note: "PTB: deposit USDC" },
      { path: "lib/scallop-client.ts", note: "typed SDK wrapper" },
      { path: "lib/positions.ts", note: "obligation parsing" },
      { path: "tests/supply.test.ts", note: "decimals + slippage" },
    ],
    gate: "APY pulled live, not hardcoded from a screenshot.",
    pixels: PIXEL_SCALLOP,
  },
  {
    id: "zklogin-auth",
    title: "zkLogin sign-in flow",
    prompt: "add zkLogin sign-in so users can log in with Google",
    skills: [
      "/suiper:plan-before-code",
      "/suiper:scaffold-project",
      "/suiper:sui-zk-login",
      "/suiper:ptb-composer",
      "/suiper:verify-against-intent",
    ],
    knowledge: ["zkLogin", "Ephemeral keys", "Salt service", "JWT proofs"],
    files: [
      { path: "app/login.tsx", note: "OAuth handoff" },
      { path: "lib/zk-login-client.ts", note: "proof + address derivation" },
      { path: "lib/session.ts", note: "ephemeral key lifecycle" },
      { path: "api/salt.ts", note: "salt service stub" },
      { path: "tests/zklogin.test.ts", note: "expiry + replay" },
    ],
    gate: "Ephemeral keys actually expire. No 'forever sessions' anti-pattern.",
    pixels: PIXEL_ZKLOGIN,
  },
];

type AgentId = "claude" | "codex" | "grok";

const AGENT_TABS: { id: AgentId; label: string; logo: string }[] = [
  { id: "claude", label: "Claude Code", logo: "/assets/claude.webp" },
  { id: "codex", label: "Codex", logo: "/assets/codex.webp" },
  { id: "grok", label: "Grok Build", logo: "/assets/grok.jpg" },
];

export function Playground() {
  const [activeId, setActiveId] = useState(DEMOS[0]!.id);
  const [agent, setAgent] = useState<AgentId>("claude");
  const active = DEMOS.find((d) => d.id === activeId) ?? DEMOS[0]!;

  return (
    <section className="w-full px-4 md:px-12 py-16 md:py-24 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col">
        <h2 className="text-3xl md:text-5xl font-semibold">Pick a prompt</h2>
        <p className="mt-4 md:mt-5 text-white/50 font-medium text-lg md:text-2xl max-w-3xl">
          See where the agent goes. Which skills load, what knowledge it pulls,
          what it scaffolds, and the quality bar it holds.
        </p>

        <ul className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
          {DEMOS.map((d) => {
            const isActive = d.id === activeId;
            return (
              <li key={d.id}>
                <button
                  onClick={() => setActiveId(d.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group hover:bg-white/[0.03] ${
                    isActive ? "bg-white/5" : ""
                  }`}
                >
                  <PixelLogo
                    pixels={d.pixels}
                    className={`size-6 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-white/40 group-hover:text-white/60"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-white/50 group-hover:text-white/80"
                    }`}
                  >
                    {d.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 md:mt-8 rounded-3xl overflow-hidden">
          <div className="flex items-end gap-2 bg-white/[0.02] pl-3 md:pl-5 pr-2 md:pr-3 pt-2 md:pt-2.5 overflow-x-auto">
            <div className="hidden sm:flex items-center gap-1.5 pb-3 mr-2">
              <span className="size-2.5 rounded-full bg-red-400/40" />
              <span className="size-2.5 rounded-full bg-yellow-400/40" />
              <span className="size-2.5 rounded-full bg-green-400/40" />
            </div>

            <div className="flex gap-0.5">
              {AGENT_TABS.map((t) => {
                const isActive = t.id === agent;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAgent(t.id)}
                    className={`relative flex items-center gap-2 px-3 md:px-3.5 py-2 rounded-t-xl font-mono text-xs transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-black/40 text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                    }`}
                  >
                    <img
                      src={t.logo}
                      alt=""
                      className="size-3.5 rounded-full object-contain"
                    />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-black/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active.id}-${agent}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 md:p-8 flex flex-col gap-5"
              >
                {agent === "claude" ? (
                  <ClaudeSession active={active} />
                ) : agent === "codex" ? (
                  <CodexSession active={active} />
                ) : (
                  <GrokSession active={active} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

const TYPE_SPEED_MS = 16;
const PROMPT_TAIL_MS = 250;

function promptDelay(prompt: string) {
  return (prompt.length * TYPE_SPEED_MS + PROMPT_TAIL_MS) / 1000;
}

function ClaudeSession({ active }: { active: Demo }) {
  const skills = active.skills;
  const base = promptDelay(active.prompt);
  return (
    <>
      <ClaudeWelcome />
      <PromptLine prompt={active.prompt} prefix=">" />
      <div className="flex flex-col gap-4 font-mono text-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0 }}
        >
          <div className="text-white/90">
            <span className="text-amber-300/80 mr-2">⏺</span>
            Routing through suiperpower skills
          </div>
          <div className="mt-1 ml-4 flex flex-col gap-0.5">
            {skills.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: base + 0.1 + i * 0.08 }}
                className="flex items-baseline gap-1"
              >
                <span className="text-white/30">⎿</span>
                <span className="text-blue-200/90">{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.6 }}
        >
          <div className="text-white/90">
            <span className="text-amber-300/80 mr-2">⏺</span>
            Knowledge loaded
          </div>
          <div className="mt-1 ml-4 flex items-baseline gap-1 text-white/70">
            <span className="text-white/30">⎿</span>
            <span>{active.knowledge.join(" · ")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.85 }}
        >
          <div className="text-white/90">
            <span className="text-amber-300/80 mr-2">⏺</span>
            Scaffolding files
          </div>
          <div className="mt-1 ml-4 flex flex-col gap-0.5">
            {active.files.map((f, i) => (
              <motion.div
                key={f.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: base + 0.95 + i * 0.06 }}
                className="flex items-baseline gap-2 text-white/70"
              >
                <span className="text-white/30">⎿</span>
                <span className="text-white/80">
                  Write(
                  <span className="text-blue-200/90">{f.path}</span>)
                </span>
                <span className="text-white/30 truncate">// {f.note}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 1.35 }}
        >
          <div className="text-white/90">
            <span className="text-amber-300/80 mr-2">⏺</span>
            Anti-slop gate
          </div>
          <div className="mt-1 ml-4 flex items-baseline gap-1 text-white/70">
            <span className="text-white/30">⎿</span>
            <span>{active.gate}</span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function ClaudeWelcome() {
  return (
    <div className="font-mono text-xs leading-relaxed overflow-x-auto">
      <img
        src="/assets/claudecode-color.svg"
        alt=""
        className="h-20 w-auto select-none"
      />
      <pre className="mt-3 text-white/50">
        {`╭─────────────────────────────────────────────────╮
│  `}
        <span className="text-amber-300/80">✻</span>
        {` Welcome to Claude Code                       │
│                                                 │
│    /help for help · /status for setup           │
│    suiperpower · 60+ skills loaded              │
│    cwd: ~/your-sui-project                      │
╰─────────────────────────────────────────────────╯`}
      </pre>
    </div>
  );
}

function CodexSession({ active }: { active: Demo }) {
  const skills = active.skills.map((s) => s.replace(/^\/suiper:/, ""));
  const base = promptDelay(active.prompt);
  return (
    <>
      <CodexWelcome />
      <div>
        <p className="font-mono text-xs text-white/40 mb-1">user</p>
        <PromptLine prompt={active.prompt} indent />
      </div>

      <div className="flex flex-col gap-3 font-mono text-sm">
        <p className="text-blue-300/70 text-xs">codex</p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.1 }}
          className="ml-3 text-white/80"
        >
          Routing through suiperpower skills.
        </motion.p>

        <div className="ml-3 flex flex-col gap-0.5">
          {skills.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: base + 0.2 + i * 0.08 }}
              className="text-white/70"
            >
              <span className="text-blue-300/70 mr-1">●</span>
              <span className="text-white/50">skill loaded:</span>{" "}
              <span className="text-white">{s}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.75 }}
          className="ml-3 text-white/70"
        >
          <span className="text-blue-300/70 mr-1">●</span>
          <span className="text-white/50">knowledge:</span>{" "}
          {active.knowledge.join(", ")}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.9 }}
          className="ml-3"
        >
          <div className="text-white/70">
            <span className="text-blue-300/70 mr-1">●</span>
            <span className="text-white/50">scaffold:</span>
          </div>
          <div className="mt-1 ml-5 flex flex-col gap-0.5">
            {active.files.map((f, i) => (
              <motion.div
                key={f.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: base + 1.0 + i * 0.06 }}
                className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-3"
              >
                <span className="text-white/80 md:w-56 shrink-0">{f.path}</span>
                <span className="text-white/30 truncate"># {f.note}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 1.4 }}
          className="ml-3 text-white/70"
        >
          <span className="text-blue-300/70 mr-1">●</span>
          <span className="text-white/50">anti-slop gate:</span>{" "}
          <span className="text-white/85">{active.gate}</span>
        </motion.div>
      </div>
    </>
  );
}

function CodexWelcome() {
  return (
    <div className="font-mono text-xs leading-relaxed overflow-x-auto">
      <pre className="text-blue-300/70 leading-tight">
        {`███ ███ ██  ███ █ █
█   █ █ █ █ ██   █
███ ███ ██  ███ █ █`}
      </pre>
      <pre className="mt-3 text-white/50">
        {`╭─────────────────────────────────────────────────╮
│  `}
        <span className="text-blue-300/70">▶</span>
        {` OpenAI codex CLI                             │
│                                                 │
│    model: gpt-5 · approval: full · sandbox      │
│    suiperpower · 60+ skills loaded              │
│    cwd: ~/your-sui-project                      │
╰─────────────────────────────────────────────────╯`}
      </pre>
    </div>
  );
}

function GrokSession({ active }: { active: Demo }) {
  const skills = active.skills.map((s) => s.replace(/^\/suiper:/, ""));
  const base = promptDelay(active.prompt);
  return (
    <>
      <GrokWelcome />
      <div>
        <p className="font-mono text-xs text-white/40 mb-1">you</p>
        <PromptLine prompt={active.prompt} indent />
      </div>

      <div className="flex flex-col gap-3 font-mono text-sm">
        <p className="text-white/55 text-xs">grok</p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.1 }}
          className="ml-3 text-white/80"
        >
          Reading ~/.grok/skills, routing through suiperpower.
        </motion.p>

        <div className="ml-3 flex flex-col gap-0.5">
          {skills.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: base + 0.2 + i * 0.08 }}
              className="text-white/70"
            >
              <span className="text-white/50 mr-1">✦</span>
              <span className="text-white/50">skill:</span>{" "}
              <span className="text-white">/{s}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.75 }}
          className="ml-3 text-white/70"
        >
          <span className="text-white/50 mr-1">✦</span>
          <span className="text-white/50">knowledge:</span>{" "}
          {active.knowledge.join(", ")}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 0.9 }}
          className="ml-3"
        >
          <div className="text-white/70">
            <span className="text-white/50 mr-1">✦</span>
            <span className="text-white/50">scaffold:</span>
          </div>
          <div className="mt-1 ml-5 flex flex-col gap-0.5">
            {active.files.map((f, i) => (
              <motion.div
                key={f.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: base + 1.0 + i * 0.06 }}
                className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-3"
              >
                <span className="text-white/80 md:w-56 shrink-0">{f.path}</span>
                <span className="text-white/30 truncate"># {f.note}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base + 1.4 }}
          className="ml-3 text-white/70"
        >
          <span className="text-white/50 mr-1">✦</span>
          <span className="text-white/50">anti-slop gate:</span>{" "}
          <span className="text-white/85">{active.gate}</span>
        </motion.div>
      </div>
    </>
  );
}

function GrokWelcome() {
  return (
    <div className="font-mono text-xs leading-relaxed overflow-x-auto">
      <pre className="text-white/60 leading-tight">
        {`█▀▀ █▀█ █▀█ █ █
█▄█ █▀▄ █ █ █▀▄
▀▀▀ ▀ ▀ ▀▀▀ ▀ ▀`}
      </pre>
      <pre className="mt-3 text-white/50">
        {`╭─────────────────────────────────────────────────╮
│  `}
        <span className="text-white/80">✦</span>
        {` Welcome to Grok Build                        │
│                                                 │
│    /skills for extensions · /plan mode          │
│    suiperpower · 60+ skills loaded              │
│    cwd: ~/your-sui-project                      │
╰─────────────────────────────────────────────────╯`}
      </pre>
    </div>
  );
}

function PromptLine({
  prompt,
  prefix,
  indent,
}: {
  prompt: string;
  prefix?: string;
  indent?: boolean;
}) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) clearInterval(id);
    }, TYPE_SPEED_MS);
    return () => clearInterval(id);
  }, [prompt]);

  return (
    <div
      className={`font-mono text-sm flex items-start gap-2 leading-relaxed ${
        indent ? "ml-3" : ""
      }`}
    >
      {prefix && <span className="text-blue-300/80 shrink-0">{prefix}</span>}
      <span className="text-white">
        {typed}
        <span className="inline-block w-1.5 h-3.5 align-[-2.5px] bg-white/70 ml-0.5 animate-pulse" />
      </span>
    </div>
  );
}

function PixelLogo({
  pixels,
  className,
}: {
  pixels: number[][];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {pixels.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="currentColor"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
