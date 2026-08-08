// src/components/common/SkeletonLoader.jsx
const SkeletonBox = ({ className = '' }) => <div className={`skeleton ${className}`} />;

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 border border-dark-50">
      <SkeletonBox className="h-36 w-full rounded-xl mb-3" />
      <SkeletonBox className="h-4 w-3/4 mb-2" />
      <SkeletonBox className="h-3 w-1/2 mb-3" />
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-16" />
        <SkeletonBox className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <SkeletonBox className="h-16 w-16 rounded-2xl" />
      <SkeletonBox className="h-3 w-14" />
    </div>
  );
}

export function OrderCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex justify-between mb-3">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-4 w-16" />
          </div>
          <SkeletonBox className="h-3 w-3/4 mb-4" />
          <div className="flex gap-2">
            <SkeletonBox className="h-8 w-28 rounded-lg" />
            <SkeletonBox className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BannerSkeleton() {
  return <SkeletonBox className="h-44 w-full rounded-2xl" />;
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export default SkeletonBox;
