const SessionCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="space-y-3 mt-6">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex justify-between mt-6">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

export default SessionCardSkeleton;