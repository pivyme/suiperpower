import {
  IconArrowUpRight,
  IconCopy,
  IconCopyCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GITHUB_LINK, INSTALL_SNIPPET } from "~/config";

export function FinalCTA() {
  const [isCopied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;
    await navigator.clipboard.writeText(INSTALL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full px-4 md:px-12 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem]">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 12% 20%, rgba(96, 165, 250, 0.55), transparent 65%),
                radial-gradient(ellipse 90% 70% at 50% 10%, rgba(219, 234, 254, 0.35), transparent 60%),
                radial-gradient(ellipse 70% 80% at 95% 50%, rgba(21, 93, 252, 0.6), transparent 65%),
                radial-gradient(ellipse 100% 60% at 50% 100%, rgba(5, 10, 24, 0.85), transparent 70%),
                linear-gradient(135deg, #050a18 0%, #0a1c3d 50%, #050a18 100%)
              `,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

          <div className="relative px-5 md:px-16 py-16 md:py-28 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-6xl font-semibold text-white tracking-tight">
              Your agent is ready. Are you?
            </h2>
            <p className="mt-4 md:mt-5 text-white/70 font-medium text-base md:text-xl max-w-md">
              Install once. Use it on every Sui project.
            </p>

            <button
              disabled={isCopied}
              onClick={handleCopy}
              className="mt-8 md:mt-10 max-w-full bg-white/10 hover:bg-white/15 transition-colors rounded-xl border border-white/20 backdrop-blur-md py-4 md:py-5 px-4 md:px-6 flex items-center gap-3 md:gap-4 overflow-hidden"
            >
              <pre className="font-mono text-xs md:text-base text-white overflow-x-auto flex-1 text-left">
                <code>{INSTALL_SNIPPET}</code>
              </pre>
              <div className="relative flex items-center justify-center text-white">
                <IconCopy className="size-5 invisible" />
                <AnimatePresence initial={false}>
                  {isCopied ? (
                    <motion.div
                      key="copy-check"
                      initial={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                      exit={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                      className="absolute"
                    >
                      <IconCopyCheck className="size-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                      exit={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
                      className="absolute"
                    >
                      <IconCopy className="size-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`${GITHUB_LINK}/tree/main/skills`}
                className="group flex items-center gap-2 bg-white text-black hover:bg-white/90 transition-colors rounded-xl px-5 py-3 font-medium text-sm"
              >
                Browse skills on GitHub
                <IconArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
