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
        </div>
      </div>
    </footer>
  );
}
