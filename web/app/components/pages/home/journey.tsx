type Phase = {
  label: string;
  description: string;
  triggers: string[];
  pixels: number[][];
};

// 12x12 abstract pixel graphics. 1 = filled, 0 = empty.
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

const PIXEL_EARN = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
  [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
];

const PHASES: Phase[] = [
  {
    label: "Learn",
    description: "Get oriented on Sui without a 50-tab research session.",
    triggers: [
      '"I\'m new to Sui, teach me"',
      "\"I'm coming from Solana, what's different\"",
    ],
    pixels: PIXEL_LEARN,
  },
  {
    label: "Idea",
    description:
      "Pressure-test what you want to build before writing a line of code.",
    triggers: ['"what should I build on Sui"', '"stress-test this idea"'],
    pixels: PIXEL_IDEA,
  },
  {
    label: "Build",
    description:
      "Scaffold, integrate, iterate, with Sui knowledge your agent can read.",
    triggers: [
      '"scaffold my project"',
      '"build a Move module"',
      '"integrate Walrus"',
    ],
    pixels: PIXEL_BUILD,
  },
  {
    label: "Ship",
    description:
      "Get to mainnet without skipping the gates that catch real bugs.",
    triggers: ['"deploy to mainnet"', '"prep for audit"'],
    pixels: PIXEL_SHIP,
  },
  {
    label: "Grow",
    description: "Earn first users, not just a launch tweet.",
    triggers: ['"set up analytics"', '"launch in community"'],
    pixels: PIXEL_GROW,
  },
  {
    label: "Earn",
    description: "Turn real users into real revenue. Not vanity metrics.",
    triggers: ['"add a paywall"', '"price this product"'],
    pixels: PIXEL_EARN,
  },
];

export function Journey() {
  return (
    <section className="w-full px-4 md:px-12 py-16 md:py-24 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        <h2 className="text-3xl md:text-5xl font-semibold">The Journey</h2>
        <p className="mt-4 md:mt-5 text-white/50 font-medium text-lg md:text-2xl max-w-2xl">
          Six phases. Skills hand off through the filesystem so your agent never
          loses context between them.
        </p>

        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-10 md:gap-y-16">
          {PHASES.map((phase, i) => (
            <JourneyCard key={phase.label} phase={phase} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ phase, index }: { phase: Phase; index: number }) {
  return (
    <div className="flex flex-col">
      <p className="text-3xl md:text-4xl font-semibold text-blue-400/80 leading-none">
        {String(index + 1).padStart(2, "0")}
      </p>

      <PixelGraphic
        pixels={phase.pixels}
        className="mt-6 md:mt-8 size-20 md:size-28"
      />

      <h3 className="mt-6 md:mt-8 text-xl md:text-2xl font-semibold text-white">
        {phase.label}
      </h3>

      <p className="mt-2 md:mt-3 text-sm md:text-base text-white/50 font-medium">
        {phase.description}
      </p>
    </div>
  );
}

function PixelGraphic({
  pixels,
  className,
}: {
  pixels: number[][];
  className?: string;
}) {
  const size = pixels.length;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={`text-blue-400/90 ${className ?? "size-32"}`}
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
