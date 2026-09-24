import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiEye } from "react-icons/fi";
import StarRating from "./StarRating";
import { rupee } from "../lib/format";
import { resolveImageUrl } from "../lib/api";
import { useStore } from "../context/StoreContext";
import { useCompare } from "../context/CompareContext";

export default function ProductCard({ product, style, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { toggleCompare, isComparing } = useCompare();
  const wished = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const imageUrl = resolveImageUrl(product.image);

  return (
    <motion.div className="pc" style={style} whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
      <Link to={`/product/${product.id}`} className="pc-media">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="hm-fallback">{product.name.charAt(0)}</div>
        )}

        <div className="pc-badges">
          {product.badge && (
            <span className={`badge badge-${product.badge.toLowerCase().replace(/[^a-z]/g, "")}`}>
              {product.badge}
            </span>
          )}
          {product.discountPct > 0 && <span className="badge badge-discount">-{product.discountPct}%</span>}
        </div>

        <button
          className={`pc-wish ${wished ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          <FiHeart size={15} />
        </button>

        <button
          className="pc-quickadd"
          onClick={(e) => {
            e.preventDefault();
            if (onQuickView) onQuickView(product);
            else if (!product.hasVariants) addToCart(product);
          }}
        >
          {onQuickView ? (<><FiEye size={13} style={{ marginRight: 6, display: 'inline' }} />Quick View</>) : product.hasVariants ? 'Select Options' : 'Quick Add'}
        </button>
      </Link>

      <div className="pc-body">
        {product.hairType && <span className="pc-variant">{product.hairType}</span>}
        <Link to={`/product/${product.id}`}>
          <h3 className="pc-name">{product.name}</h3>
        </Link>

        <div className="pc-rating">
          <StarRating value={product.rating} size={12} />
          <span>({product.reviews})</span>
        </div>

        <div className="pc-price-row">
          <span className="price-now">{rupee(product.price)}</span>
          {product.discountPct > 0 && <span className="price-strike">{rupee(product.mrp)}</span>}
        </div>

        <label className="flex items-center gap-2 text-[0.72rem] mt-1" style={{ color: 'var(--taupe)' }} onClick={(e) => e.preventDefault()}>
          <input type="checkbox" checked={comparing} onChange={() => toggleCompare(product)} style={{ accentColor: 'var(--ink)', width: 13, height: 13 }} />
          Compare
        </label>
      </div>
    </motion.div>
  );
}
