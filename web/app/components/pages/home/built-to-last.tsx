export function BuiltToLast() {
  return (
    <section className="w-full px-4 md:px-12 py-16 md:py-24 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col gap-8 md:gap-10">
        <div>
          <h2 className="text-3xl md:text-5xl font-semibold">Built to last</h2>
          <p className="mt-4 md:mt-5 text-white/60 font-medium text-lg md:text-2xl max-w-4xl">
            Suiperpower is built around a different bar. Build skills run a
            checklist before they call themselves done. Ship skills refuse to
            fake telemetry, fake users, or fake code coverage. The bar is in the
            markdown, public, auditable.
          </p>
        </div>
        <div className="bg-blue-500/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <blockquote className="text-lg md:text-2xl text-blue-50 leading-relaxed font-medium">
            Most Sui hackathon submissions are built for the hackathon, not to
            actually become a product. That always bothered me. So I poured my
            product thinking into Suiperpower, so the agent acts like a
            brutally honest senior engineer that won't sugarcoat anything.
            This is my giveback to the Sui community. If it raises the bar of
            what gets shipped on Sui, that is the win.
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <span className="relative size-10 md:size-11 rounded-full overflow-hidden shrink-0 border border-blue-400/30 bg-gradient-to-br from-blue-500/30 to-blue-300/10">
              <img
                src="/team/photo-kelvin.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm md:text-base text-blue-200/70 font-medium">
                Kelvin Adithya, co-founder of{" "}
                <a
                  href="https://pivy.me"
                  className="underline text-blue-100 hover:text-white"
                >
                  PIVY
                </a>
              </p>
              <p className="text-xs md:text-sm text-blue-200/40 font-medium">
                ps. mysten labs (or any serious team on Sui), open to
                engineer full time. hire me?
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
