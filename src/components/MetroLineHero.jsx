const stops = [
  { label: "Search", desc: "Find your stations" },
  { label: "Select", desc: "Pick a route" },
  { label: "Book", desc: "Confirm your ticket" },
  { label: "Ride", desc: "Show your reference" },
];

export default function MetroLineHero() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[560px] items-start justify-between px-2 sm:min-w-0">
        {stops.map((stop, i) => (
          <div key={stop.label} className="relative flex flex-1 flex-col items-center text-center">
            {/* Line connecting stops */}
            {i > 0 && (
              <div className="absolute left-[-50%] top-[13px] h-[3px] w-full bg-white/25 sm:top-[15px]" />
            )}
            <div className="z-10 grid h-7 w-7 place-items-center rounded-full border-2 border-amber bg-ink sm:h-8 sm:w-8">
              <span className="h-2.5 w-2.5 rounded-full bg-amber" />
            </div>
            <p className="mt-3 font-display text-sm font-700 text-platform sm:text-base">
              {stop.label}
            </p>
            <p className="mt-1 text-xs text-platform/60 sm:text-sm">{stop.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}