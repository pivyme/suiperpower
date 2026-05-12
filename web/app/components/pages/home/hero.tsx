import { IconCopy, IconCopyCheck, IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GrainGradient } from "@paper-design/shaders-react";
import { GITHUB_LINK, INSTALL_SNIPPET } from "~/config";
import { HowToUseModal } from "./how-to-use-modal";

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease: "easeOut" as const },
});

export function Hero() {
  const [isCopied, setCopied] = useState(false);
  const [isHowToOpen, setHowToOpen] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;
    await navigator.clipboard.writeText(INSTALL_SNIPPET);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="relative w-full min-h-screen px-4 md:px-12 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <GrainGradient
          width="100%"
          height="100%"
          colors={["#155dfc", "#bedbff"]}
          colorBack="#000000"
          softness={0.5}
          intensity={0.1}
          noise={0.07}
          shape="wave"
          speed={0.2}
          scale={1.5}
          offsetY={0.3}
          offsetX={1}
          className="w-full h-full"
        />
      </motion.div>
      <div className="flex flex-col items-start relative w-full max-w-5xl">
        <motion.video
          {...fadeIn(0.1)}
          autoPlay
          muted
          playsInline
          loop
          className="size-20 md:size-24 object-contain"
        >
          <source src="/assets/video-logo.mp4" type="video/mp4" />
        </motion.video>

        <motion.h1
          {...fadeIn(0.2)}
          className="text-4xl md:text-5xl font-semibold text-white mt-8 md:mt-10"
        >
          Suiperpower
        </motion.h1>
        <motion.p
          {...fadeIn(0.3)}
          className="text-white/50 font-medium text-xl md:text-3xl mt-4 md:mt-5"
        >
          Build something meaningful, on Sui
        </motion.p>

        <div className="mt-10 md:mt-12 w-full max-w-2xl flex flex-col gap-3 md:gap-4">
          <motion.div
            {...fadeIn(0.4)}
            className="font-medium bg-white rounded-xl text-black px-5 py-2 self-start text-sm md:text-base md:px-6"
          >
            Install
          </motion.div>

          <motion.button
            {...fadeIn(0.5)}
            disabled={isCopied}
            onClick={handleCopy}
            className="order-2 md:order-none w-full bg-white/5 rounded-xl border border-white/10 backdrop-blur-md py-4 md:py-5 px-4 md:px-6 flex items-center gap-3 md:gap-4 overflow-hidden"
          >
            <pre className="font-mono text-xs md:text-base overflow-x-auto flex-1 text-left">
              <code>{INSTALL_SNIPPET}</code>
            </pre>
            <div className="relative flex items-center justify-center">
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
          </motion.button>

          <motion.div
            {...fadeIn(0.6)}
            className="order-4 md:order-none flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-5"
          >
            <div className="flex flex-wrap items-center gap-5">
              <button
                onClick={() => setHowToOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl px-2.5 py-2 text-white/80 hover:text-white transition-colors font-medium text-sm"
              >
                <IconPlayerPlay className="size-4" />
                How to use
              </button>
            </div>

            <div className="flex items-center">
              <div className="flex items-center gap-2 translate-x-2">
                <img
                  alt=""
                  src="/assets/claude.webp"
                  className="object-contain size-5 rounded-full"
                />
                <img
                  alt=""
                  src="/assets/cursor.webp"
                  className="object-contain size-5 rounded-full -translate-x-1/2"
                />
                <img
                  alt=""
                  src="/assets/codex.webp"
                  className="object-contain size-5 rounded-full -translate-x-full"
                />
              </div>
              <p className="font-medium text-white/50 text-sm">
                100+ skills, CLIs and MCPs to use
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.a
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        href={GITHUB_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="group absolute top-6 right-4 md:top-10 md:right-10"
      >
        <div className="flex items-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity duration-200">
          <img
            src="/assets/github-dark.svg"
            alt=""
            className="size-5 object-contain"
          />
          <span className="text-white font-medium text-sm">pivyme/suiperpower</span>
        </div>
      </motion.a>

      <HowToUseModal open={isHowToOpen} onClose={() => setHowToOpen(false)} />
    </div>
  );
}
