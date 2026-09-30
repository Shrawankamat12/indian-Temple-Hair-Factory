import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import Button from '../components/Button';
import Container from '../components/Container';
import Section from '../components/Section';
import PageTitle from '../components/PageTitle';
import { EmptyState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';
import { cx, linkU } from '../lib/ui';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <PageTitle count={`(${wishlist.length})`} sub={wishlist.length > 0 ? 'Saved pieces, ready whenever you are.' : undefined}>My Wishlist</PageTitle>

      <Section tight>
        <Container>
          {wishlist.length === 0 ? (
            <EmptyState
              icon={<FiHeart size={26} />}
              title="Your wishlist is empty"
              message="Tap the heart on any product to keep it here for later and build your dream collection."
              action={<Button to="/shop">Browse the shop</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-6 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((p) => (
                <div key={p.id} className="flex flex-col gap-3">
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                  <div className="flex items-center justify-between gap-2.5">
                    {p.hasVariants ? (
                      <Button to={`/product/${p.id}`} size="sm" className="flex-1">Select Options</Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => { addToCart(p); toggleWishlist(p); }}>Move to Cart</Button>
                    )}
                    <button type="button" className={cx(linkU, 'border-0 bg-transparent text-muted')} onClick={() => toggleWishlist(p)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
