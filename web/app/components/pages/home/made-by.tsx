import { IconArrowUpRight } from "@tabler/icons-react";

export function MadeBy() {
  const people = [
    {
      name: "Kelvin Adithya",
      role: "Creator",
      link: "https://klvn.dev",
      photo: "/team/photo-kelvin.png",
    },
    {
      name: "Febi Mettasari",
      role: null,
      link: "https://www.instagram.com/febimettasari",
      photo: "/team/photo-febi.png",
    },
    {
      name: "Louis Arvin",
      role: null,
      link: "https://www.linkedin.com/in/louis-arvin-8a8488268",
      photo: "/team/photo-louis.png",
    },
    {
      name: "Tengku Farhan",
      role: "Site",
      link: "https://hanebox.github.io",
      photo: "/team/photo-farhan.png",
    },
  ];

  return (
    <section className="w-full px-4 md:px-12 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] border border-white/10 bg-white/[0.02]">
          <div
            className="absolute inset-0 opacity-80 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 70% 60% at 0% 0%, rgba(21, 93, 252, 0.18), transparent 60%),
                radial-gradient(ellipse 60% 70% at 100% 100%, rgba(96, 165, 250, 0.12), transparent 65%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative px-6 md:px-12 py-10 md:py-14 flex flex-col gap-10 md:gap-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm md:text-base font-medium text-white/40 tracking-wide uppercase">
                  Brought to you by
                </p>
                <a
                  href="https://pivy.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="PIVY"
                  className="group inline-flex items-center gap-3 self-start"
                >
                  <img
                    src="/assets/pivy-horizontal.png"
                    alt="PIVY"
                    className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                  <IconArrowUpRight className="size-5 md:size-6 text-white/30 group-hover:text-white transition-colors" />
                </a>
                <p className="text-white/60 font-medium text-base md:text-lg max-w-xl">
                  The team behind PIVY built Suiperpower to pass the same bar
                  back to every Sui builder.
                </p>
              </div>

              <a
                href="https://blog.sui.io/2025-sui-overflow-hackathon-winners/"
                target="_blank"
                rel="noopener noreferrer"
                className="group self-start md:self-end inline-flex flex-col gap-1.5 border-l border-white/10 pl-5 md:pl-6"
              >
                <span className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-blue-300/80">
                  1st place, Sui Overflow 2025
                </span>
                <span className="inline-flex items-center gap-1.5 text-base md:text-lg font-medium text-white">
                  Payment &amp; Wallets Track
                  <IconArrowUpRight className="size-4 text-white/40 group-hover:text-white transition-colors" />
                </span>
              </a>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <p className="font-medium text-white/40 shrink-0 text-sm md:text-base">
                The team
              </p>
              <div className="flex flex-wrap gap-2">
                {people.map((p, i) => {
                  const isLead = i === 0;
                  return (
                    <a
                      key={p.name}
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group transition-colors rounded-full pl-1.5 pr-4 py-1.5 text-base flex items-center gap-2.5 ${
                        isLead
                          ? "bg-blue-500/10 hover:bg-blue-500/15 ring-1 ring-inset ring-blue-400/30"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`relative size-9 md:size-10 rounded-full overflow-hidden shrink-0 border ${
                          isLead
                            ? "border-blue-400/40 bg-gradient-to-br from-blue-500/30 to-blue-300/10"
                            : "border-white/10 bg-gradient-to-br from-white/15 to-white/5"
                        }`}
                      >
                        <img
                          src={p.photo}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.visibility =
                              "hidden";
                          }}
                        />
                      </span>
                      <span className="text-white">{p.name}</span>
                      {p.role && (
                        <span
                          className={isLead ? "text-blue-200/70" : "text-white/40"}
                        >
                          {p.role}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
