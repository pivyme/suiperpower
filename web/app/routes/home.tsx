import { BuiltToLast } from "~/components/pages/home/built-to-last";
import { FinalCTA } from "~/components/pages/home/final-cta";
import { Hero } from "~/components/pages/home/hero";
import { Journey } from "~/components/pages/home/journey";
import { MadeBy } from "~/components/pages/home/made-by";
import { Playground } from "~/components/pages/home/playground";
import { SiteFooter } from "~/components/pages/home/site-footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <Playground />
      <Journey />
      <BuiltToLast />
      <FinalCTA />
      <MadeBy />
      <SiteFooter />
    </div>
  );
}
