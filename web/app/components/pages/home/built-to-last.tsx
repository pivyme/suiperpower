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
            Most Sui projects stop the day they ship. They were built to hit a
            milestone, not to earn users. I built Suiperpower because that is
            the trap I want the next batch of builders to skip. Build a Sui
            product that earns real users, real traction, and eventually, real
            revenue.
          </blockquote>
          <p className="mt-6 text-sm md:text-base text-blue-200/70 font-medium">
            Kelvin Adithya, co-founder of{" "}
            <a
              href="https://pivy.me"
              className="underline text-blue-100 hover:text-white"
            >
              PIVY
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
