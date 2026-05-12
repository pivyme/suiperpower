import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CliBox({
  command,
  ariaLabel = "Copy command",
}: {
  command: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const preRef = useRef<HTMLPreElement>(null);

  function updateEdges() {
    const el = preRef.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [command]);

  async function copy() {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked, silent
    }
  }

  const maskImage = (() => {
    const fade = "24px";
    if (edges.left && edges.right) {
      return `linear-gradient(to right, transparent 0, black ${fade}, black calc(100% - ${fade}), transparent 100%)`;
    }
    if (edges.left) {
      return `linear-gradient(to right, transparent 0, black ${fade})`;
    }
    if (edges.right) {
      return `linear-gradient(to right, black calc(100% - ${fade}), transparent 100%)`;
    }
    return undefined;
  })();

  return (
    <button
      onClick={copy}
      disabled={copied}
      className="w-full bg-white/5 rounded-xl border border-white/10 backdrop-blur-md py-4 md:py-5 px-4 md:px-6 flex items-center gap-3 md:gap-4 overflow-hidden text-left"
      aria-label={ariaLabel}
    >
      <pre
        ref={preRef}
        onScroll={updateEdges}
        className="font-mono text-xs md:text-base overflow-x-auto flex-1 min-w-0 text-white"
        style={
          maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined
        }
      >
        <code>{command}</code>
      </pre>
      <div className="relative flex items-center justify-center text-white">
        <IconCopy className="size-5 invisible" />
        <AnimatePresence initial={false}>
          {copied ? (
            <motion.div
              key="copy-check"
              initial={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.6, opacity: 0, filter: "blur(4px)" }}
              className="absolute"
            >
              <IconCheck className="size-5" />
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
  );
}
