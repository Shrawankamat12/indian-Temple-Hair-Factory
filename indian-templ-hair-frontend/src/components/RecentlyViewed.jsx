import ProductCarousel from './ProductCarousel';
import Container from './Container';

/**
 * "Recently viewed" shelf: a small, secondary strip. Same card style as the rest of the site,
 * but compact (image, name, price) and six-across on desktop. Renders nothing when empty.
 */
export default function RecentlyViewed({ items, title = 'Recently Viewed' }) {
  if (!items || items.length === 0) return null;

  // Saved items can be partial. Missing `hasVariants` is treated as true so nothing incomplete is ever
  // added to the cart from here; the card just opens the product page.
  const products = items.slice(0, 10).map((p) => ({ ...p, hasVariants: p.hasVariants ?? true }));

  return (
    <section className="border-t border-line bg-white py-8 sm:py-10" aria-label={title}>
      <Container>
        <h2 className="mb-4 text-[clamp(1.25rem,2vw,1.5rem)] text-espresso">{title}</h2>
        <ProductCarousel products={products} size="sm" label={title} />
      </Container>
    </section>
  );
}