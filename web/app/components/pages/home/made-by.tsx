export function MadeBy() {
  const people = [
    {
      name: "Kelvin Adithya",
      role: "Founder",
      link: "https://klvn.dev",
    },
    {
      name: "Febi Mettasari",
      role: "Founder",
      link: "https://www.instagram.com/febimettasari",
    },
    {
      name: "Louis Arvin",
      role: "Infra",
      link: "https://www.linkedin.com/in/louis-arvin-8a8488268",
    },
    {
      name: "Tengku Farhan",
      role: "Website",
      link: "https://hanebox.github.io",
    },
  ];

  return (
    <section className="w-full px-4 md:px-12 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <p className="font-medium text-white/40 shrink-0">The team</p>
        <div className="flex flex-wrap gap-2">
          {people.map((p) => (
            <a
              key={p.name}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-full px-3 py-1.5 text-sm flex items-center gap-2"
            >
              <span className="text-white">{p.name}</span>
              <span className="text-white/40">{p.role}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
