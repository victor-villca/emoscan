const ParticipantReportSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
    <div className="h-8 w-1/3 bg-gray-200 rounded mb-2"></div>
    <div className="h-6 w-1/2 bg-gray-200 rounded mb-8"></div>
    <div className="bg-white rounded shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="aspect-square rounded-lg bg-gray-200"></div>
          <div className="mt-4 h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
          <div className="bg-gray-200 rounded-lg h-24"></div>
          <div className="bg-gray-200 rounded-lg h-24"></div>
          <div className="bg-gray-200 rounded-lg h-24"></div>
          <div className="bg-gray-200 rounded-lg h-24"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded shadow-sm p-6 h-96"></div>
      <div className="bg-white rounded shadow-sm p-6 h-96"></div>
    </div>
  </div>
);

export default ParticipantReportSkeleton;
