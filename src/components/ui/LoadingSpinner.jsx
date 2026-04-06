export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200" />
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-2.5 bg-gray-50 rounded w-1/2 mb-2" />
      <div className="h-2.5 bg-gray-50 rounded w-1/3" />
    </div>
  );
}
