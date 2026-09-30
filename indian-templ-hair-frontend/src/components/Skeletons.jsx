import { cx } from '../lib/ui';

const shimmer = 'animate-shimmer rounded-sm bg-[linear-gradient(100deg,#f3eadd_30%,#fbf6ec_50%,#f3eadd_70%)] bg-[length:200%_100%]';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className={cx(shimmer, 'aspect-[4/5] w-full')} />
      <div className={cx(shimmer, 'h-3.5 w-4/5')} />
      <div className={cx(shimmer, 'h-3.5 w-1/2')} />
      <div className={cx(shimmer, 'h-3.5 w-[35%]')} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-x-5 gap-y-7" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function LineSkeleton({ width = '100%', height = 16 }) {
  return <div className={shimmer} style={{ width, height }} aria-hidden="true" />;
}

export function BlockSkeleton({ height = 200 }) {
  return <div className={shimmer} style={{ height, width: '100%' }} aria-hidden="true" />;
}
