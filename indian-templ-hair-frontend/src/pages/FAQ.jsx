import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Container from '../components/Container';
import Section from '../components/Section';
import { LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useFaqs } from '../hooks/useStoreData';
import { cx } from '../lib/ui';

export default function FAQ() {
  const [cat, setCat] = useState('All');
  const [openId, setOpenId] = useState(0);
  const { faqs, loading, error, refetch } = useFaqs();

  // categories come from the FAQs the admin has actually created
  const cats = ['All', ...new Set(faqs.map((f) => f.cat).filter(Boolean))];
  const grouped = cats.slice(1).map((c) => ({
    cat: c,
    items: faqs.filter((f) => f.cat === c),
  })).filter((g) => cat === 'All' || g.cat === cat);

  return (
    <>
      <PageHeader crumbs={[{ label: 'FAQ' }]} title="Frequently Asked Questions" lede="Shipping, returns, hair care and bulk/export, answered." tall />
      <Section tight>
        <Container className="grid items-start gap-[clamp(24px,4vw,56px)] md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex gap-1.5 overflow-x-auto md:sticky md:top-[calc(var(--navbar-h,72px)+20px)] md:grid md:gap-1 md:overflow-visible" role="group" aria-label="FAQ categories">
            {cats.map((c) => (
              <button
                key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}
                className="flex-none whitespace-nowrap rounded-md px-3.5 py-[11px] text-left text-[0.92rem] font-medium text-muted transition hover:bg-sand hover:text-espresso aria-pressed:bg-espresso aria-pressed:text-cream md:whitespace-normal"
              >{c}</button>
            ))}
          </div>
          <div className="min-w-0">
            {loading ? (
              <LineSkeleton width="100%" height={200} />
            ) : error ? (
              <ErrorState message="Could not load FAQs right now." onRetry={refetch} />
            ) : (
              grouped.map((g) => g.items.length > 0 && (
                <section className="mb-2" key={g.cat}>
                  <h2 className="mb-1 mt-7 text-[1.3rem] first:mt-0">{g.cat}</h2>
                  {g.items.map((f, i) => {
                    const uid = `${g.cat}-${i}`;
                    const open = openId === uid;
                    return (
                      <div className="border-b border-line" key={uid}>
                        <h3 className="m-0 font-sans text-base">
                          <button
                            type="button" id={`q-${uid}`} aria-expanded={open} aria-controls={`a-${uid}`} onClick={() => setOpenId(open ? null : uid)}
                            className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-0.5 py-[18px] text-left font-sans text-base font-medium text-espresso"
                          >
                            <span>{f.q}</span>
                            <FiPlus size={18} aria-hidden="true" className={cx('flex-none text-walnut transition-transform duration-300 ease-soft', open && 'rotate-45')} />
                          </button>
                        </h3>
                        <div id={`a-${uid}`} role="region" aria-labelledby={`q-${uid}`} hidden={!open} className="max-w-[62ch] px-0.5 pb-5 text-muted"><p>{f.a}</p></div>
                      </div>
                    );
                  })}
                </section>
              ))
            )}
            <div className="mt-11 rounded-xl bg-sand p-7 text-center">
              <h3 className="mb-1.5">Still have a question?</h3>
              <p className="mx-auto mb-[18px] text-muted">Our team replies to every enquiry personally.</p>
              <Button to="/contact" variant="dark">Contact us</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
