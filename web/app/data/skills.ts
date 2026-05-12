export type SkillPhase = "learn" | "idea" | "build" | "ship" | "grow";

export type SkillAgent = "claude" | "codex" | "cursor";

export type Skill = {
  id: string;
  name: string;
  title: string;
  phase: SkillPhase;
  description: string;
  tags: string[];
  agents: SkillAgent[];
};

const PIXEL_LEARN = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_IDEA = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_BUILD = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
];

const PIXEL_SHIP = [
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
];

const PIXEL_GROW = [
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
];

export const PHASE_META: Record<
  SkillPhase,
  {
    label: string;
    tagline: string;
    index: number;
    pixels: number[][];
    accent: string;
  }
> = {
  learn: {
    label: "Learn",
    tagline: "Get oriented on Sui without a 50-tab research session.",
    index: 1,
    pixels: PIXEL_LEARN,
    accent:
      "radial-gradient(ellipse 90% 80% at 20% 20%, rgba(96, 165, 250, 0.45), transparent 70%), linear-gradient(135deg, #08142e 0%, #0a1c3d 100%)",
  },
  idea: {
    label: "Idea",
    tagline: "Pressure-test what you build before writing a line of code.",
    index: 2,
    pixels: PIXEL_IDEA,
    accent:
      "radial-gradient(ellipse 90% 80% at 80% 20%, rgba(147, 197, 253, 0.5), transparent 70%), linear-gradient(135deg, #0a1c3d 0%, #050a18 100%)",
  },
  build: {
    label: "Build",
    tagline: "Scaffold, integrate, iterate, with knowledge your agent reads.",
    index: 3,
    pixels: PIXEL_BUILD,
    accent:
      "radial-gradient(ellipse 90% 80% at 50% 30%, rgba(21, 93, 252, 0.55), transparent 65%), linear-gradient(135deg, #0a1c3d 0%, #08142e 100%)",
  },
  ship: {
    label: "Ship",
    tagline: "Get to mainnet without skipping the gates that catch real bugs.",
    index: 4,
    pixels: PIXEL_SHIP,
    accent:
      "radial-gradient(ellipse 90% 80% at 30% 80%, rgba(59, 130, 246, 0.5), transparent 70%), linear-gradient(135deg, #050a18 0%, #0a1c3d 100%)",
  },
  grow: {
    label: "Grow",
    tagline: "Earn first users, not just a launch tweet.",
    index: 5,
    pixels: PIXEL_GROW,
    accent:
      "radial-gradient(ellipse 90% 80% at 70% 70%, rgba(191, 219, 254, 0.4), transparent 70%), linear-gradient(135deg, #08142e 0%, #050a18 100%)",
  },
};

export const ALL_AGENTS: SkillAgent[] = ["claude", "codex", "cursor"];

const ALL: SkillAgent[] = ["claude", "codex", "cursor"];

export const SKILLS: Skill[] = [
  // learn
  {
    id: "learn",
    name: "learn",
    title: "Capture session learnings",
    phase: "learn",
    description:
      "Capture what was decided in a session so the next skill, or future-you, can pick up cleanly.",
    tags: ["Handoff"],
    agents: ALL,
  },
  {
    id: "sui-beginner",
    name: "sui-beginner",
    title: "Sui from scratch",
    phase: "learn",
    description:
      "Teach Sui from zero. Maps EVM and Solana concepts to their Sui equivalents for builders new to the platform.",
    tags: ["Onboarding", "Move"],
    agents: ALL,
  },

  // idea
  {
    id: "competitive-landscape",
    name: "competitive-landscape",
    title: "Map the landscape",
    phase: "idea",
    description:
      "Map competitors on Sui and adjacent chains. Find the defensible angle worth building.",
    tags: ["Research"],
    agents: ALL,
  },
  {
    id: "deepbook-research",
    name: "deepbook-research",
    title: "DeepBook research",
    phase: "idea",
    description:
      "Research DeepBook trading data, underserved pairs, pool activity, and product opportunities on the orderbook.",
    tags: ["DeepBook", "Sponsor"],
    agents: ALL,
  },
  {
    id: "defillama-sui",
    name: "defillama-sui",
    title: "Research Sui DeFi",
    phase: "idea",
    description:
      "Use DefiLlama TVL, yield, and protocol data to find concrete Sui DeFi market gaps.",
    tags: ["DeFi", "Research"],
    agents: ALL,
  },
  {
    id: "find-next-sui-idea",
    name: "find-next-sui-idea",
    title: "Find your next idea",
    phase: "idea",
    description:
      "Surface hackathon-grade ideas, or stress-test your own, from a curated Sui-native corpus.",
    tags: ["Discovery"],
    agents: ALL,
  },
  {
    id: "overflow-copilot",
    name: "overflow-copilot",
    title: "Past Overflow projects",
    phase: "idea",
    description:
      "Research past Sui Overflow projects. What won, what was built, where the open gaps are.",
    tags: ["Overflow"],
    agents: ALL,
  },
  {
    id: "validate-idea",
    name: "validate-idea",
    title: "Stress-test your idea",
    phase: "idea",
    description:
      "Pressure-test demand, competition, feasibility, and Sui-native fit. Produces a go/no-go.",
    tags: ["Validation"],
    agents: ALL,
  },
  {
    id: "walrus-research",
    name: "walrus-research",
    title: "Walrus research",
    phase: "idea",
    description:
      "Research Walrus storage usage patterns, underserved use cases, and product opportunities.",
    tags: ["Walrus", "Sponsor"],
    agents: ALL,
  },

  // build
  {
    id: "brand-design",
    name: "brand-design",
    title: "Brand the product",
    phase: "build",
    description:
      "Pick colors, name the product, choose a typeface, fix a generic crypto look.",
    tags: ["Brand", "Design"],
    agents: ALL,
  },
  {
    id: "build-ai-agent",
    name: "build-ai-agent",
    title: "Build an AI agent",
    phase: "build",
    description:
      "Build an autonomous Sui agent with PTBs, wallet patterns, memory, and compute choices.",
    tags: ["Agent", "PTB"],
    agents: ALL,
  },
  {
    id: "build-data-pipeline",
    name: "build-data-pipeline",
    title: "Build a data pipeline",
    phase: "build",
    description:
      "Index and query Sui data with GraphQL RPC, events, custom indexers, or gRPC.",
    tags: ["Data", "Indexer"],
    agents: ALL,
  },
  {
    id: "build-mobile-sui",
    name: "build-mobile-sui",
    title: "Build for mobile",
    phase: "build",
    description:
      "Ship a mobile Sui app. Sui Mobile SDK, React Native Sui, wallet deep-links on iOS or Android.",
    tags: ["Mobile"],
    agents: ALL,
  },
  {
    id: "build-with-claude",
    name: "build-with-claude",
    title: "Pair-build with Claude",
    phase: "build",
    description:
      "Pair-program an MVP step by step, broken into committable slices that pass the quality gates.",
    tags: ["Claude Code"],
    agents: ALL,
  },
  {
    id: "build-with-move",
    name: "build-with-move",
    title: "Build with Move",
    phase: "build",
    description:
      "Write idiomatic Sui Move. Modules, packages, function-by-function, scaffolded with a senior pair.",
    tags: ["Move"],
    agents: ALL,
  },
  {
    id: "cetus-swap",
    name: "cetus-swap",
    title: "Integrate Cetus",
    phase: "build",
    description:
      "Integrate Cetus CLMM for swaps and concentrated liquidity positions on Sui.",
    tags: ["Cetus", "DeFi"],
    agents: ALL,
  },
  {
    id: "clarify-intent",
    name: "clarify-intent",
    title: "Clarify intent",
    phase: "build",
    description:
      "Pin down Objects, capabilities, network, and upgrade authority before any code. Writes intent.md.",
    tags: ["Intent loop"],
    agents: ALL,
  },
  {
    id: "cso",
    name: "cso",
    title: "Audit infrastructure",
    phase: "build",
    description:
      "Run an infrastructure security audit across OWASP, STRIDE, supply chain, RPC, and keys.",
    tags: ["Security"],
    agents: ALL,
  },
  {
    id: "debug-move",
    name: "debug-move",
    title: "Debug Move errors",
    phase: "build",
    description:
      "Diagnose Move build failures, PTB reverts, abort codes, and capability leaks step by step.",
    tags: ["Move", "Debug"],
    agents: ALL,
  },
  {
    id: "deepbook-orderbook",
    name: "deepbook-orderbook",
    title: "Integrate DeepBook v3",
    phase: "build",
    description:
      "Build a CLOB on Sui. Place or fill orders. Ship a DEX backed by DeepBook v3 instead of an AMM.",
    tags: ["DeepBook", "Sponsor"],
    agents: ALL,
  },
  {
    id: "design-taste",
    name: "design-taste",
    title: "Sharpen design taste",
    phase: "build",
    description:
      "Diagnose why a Sui dapp looks generic or AI-generated. Output a specific, actionable fix list.",
    tags: ["Design"],
    agents: ALL,
  },
  {
    id: "eve-frontier",
    name: "eve-frontier",
    title: "Build for EVE Frontier",
    phase: "build",
    description:
      "Build EVE Frontier mods and Smart Assembly logic with Sui integration points.",
    tags: ["Game", "EVE"],
    agents: ALL,
  },
  {
    id: "frontend-design-guidelines",
    name: "frontend-design-guidelines",
    title: "Frontend guidelines",
    phase: "build",
    description:
      "Layout, spacing, hierarchy, accessibility for a Sui dapp. Avoids the crypto-template look.",
    tags: ["Design", "Frontend"],
    agents: ALL,
  },
  {
    id: "kiosk-marketplace",
    name: "kiosk-marketplace",
    title: "Kiosk marketplace",
    phase: "build",
    description:
      "Build an NFT marketplace on the Kiosk standard. List NFTs, enforce transfer policies, take royalties.",
    tags: ["Kiosk", "NFT"],
    agents: ALL,
  },
  {
    id: "launch-coin",
    name: "launch-coin",
    title: "Launch a coin",
    phase: "build",
    description:
      "Decide tokenomics, custody TreasuryCap, ship a token that renders cleanly in wallets.",
    tags: ["Coin"],
    agents: ALL,
  },
  {
    id: "nautilus-offchain",
    name: "nautilus-offchain",
    title: "Use Nautilus off-chain",
    phase: "build",
    description:
      "Wire Nautilus trusted off-chain compute into a Sui app, including attestation flows.",
    tags: ["Nautilus", "TEE"],
    agents: ALL,
  },
  {
    id: "navi-lending",
    name: "navi-lending",
    title: "Integrate NAVI",
    phase: "build",
    description:
      "Build NAVI lending flows for deposits, borrows, withdrawals, repayments, and flash loans.",
    tags: ["NAVI", "DeFi"],
    agents: ALL,
  },
  {
    id: "navigate-skills",
    name: "navigate-skills",
    title: "Navigate the catalog",
    phase: "build",
    description:
      "Help the agent pick which Suiperpower skill to use for the goal at hand.",
    tags: ["Meta"],
    agents: ALL,
  },
  {
    id: "number-formatting",
    name: "number-formatting",
    title: "Format numbers right",
    phase: "build",
    description:
      "Token amounts, MIST to SUI, USD, percentages, gas, addresses. Formatted the way real fintech UIs do.",
    tags: ["UX"],
    agents: ALL,
  },
  {
    id: "object-model-design",
    name: "object-model-design",
    title: "Design your objects",
    phase: "build",
    description:
      "Design the Sui Object schema. Owned vs shared vs immutable. Capability and witness patterns.",
    tags: ["Objects"],
    agents: ALL,
  },
  {
    id: "openzeppelin-sui-libs",
    name: "openzeppelin-sui-libs",
    title: "Use OpenZeppelin libs",
    phase: "build",
    description:
      "Replace hand-rolled access control, pausable, ownable, upgrade patterns with audited OZ Move libs.",
    tags: ["OpenZeppelin", "Sponsor"],
    agents: ALL,
  },
  {
    id: "ottersec-prep",
    name: "ottersec-prep",
    title: "Prep an OtterSec audit",
    phase: "build",
    description:
      "Walk the pre-audit checklist and produce the engagement package an audit firm actually wants.",
    tags: ["Security", "Sponsor"],
    agents: ALL,
  },
  {
    id: "page-load-animations",
    name: "page-load-animations",
    title: "Page load motion",
    phase: "build",
    description:
      "Fix janky loads and layout shift. Add calmer skeletons and transitions on a Sui dapp.",
    tags: ["Motion"],
    agents: ALL,
  },
  {
    id: "plan-before-code",
    name: "plan-before-code",
    title: "Plan before code",
    phase: "build",
    description:
      "Force decisions before code: modules, capabilities, sponsor posture, PTB shape. Writes build-plan.md.",
    tags: ["Intent loop"],
    agents: ALL,
  },
  {
    id: "product-review",
    name: "product-review",
    title: "Review your product",
    phase: "build",
    description:
      "Review the product as a first-time user would, from first paint through empty states and mobile.",
    tags: ["Product"],
    agents: ALL,
  },
  {
    id: "ptb-composer",
    name: "ptb-composer",
    title: "Compose a PTB",
    phase: "build",
    description:
      "Chain multiple Move calls or transfers atomically in a Programmable Transaction Block.",
    tags: ["PTB"],
    agents: ALL,
  },
  {
    id: "pyth-oracle",
    name: "pyth-oracle",
    title: "Integrate Pyth",
    phase: "build",
    description:
      "Add Pyth price feeds to a Sui app or Move package with freshness and staleness checks.",
    tags: ["Oracle", "Pyth"],
    agents: ALL,
  },
  {
    id: "retention-loop",
    name: "retention-loop",
    title: "Design retention",
    phase: "build",
    description:
      "Articulate day 1, day 7, day 30 retention anchors. Why users come back, not why they sign up.",
    tags: ["Product"],
    agents: ALL,
  },
  {
    id: "review-move",
    name: "review-move",
    title: "Review Move code",
    phase: "build",
    description:
      "Run an internal P0-P3 security review. Spot where audited libraries can replace hand-rolled code.",
    tags: ["Move", "Review"],
    agents: ALL,
  },
  {
    id: "roast-my-product",
    name: "roast-my-product",
    title: "Roast my product",
    phase: "build",
    description:
      "Brutal, investor-grade critique of a Sui product, pitch, or positioning. No marketing-speak.",
    tags: ["Product"],
    agents: ALL,
  },
  {
    id: "scaffold-project",
    name: "scaffold-project",
    title: "Scaffold a project",
    phase: "build",
    description:
      "Start a new Sui project. Bootstrap a workspace with the right stack and template defaults.",
    tags: ["Scaffolding"],
    agents: ALL,
  },
  {
    id: "scallop-money-market",
    name: "scallop-money-market",
    title: "Integrate Scallop",
    phase: "build",
    description:
      "Wire up Scallop. Deposit, borrow, repay flows, obligation accounts, position parsing.",
    tags: ["Scallop", "Sponsor"],
    agents: ALL,
  },
  {
    id: "seal-access-control",
    name: "seal-access-control",
    title: "Use Seal access control",
    phase: "build",
    description:
      "Use Seal for encrypted data access, key servers, threshold encryption, and Move checks.",
    tags: ["Seal", "Encryption"],
    agents: ALL,
  },
  {
    id: "sponsored-transactions",
    name: "sponsored-transactions",
    title: "Sponsor gas",
    phase: "build",
    description:
      "Add sponsored or gasless transactions. Build a gas station, pay gas for users without footguns.",
    tags: ["PTB", "UX"],
    agents: ALL,
  },
  {
    id: "sui-zk-login",
    name: "sui-zk-login",
    title: "Ship zkLogin sign-in",
    phase: "build",
    description:
      "Sign in with Google, Apple, Facebook, or Twitch. Real Sui address. Ephemeral keys that expire.",
    tags: ["zkLogin"],
    agents: ALL,
  },
  {
    id: "suins-integration",
    name: "suins-integration",
    title: "Integrate SuiNS",
    phase: "build",
    description:
      "Resolve .sui names, register names, and use MVR package naming in a Sui product.",
    tags: ["SuiNS", "Naming"],
    agents: ALL,
  },
  {
    id: "validate-business-model",
    name: "validate-business-model",
    title: "Validate the business",
    phase: "build",
    description:
      "Who pays, how much, pricing, monetization, profitability. Sanity-checked before optimizing.",
    tags: ["Business"],
    agents: ALL,
  },
  {
    id: "verify-against-intent",
    name: "verify-against-intent",
    title: "Verify against intent",
    phase: "build",
    description:
      "Check Move, capabilities, sponsor integrations, and upgrades against intent.md and build-plan.md.",
    tags: ["Intent loop"],
    agents: ALL,
  },
  {
    id: "virtual-sui-incubator",
    name: "virtual-sui-incubator",
    title: "Virtual incubator",
    phase: "build",
    description:
      "Deep teaching: consensus, Object model, Move execution, gas, upgrades, indexer architecture.",
    tags: ["Internals"],
    agents: ALL,
  },
  {
    id: "walrus-sites",
    name: "walrus-sites",
    title: "Deploy Walrus Sites",
    phase: "build",
    description:
      "Host static sites on Walrus, publish site resources, and connect SuiNS names.",
    tags: ["Walrus", "Hosting"],
    agents: ALL,
  },
  {
    id: "walrus-storage",
    name: "walrus-storage",
    title: "Integrate Walrus",
    phase: "build",
    description:
      "Store files, NFT media, and user uploads on Walrus. Commit blob ids on-chain in your Sui project.",
    tags: ["Walrus", "Sponsor"],
    agents: ALL,
  },
  {
    id: "will-real-users-pay",
    name: "will-real-users-pay",
    title: "Will users actually pay",
    phase: "build",
    description:
      "Stress-test pricing with a cheap willingness-to-pay experiment. Distinguishes love from dollars.",
    tags: ["Business"],
    agents: ALL,
  },

  // ship
  {
    id: "apply-grant",
    name: "apply-grant",
    title: "Apply for a grant",
    phase: "ship",
    description:
      "Draft a Sui Foundation grant with outcome-tied milestones, real deliverables, and a sustainability plan.",
    tags: ["Funding"],
    agents: ALL,
  },
  {
    id: "create-pitch-deck",
    name: "create-pitch-deck",
    title: "Make a pitch deck",
    phase: "ship",
    description:
      "Draft a 10-slide deck for judges, investors, or grants. Grounded in real context files, not invented metrics.",
    tags: ["Pitch"],
    agents: ALL,
  },
  {
    id: "deploy-to-mainnet",
    name: "deploy-to-mainnet",
    title: "Deploy to mainnet",
    phase: "ship",
    description:
      "Publish to mainnet after testnet and the anti-slop gates pass. Locks upgrade policy intentionally.",
    tags: ["Deploy"],
    agents: ALL,
  },
  {
    id: "deploy-to-testnet",
    name: "deploy-to-testnet",
    title: "Deploy to testnet",
    phase: "ship",
    description:
      "Publish a Move package to testnet. Capture package id and upgrade cap via the canonical runbook.",
    tags: ["Deploy"],
    agents: ALL,
  },
  {
    id: "marketing-video",
    name: "marketing-video",
    title: "Marketing video plan",
    phase: "ship",
    description:
      "Plan a 30-60s product video for X, Shorts, or a launch page. Script and shot list, not vibes.",
    tags: ["Video"],
    agents: ALL,
  },
  {
    id: "pick-my-sui-track",
    name: "pick-my-sui-track",
    title: "Pick your Overflow track",
    phase: "ship",
    description:
      "Score fit against the four Sui Overflow 2026 tracks on a 0-3 depth scale. No aspirational picks.",
    tags: ["Overflow"],
    agents: ALL,
  },
  {
    id: "submit-to-sui-overflow",
    name: "submit-to-sui-overflow",
    title: "Submit to Sui Overflow",
    phase: "ship",
    description:
      "Submit on deepsurge.xyz. Captures package id, validates the 1280x1280 logo, drafts copy, runs preflight.",
    tags: ["Overflow"],
    agents: ALL,
  },
  {
    id: "video-craft",
    name: "video-craft",
    title: "Polish your video",
    phase: "ship",
    description:
      "Polish frames, pacing, captions, color, and audio for a demo cut. Structured pass per category.",
    tags: ["Video"],
    agents: ALL,
  },
];

export function skillRepoPath(skill: Skill): string {
  return `core/skills/${skill.phase}/${skill.name}`;
}
