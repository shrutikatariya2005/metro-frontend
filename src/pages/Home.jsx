import { Link } from "react-router-dom";
import MetroLineHero from "../components/MetroLineHero";

const features = [
  {
    title: "Live route search",
    desc: "Pick any two stations and see the fastest available route, stops, and travel time.",
  },
  {
    title: "Transparent fares",
    desc: "See the exact fare before you confirm — recalculated instantly as passenger count changes.",
  },
  {
    title: "One-tap booking history",
    desc: "Every past ride, ticket reference, and status in one place — no digging through emails.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-platform">
        <div className="mx-auto max-w-[1600px] px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-10 lg:pt-20 3xl:px-16">
          <div className="max-w-3xl">
            <p className="font-display text-sm font-700 uppercase tracking-wide text-amber">
              Metro Booking System
            </p>
            <h1 className="mt-3 font-display text-hero font-800 leading-[1.05] tracking-tight">
              Book your metro ride before you reach the platform.
            </h1>
            <p className="mt-5 max-w-xl text-body text-platform/75">
              Search stations, compare routes, see the real fare, and hold your
              ticket reference — all before the next train arrives.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
  to="/book"
  className="rounded-sm bg-amber px-6 py-3 text-center font-semibold text-ink transition-colors hover:bg-amber-dark"
>
  Search stations
</Link>
              <Link
                to="/register"
                className="rounded-sm border border-white/25 px-6 py-3 text-center font-semibold text-platform hover:border-white/50"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="mt-16 rounded-sm border border-white/10 bg-white/5 p-6 sm:mt-20 sm:p-8">
            <MetroLineHero />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 3xl:px-16">
        <h2 className="font-display text-h2 font-700 text-ink">
          Everything you need, before you board.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-sm border border-ink/10 bg-white p-6"
            >
              <h3 className="font-display text-h3 font-700 text-ink">{f.title}</h3>
              <p className="mt-2 text-body text-slate">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}