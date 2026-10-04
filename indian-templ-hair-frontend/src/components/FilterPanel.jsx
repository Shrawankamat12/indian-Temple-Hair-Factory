import FilterAccordion from './FilterAccordion';
import Button from './Button';
import { Check } from './Field';
import { linkU } from '../lib/ui';

const fchip =
  'inline-flex items-center gap-[7px] rounded-full border border-line-strong bg-white px-[13px] py-[7px] text-[0.82rem] text-ink transition duration-200 hover:border-walnut aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white';

/**
 * Shop filter sidebar / drawer body. Pure presentation: all state and
 * setters live in Shop.jsx and are passed in unchanged. Filters apply live;
 * "Apply Filters" closes the mobile drawer and jumps to the results.
 */
export default function FilterPanel({ data, state, set, activeCount, onReset, lengths, onApply }) {
  const { categories, subcategories, brands, collections, hairTypeAttrs, textureAttrs, colorAttrs, laceAttrs = [], densityAttrs = [] } = data;
  const { cat, subCat, brand, collection, hairType, texture, length, color, laceType, density, rating } = state;
  const toggle = (current, value, setter) => setter(current === value ? null : value);

  const Chip = ({ active, onClick, children }) => (
    <button type="button" className={fchip} aria-pressed={active} onClick={onClick}>{children}</button>
  );
  const Row = ({ children }) => <div className="flex flex-wrap gap-[7px]">{children}</div>;

  return (
    <>
      <div className="-mx-4 flex items-center justify-between border-b border-line px-4 py-3.5">
        <h3 className="text-xl">Filter</h3>
        {activeCount > 0 && <button type="button" className={linkU} onClick={onReset}>Reset ({activeCount})</button>}
      </div>

      {hairTypeAttrs.length > 0 && (
        <FilterAccordion title="Hair Type">
          <Row>{hairTypeAttrs.map((h) => <Chip key={h._id} active={hairType === h.name} onClick={() => toggle(hairType, h.name, set.hairType)}>{h.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      <FilterAccordion title="Length">
        <Row>{lengths.map((l) => <Chip key={l.id} active={length === l.id} onClick={() => toggle(length, l.id, set.length)}>{l.label}</Chip>)}</Row>
      </FilterAccordion>

      {textureAttrs.length > 0 && (
        <FilterAccordion title="Texture">
          <Row>{textureAttrs.map((t) => <Chip key={t._id} active={texture === t.name} onClick={() => toggle(texture, t.name, set.texture)}>{t.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      {colorAttrs.length > 0 && (
        <FilterAccordion title="Colour" defaultOpen={false}>
          <Row>
            {colorAttrs.map((c) => (
              <Chip key={c._id} active={color === c.name} onClick={() => toggle(color, c.name, set.color)}>
                {c.colorSwatch && <span className="size-[13px] flex-none rounded-full border border-black/20" style={{ background: c.colorSwatch }} />}
                {c.name}
              </Chip>
            ))}
          </Row>
        </FilterAccordion>
      )}

      {laceAttrs.length > 0 && (
        <FilterAccordion title="Lace Type" defaultOpen={false}>
          <Row>{laceAttrs.map((l) => <Chip key={l._id} active={laceType === l.name} onClick={() => toggle(laceType, l.name, set.laceType)}>{l.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      {densityAttrs.length > 0 && (
        <FilterAccordion title="Density" defaultOpen={false}>
          <Row>{densityAttrs.map((d) => <Chip key={d._id} active={density === d.name} onClick={() => toggle(density, d.name, set.density)}>{d.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      {state.priceCeiling > 0 && (
        <FilterAccordion title="Price Range">
          <input
            type="range" min="0" max={state.priceCeiling} step="5" value={state.maxPrice} className="w-full accent-walnut"
            aria-label="Maximum price" onChange={(e) => set.maxPrice(Number(e.target.value))}
          />
          <div className="mt-1.5 flex justify-between text-[0.8rem] tabular-nums text-muted"><span>$0</span><span>Up to ${Number(state.maxPrice).toLocaleString('en-US')}</span></div>
        </FilterAccordion>
      )}

      {categories.length > 0 && (
        <FilterAccordion title="Category" defaultOpen={false}>
          <Row>
            {categories.filter((c) => c.active !== false && !c.parentId).map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => { set.cat(cat === c.id ? null : c.id); set.subCat(null); }}>{c.name}</Chip>
            ))}
          </Row>
        </FilterAccordion>
      )}

      {cat && subcategories.length > 0 && (
        <FilterAccordion title="Sub category">
          <Row>{subcategories.map((s) => <Chip key={s._id} active={subCat === s._id} onClick={() => toggle(subCat, s._id, set.subCat)}>{s.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      {brands.length > 0 && (
        <FilterAccordion title="Brand" defaultOpen={false}>
          <Row>{brands.map((b) => <Chip key={b._id} active={brand === b._id} onClick={() => toggle(brand, b._id, set.brand)}>{b.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      {collections.length > 0 && (
        <FilterAccordion title="Collection" defaultOpen={false}>
          <Row>{collections.map((c) => <Chip key={c._id} active={collection === c._id} onClick={() => toggle(collection, c._id, set.collection)}>{c.name}</Chip>)}</Row>
        </FilterAccordion>
      )}

      <FilterAccordion title="Rating" defaultOpen={false}>
        <div className="grid gap-2.5">
          {[4, 4.5].map((r) => (
            <Check key={r} checked={rating === r} onChange={() => set.rating(rating === r ? null : r)}>{r} stars and above</Check>
          ))}
        </div>
      </FilterAccordion>

      {onApply && <Button block className="mt-3" onClick={onApply}>Apply Filters</Button>}
    </>
  );
}
