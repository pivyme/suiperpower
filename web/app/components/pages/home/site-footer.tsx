import { IconBrandGithub } from "@tabler/icons-react";
import { GITHUB_LINK } from "~/config";

export function SiteFooter() {
  return (
    <footer className="w-full px-4 md:px-12 pb-10 pt-6">
      <div className="max-w-5xl mx-auto pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <p className="text-sm text-white/40 font-medium">
            © {new Date().getFullYear()} PIVY Inc. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <a
            href={GITHUB_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors text-neutral-500 hover:text-white"
          >
            <IconBrandGithub className="size-5" />
          </a>
          <span className="h-5 w-px bg-white/10" aria-hidden />
          <a
            href="https://pivy.me"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="by PIVY"
            className="group inline-flex items-center gap-3"
          >
            <span className="text-base text-white/50 font-medium group-hover:text-white/70 transition-colors">
              by
            </span>
            <img
              src="/assets/pivy-horizontal.png"
              alt="PIVY"
              className="h-8 md:h-9 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
