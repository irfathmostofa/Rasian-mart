// components/layout/LoadingSection.tsx
export default function LoadingSection() {
  return (
    <div className="space-y-10 py-4 animate-pulse">
      {/* Section title skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded-full bg-gray-200" />
        <div className="h-8 w-64 rounded-md bg-gray-200" />
      </div>

      {/* Product card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square w-full rounded-lg bg-gray-200" />
            <div className="h-4 w-3/4 rounded-full bg-gray-200" />
            <div className="h-4 w-1/2 rounded-full bg-gray-200" />
            <div className="h-8 w-full rounded-md bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Second section */}
      <div className="space-y-3 pt-4">
        <div className="h-5 w-32 rounded-full bg-gray-200" />
        <div className="h-8 w-56 rounded-md bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square w-full rounded-lg bg-gray-200" />
            <div className="h-4 w-3/4 rounded-full bg-gray-200" />
            <div className="h-4 w-1/2 rounded-full bg-gray-200" />
            <div className="h-8 w-full rounded-md bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
