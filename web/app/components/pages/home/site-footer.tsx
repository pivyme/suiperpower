import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { GITHUB_LINK, TWITTER_LINK } from "~/config";

export function SiteFooter() {
  const socials = [
    {
      label: "GitHub",
      href: GITHUB_LINK,
      icon: IconBrandGithub,
    },
    {
      label: "X",
      href: TWITTER_LINK,
      icon: IconBrandX,
    },
  ];

  return (
    <footer className="w-full px-4 md:px-12 pb-10 pt-6">
      <div className="max-w-5xl mx-auto pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <p className="text-sm text-white/40 font-medium">
            © {new Date().getFullYear()} PIVY Inc. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {socials.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-colors text-neutral-500 hover:text-white"
              >
                <Icon className="size-5" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
