export default function ProjectsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-700 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="h-24 w-full bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
