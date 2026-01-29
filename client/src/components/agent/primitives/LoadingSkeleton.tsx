import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'stat';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

interface SkeletonBaseProps {
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonBase({ className, style }: SkeletonBaseProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

export function LoadingSkeleton({
  variant = 'rectangular',
  width,
  height,
  className,
  count = 1,
}: LoadingSkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <SkeletonBase
            className={cn("h-4 rounded", className)}
            style={style}
          />
        );

      case 'circular':
        return (
          <SkeletonBase
            className={cn("rounded-full", className)}
            style={{ ...style, width: style.width || '40px', height: style.height || '40px' }}
          />
        );

      case 'avatar':
        return (
          <div className="flex items-center gap-3">
            <SkeletonBase className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <SkeletonBase className="h-4 w-24 rounded" />
              <SkeletonBase className="h-3 w-16 rounded" />
            </div>
          </div>
        );

      case 'stat':
        return (
          <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <SkeletonBase className="h-3 w-16 rounded" />
                <SkeletonBase className="h-7 w-24 rounded" />
              </div>
              <SkeletonBase className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <SkeletonBase className="w-10 h-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <SkeletonBase className="h-4 w-3/4 rounded" />
                <SkeletonBase className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <SkeletonBase className="h-20 w-full rounded-lg" />
            <div className="flex gap-2">
              <SkeletonBase className="h-8 w-20 rounded-lg" />
              <SkeletonBase className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        );

      case 'rectangular':
      default:
        return (
          <SkeletonBase
            className={cn("rounded-lg", className)}
            style={{ ...style, width: style.width || '100%', height: style.height || '100px' }}
          />
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

// Shimmer animation keyframes (add to global CSS or use inline)
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }

export default LoadingSkeleton;
