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
      <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm md:text-base font-medium text-white/40">
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
                src="/assets/pivy-logo.svg"
                alt="PIVY"
                className="h-10 md:h-14 w-auto object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-0.5"
              />
            </a>
            <p className="text-white/40 font-medium text-base md:text-lg max-w-xl">
              The team behind PIVY built Suiperpower to pass the same bar
              back to every Sui builder.
            </p>
          </div>

          <a
            href="https://blog.sui.io/2025-sui-overflow-hackathon-winners/"
            target="_blank"
            rel="noopener noreferrer"
            className="group self-start md:self-end inline-flex flex-col bg-[#f3ede0] border-2 border-[#0b1430] min-w-[260px] shadow-[5px_5px_0_0_#FFE44D] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all"
          >
            <span
              className="relative flex items-center px-4 py-3 border-b-2 border-[#0b1430]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #0b1430 1px, transparent 1px), linear-gradient(to bottom, #0b1430 1px, transparent 1px)",
                backgroundSize: "8px 8px",
              }}
            >
              <span className="inline-flex items-center gap-1 bg-[#FFE44D] border-2 border-[#0b1430] px-2 py-0.5 font-mono text-xs font-bold text-[#0b1430]">
                <span className="text-[#0b1430]/50">#</span>
                1st place
                <span className="text-[#0b1430]/50">{"}"}</span>
              </span>
            </span>
            <span className="flex flex-col gap-1 px-5 py-4">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#0b1430]/55">
                Sui Overflow 2025
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm md:text-base font-bold text-[#0b1430]">
                Payment &amp; Wallets Track
                <IconArrowUpRight className="size-4 text-[#0b1430] transition-colors" />
              </span>
            </span>
          </a>
        </div>

        <div className="h-px w-full bg-white/5" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <p className="font-medium text-white/40 shrink-0 text-sm md:text-base">
            The Team
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
                      ? "bg-blue-500/10 hover:bg-blue-500/15"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`relative size-9 md:size-10 rounded-full overflow-hidden shrink-0 ${
                      isLead
                        ? "bg-gradient-to-br from-blue-500/30 to-blue-300/10"
                        : "bg-gradient-to-br from-white/15 to-white/5"
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
    </section>
  );
}
