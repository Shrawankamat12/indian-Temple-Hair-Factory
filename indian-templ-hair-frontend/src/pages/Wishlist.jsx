import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import Button from '../components/Button';
import { EmptyState } from '../components/StateBlocks';
import { useStore } from '../context/StoreContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <>
      <div className="container page-title-row">
        <h1 className="page-title">My Wishlist <small>({wishlist.length})</small></h1>
      </div>

      <div className="section section--tight">
        <div className="container">
          {wishlist.length === 0 ? (
            <EmptyState
              icon={<FiHeart size={26} />}
              title="Your wishlist is empty"
              message="Tap the heart on any product to keep it here for later and build your dream collection."
              action={<Button to="/shop">Browse the shop</Button>}
            />
          ) : (
            <div className="pgrid">
              {wishlist.map((p) => (
                <div key={p.id} className="wl-item">
                  <ProductCard product={p} onQuickView={setQuickViewProduct} />
                  <div className="wl-actions">
                    {p.hasVariants ? (
                      <Link to={`/product/${p.id}`} className="btn btn-primary btn-sm">Select Options</Link>
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => { addToCart(p); toggleWishlist(p); }}>Move to Cart</button>
                    )}
                    <button type="button" className="link-u wl-remove" onClick={() => toggleWishlist(p)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
