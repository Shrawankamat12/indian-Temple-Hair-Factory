export function ProductCardSkeleton() {
  return (
    <div className="skel-card" aria-hidden="true">
      <div className="skel skel-img" />
      <div className="skel skel-line" style={{ width: '80%' }} />
      <div className="skel skel-line" style={{ width: '50%' }} />
      <div className="skel skel-line" style={{ width: '35%' }} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="skel-grid" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function LineSkeleton({ width = '100%', height = 16 }) {
  return <div className="skel skel-line" style={{ width, height }} aria-hidden="true" />;
}

export function BlockSkeleton({ height = 200 }) {
  return <div className="skel" style={{ height, width: '100%' }} aria-hidden="true" />;
}
