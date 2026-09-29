import FilterAccordion from './FilterAccordion';
import Button from './Button';

/**
 * Shop filter sidebar / drawer body. Pure presentation: all state and
 * setters live in Shop.jsx and are passed in unchanged. Filters apply live;
 * "Apply Filters" closes the mobile drawer and jumps to the results.
 */
export default function FilterPanel({ data, state, set, activeCount, onReset, lengths, onApply }) {
  const { categories, subcategories, brands, collections, hairTypeAttrs, textureAttrs, colorAttrs, laceAttrs = [], densityAttrs = [] } = data;
  const { cat, subCat, brand, collection, hairType, texture, length, color, laceType, density, rating, maxPrice } = state;
  const toggle = (current, value, setter) => setter(current === value ? null : value);

  const Chip = ({ active, onClick, children }) => (
    <button type="button" className="fchip" aria-pressed={active} onClick={onClick}>{children}</button>
  );

  return (
    <>
      <div className="fp-head">
        <h3>Filter</h3>
        {activeCount > 0 && <button type="button" className="link-u" onClick={onReset}>Reset ({activeCount})</button>}
      </div>

      {hairTypeAttrs.length > 0 && (
        <FilterAccordion title="Hair Type">
          <div className="chip-row">
            {hairTypeAttrs.map((h) => <Chip key={h._id} active={hairType === h.name} onClick={() => toggle(hairType, h.name, set.hairType)}>{h.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      <FilterAccordion title="Length">
        <div className="chip-row">
          {lengths.map((l) => <Chip key={l.id} active={length === l.id} onClick={() => toggle(length, l.id, set.length)}>{l.label}</Chip>)}
        </div>
      </FilterAccordion>

      {textureAttrs.length > 0 && (
        <FilterAccordion title="Texture">
          <div className="chip-row">
            {textureAttrs.map((t) => <Chip key={t._id} active={texture === t.name} onClick={() => toggle(texture, t.name, set.texture)}>{t.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      {colorAttrs.length > 0 && (
        <FilterAccordion title="Colour" defaultOpen={false}>
          <div className="chip-row">
            {colorAttrs.map((c) => (
              <Chip key={c._id} active={color === c.name} onClick={() => toggle(color, c.name, set.color)}>
                {c.colorSwatch && <span className="swatch" style={{ background: c.colorSwatch }} />}
                {c.name}
              </Chip>
            ))}
          </div>
        </FilterAccordion>
      )}

      {laceAttrs.length > 0 && (
        <FilterAccordion title="Lace Type" defaultOpen={false}>
          <div className="chip-row">
            {laceAttrs.map((l) => <Chip key={l._id} active={laceType === l.name} onClick={() => toggle(laceType, l.name, set.laceType)}>{l.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      {densityAttrs.length > 0 && (
        <FilterAccordion title="Density" defaultOpen={false}>
          <div className="chip-row">
            {densityAttrs.map((d) => <Chip key={d._id} active={density === d.name} onClick={() => toggle(density, d.name, set.density)}>{d.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      <FilterAccordion title="Price Range">
        <input
          type="range" min="0" max="35000" step="500" value={maxPrice} className="facc-range"
          aria-label="Maximum price" onChange={(e) => set.maxPrice(Number(e.target.value))}
        />
        <div className="facc-range-labels"><span className="price">₹0</span><span className="price">Up to ₹{maxPrice.toLocaleString('en-IN')}</span></div>
      </FilterAccordion>

      {categories.length > 0 && (
        <FilterAccordion title="Category" defaultOpen={false}>
          <div className="chip-row">
            {categories.filter((c) => c.active !== false && !c.parentId).map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => { set.cat(cat === c.id ? null : c.id); set.subCat(null); }}>{c.name}</Chip>
            ))}
          </div>
        </FilterAccordion>
      )}

      {cat && subcategories.length > 0 && (
        <FilterAccordion title="Sub category">
          <div className="chip-row">
            {subcategories.map((s) => <Chip key={s._id} active={subCat === s._id} onClick={() => toggle(subCat, s._id, set.subCat)}>{s.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      {brands.length > 0 && (
        <FilterAccordion title="Brand" defaultOpen={false}>
          <div className="chip-row">
            {brands.map((b) => <Chip key={b._id} active={brand === b._id} onClick={() => toggle(brand, b._id, set.brand)}>{b.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      {collections.length > 0 && (
        <FilterAccordion title="Collection" defaultOpen={false}>
          <div className="chip-row">
            {collections.map((c) => <Chip key={c._id} active={collection === c._id} onClick={() => toggle(collection, c._id, set.collection)}>{c.name}</Chip>)}
          </div>
        </FilterAccordion>
      )}

      <FilterAccordion title="Rating" defaultOpen={false}>
        <div className="fp-checks">
          {[4, 4.5].map((r) => (
            <label className="check" key={r}>
              <input type="checkbox" checked={rating === r} onChange={() => set.rating(rating === r ? null : r)} />
              {r} stars and above
            </label>
          ))}
        </div>
      </FilterAccordion>

      {onApply && <Button block className="fp-apply" onClick={onApply}>Apply Filters</Button>}
    </>
  );
}
