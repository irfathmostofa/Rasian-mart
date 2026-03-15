// components/layout/FooterSkeleton.tsx

export default function FooterSkeleton() {
  return (
    <footer className="relative bg-linear-to-b from-gray-900 to-gray-950 pt-16 pb-8 mt-auto overflow-hidden animate-pulse">
      <div className="container mx-auto px-4">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-22 rounded-xl bg-white/8" />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* About col */}
          <div className="space-y-3">
            <div className="h-9 w-28 rounded-md bg-white/8" />
            <div className="space-y-2 pt-1">
              <div className="h-2.5 w-full rounded-full bg-white/8" />
              <div className="h-2.5 w-[90%] rounded-full bg-white/8" />
              <div className="h-2.5 w-[95%] rounded-full bg-white/8" />
              <div className="h-2.5 w-[75%] rounded-full bg-white/8" />
            </div>
          </div>

          {/* Menu col */}
          <div className="space-y-3">
            <div className="h-4 w-24 rounded-full bg-white/8 mb-2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded-full bg-white/8"
                style={{ width: `${55 + (i % 3) * 10}%` }}
              />
            ))}
          </div>

          {/* Contact col */}
          <div className="space-y-3">
            <div className="h-4 w-20 rounded-full bg-white/8 mb-2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/8 shrink-0" />
                <div className="h-3 flex-1 rounded-full bg-white/8" />
              </div>
            ))}
          </div>

          {/* Newsletter col */}
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-white/8 mb-2" />
            <div className="h-11 w-full rounded-xl bg-white/8" />
            <div className="h-11 w-full rounded-xl bg-white/8" />
            <div className="h-2.5 w-[65%] rounded-full bg-white/8 mx-auto" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="h-3 w-52 rounded-full bg-white/8" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-12 rounded-lg bg-white/8" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
