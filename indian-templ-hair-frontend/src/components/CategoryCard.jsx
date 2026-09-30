import { Link } from 'react-router-dom';
import { imageOr } from '../lib/media';
import { cx } from '../lib/ui';

/**
 * Category tile linking to the shop pre-filtered by category slug.
 * shape="round"  → circular photo with a white ring (Home "Shop by Category")
 * shape="square" → framed landscape tile (mega menu)
 * Falls back to a bundled photo (`fallback`) then a neutral tile when the admin has not uploaded an image.
 */
export default function CategoryCard({ category, fallback = null, shape = 'square', className = '' }) {
  const img = imageOr(category.image, fallback);
  const round = shape === 'round';
  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cx(
        'group block text-center',
        !round && 'rounded-xl border border-line bg-white p-2 transition duration-200 ease-soft hover:-translate-y-[3px] hover:border-brand hover:shadow-[0_14px_26px_-16px_rgb(30_20_16/0.45)]',
        className,
      )}
    >
      <span
        className={cx(
          'relative block overflow-hidden bg-sand transition duration-300',
          round
            ? 'aspect-square rounded-full border-[3px] border-white shadow-[0_0_0_1px_var(--color-line),0_14px_26px_-18px_rgb(30_20_16/0.5)] group-hover:shadow-[0_0_0_1px_var(--color-brand),0_14px_26px_-14px_rgb(30_20_16/0.5)]'
            : 'aspect-[4/3] rounded-lg',
        )}
      >
        {img
          ? <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.06]" />
          : <span className="absolute inset-0 flex items-center justify-center font-display text-4xl text-walnut">{category.name.charAt(0)}</span>}
      </span>
      <span className={cx('block font-semibold text-espresso transition-colors group-hover:text-brand', round ? 'mt-3.5 text-[0.95rem]' : 'mb-1 mt-2.5 text-[0.93rem]')}>
        {category.name}
      </span>
    </Link>
  );
}
