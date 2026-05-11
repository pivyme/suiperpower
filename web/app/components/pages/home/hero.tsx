import { IconCopy, IconCopyCheck } from "@tabler/icons-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GrainGradient } from "@paper-design/shaders-react";
import { GITHUB_LINK, INSTALL_SNIPPET } from "~/config";

export function Hero() {
  const [isCopied, setCopied] = useState(false);

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
        className="absolute inset-0 opacity-90"
      />
      <div className="flex flex-col items-start relative w-full max-w-5xl">
        <video
          autoPlay
          muted
          playsInline
          loop
          className="size-20 md:size-24 object-contain bg-red-400"
        >
          <source src="/assets/video-logo.mp4" type="video/mp4" />
        </video>

        <h1 className="text-4xl md:text-5xl font-semibold text-white mt-8 md:mt-10">
          Suiperpower
        </h1>
        <p className="text-white/50 font-medium text-xl md:text-3xl mt-4 md:mt-5">
          Build everthing on SUI as easy as prompt
        </p>

        <div className="mt-10 md:mt-12 w-full max-w-2xl flex flex-col gap-3 md:gap-4">
          <div className="contents md:flex md:items-center md:justify-between md:gap-3">
            <div className="font-medium bg-white rounded-xl text-black px-5 py-2 self-start text-sm md:text-base md:px-6">
              Install
            </div>
            <div className="flex items-center order-3 md:order-none">
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
              <p className="font-medium text-white/50 text-sm md:text-base">
                50+ skills, CLIs and MCPs to use
              </p>
            </div>
          </div>

          <button
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
          </button>
        </div>
      </div>
      <a
        href={GITHUB_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="fixed top-6 right-4 md:top-10 md:right-10 opacity-50 hover:opacity-80"
      >
        <img
          src="/assets/github-dark.svg"
          alt=""
          className="size-6 object-contain"
        />
      </a>
    </div>
  );
}
