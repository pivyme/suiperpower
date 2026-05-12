import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconCheck, IconTerminal2, IconX } from "@tabler/icons-react";
import { INSTALL_SNIPPET } from "~/config";

type Step = {
  index: number;
  title: string;
  description: string;
  visual: () => React.ReactNode;
};

const STEPS: Step[] = [
  {
    index: 1,
    title: "Install",
    description:
      "One curl command. Adds 60+ Sui skills, knowledge, and the CLI to your agent.",
    visual: InstallVisual,
  },
  {
    index: 2,
    title: "Open your agent",
    description:
      "Claude Code, Codex, or Cursor. Skills auto-load and stay out of the way.",
    visual: AgentsVisual,
  },
  {
    index: 3,
    title: "Tell it what to build",
    description:
      "Prompt like you would a senior friend. The right skills load on demand.",
    visual: PromptVisual,
  },
  {
    index: 4,
    title: "Ship something real",
    description:
      "Anti-slop gates keep it production-grade.",
    visual: ShipVisual,
  },
];

const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 } as const;

export function HowToUseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const goTo = (target: number) => setStep(target);
  const goNext = () =>
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, step]);

  const isLast = step === STEPS.length - 1;

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[]>(() =>
    STEPS.map(() => 0),
  );
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    const measure = () => {
      setHeights(
        stepRefs.current.map((el) => el?.getBoundingClientRect().height ?? 0),
      );
    };
    measure();
    setReady(true);
    const observers = stepRefs.current.map((el) => {
      if (!el) return null;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return ro;
    });
    return () => {
      observers.forEach((ro) => ro?.disconnect());
    };
  }, [open]);

  const targetHeight = heights[step] ?? 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={SPRING}
            className="relative w-full max-w-xl bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-white/5"
          >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
        >
          <IconX className="size-4" />
        </button>

        <div className="px-7 pt-12" />

        <motion.div
          key={ready ? "ready" : "init"}
          initial={false}
          animate={ready ? { height: targetHeight } : undefined}
          transition={SPRING}
          className="relative overflow-hidden"
          style={!ready ? { height: "auto" } : undefined}
        >
          {STEPS.map((s, i) => {
            const offset = i - step;
            return (
              <motion.div
                key={s.index}
                initial={false}
                animate={{
                  x: `${offset * 100}%`,
                  opacity: offset === 0 ? 1 : 0,
                }}
                transition={ready ? SPRING : { duration: 0 }}
                className="absolute inset-x-0 top-0"
                style={{ pointerEvents: offset === 0 ? "auto" : "none" }}
              >
                <div
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="flex flex-col gap-5 px-7 pb-8"
                >
                  <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-none">
                    {s.title}
                  </h3>

                  <p className="text-base md:text-lg text-white/65 font-medium leading-relaxed">
                    {s.description}
                  </p>

                  <div className="pt-1">
                    <s.visual />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="px-7 py-3 flex items-center justify-between gap-3 border-t border-white/5">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="text-sm font-medium text-white/55 hover:text-white disabled:text-white/15 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <motion.button
                key={s.index}
                onClick={() => goTo(i)}
                aria-label={`Step ${s.index}`}
                animate={{ width: i === step ? 24 : 6 }}
                transition={ready ? SPRING : { duration: 0 }}
                className={`h-1.5 rounded-full transition-colors ${
                  i === step
                    ? "bg-white"
                    : i < step
                    ? "bg-white/40"
                    : "bg-white/15"
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              className="bg-white text-black hover:bg-white/90 transition-colors rounded-lg px-4 py-2 text-sm font-medium"
            >
              Got it
            </button>
          ) : (
            <button
              onClick={goNext}
              className="bg-white text-black hover:bg-white/90 transition-colors rounded-lg px-4 py-2 text-sm font-medium"
            >
              Next
            </button>
          )}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InstallVisual() {
  return (
    <div className="bg-white/[0.04] rounded-lg px-4 py-3 flex items-center gap-2.5 overflow-hidden">
      <IconTerminal2 className="size-4 text-blue-300/70 shrink-0" />
      <pre className="font-mono text-sm text-white overflow-x-auto flex-1">
        <code>{INSTALL_SNIPPET}</code>
      </pre>
    </div>
  );
}

function AgentsVisual() {
  const agents = [
    { src: "/assets/claude.webp", label: "Claude Code" },
    { src: "/assets/codex.webp", label: "Codex" },
    { src: "/assets/cursor.webp", label: "Cursor" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {agents.map((a) => (
        <div
          key={a.label}
          className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-2"
        >
          <img
            src={a.src}
            alt=""
            className="size-5 rounded-full object-contain"
          />
          <span className="text-sm font-medium text-white">{a.label}</span>
        </div>
      ))}
    </div>
  );
}

const PROMPT = "build a prediction market on Sui";
const PROMPT_SKILLS = [
  "/suiper:clarify-intent",
  "/suiper:scaffold-project",
  "/suiper:build-with-move",
];

function PromptVisual() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(PROMPT.slice(0, i));
      if (i >= PROMPT.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white/[0.04] rounded-lg px-4 py-3 flex flex-col gap-2 font-mono text-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-blue-300/70">{">"}</span>
        <span className="text-white">
          {typed}
          <span className="inline-block w-1 h-3.5 align-[-1px] bg-white/70 ml-0.5 animate-pulse" />
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {PROMPT_SKILLS.map((s) => (
          <div key={s} className="flex items-baseline gap-1.5">
            <span className="text-white/30">⎿</span>
            <span className="text-blue-200/90">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShipVisual() {
  const gates = [
    "Move builds clean",
    "Capabilities held by the right owner",
    "Sponsor integration verified, not bolted on",
  ];
  return (
    <div className="flex flex-col gap-2">
      {gates.map((g) => (
        <div
          key={g}
          className="flex items-center gap-2.5 bg-white/[0.04] rounded-lg px-3.5 py-3.5"
        >
          <span className="size-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <IconCheck className="size-3 text-blue-300" />
          </span>
          <span className="text-sm text-white/80 font-medium">{g}</span>
        </div>
      ))}
    </div>
  );
}
