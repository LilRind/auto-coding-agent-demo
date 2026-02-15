export default function ProjectDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div className="h-8 w-3/4 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse" />
        <div className="bg-gray-900 rounded p-4 space-y-2">
          <div className="h-3 w-full bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-600 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-1/4 bg-gray-600 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-600 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
