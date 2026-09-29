import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useFaqs } from '../hooks/useStoreData';


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
      <div className="section section--tight">
        <div className="container faq-layout">
          <div className="faq-cats" role="group" aria-label="FAQ categories">
            {cats.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} className={cat === c ? 'is-on' : ''} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div>
            {loading ? (
              <LineSkeleton width="100%" height={200} />
            ) : error ? (
              <ErrorState message="Could not load FAQs right now." onRetry={refetch} />
            ) : (
              grouped.map((g) => g.items.length > 0 && (
                <section className="acc-group" key={g.cat}>
                  <h2>{g.cat}</h2>
                  {g.items.map((f, i) => {
                    const uid = `${g.cat}-${i}`;
                    const open = openId === uid;
                    return (
                      <div className={`acc ${open ? 'is-open' : ''}`} key={uid}>
                        <h3>
                          <button type="button" id={`q-${uid}`} aria-expanded={open} aria-controls={`a-${uid}`} onClick={() => setOpenId(open ? null : uid)}>
                            <span>{f.q}</span><FiPlus size={18} aria-hidden="true" />
                          </button>
                        </h3>
                        <div id={`a-${uid}`} role="region" aria-labelledby={`q-${uid}`} className="acc-panel" hidden={!open}><p>{f.a}</p></div>
                      </div>
                    );
                  })}
                </section>
              ))
            )}
            <div className="faq-help">
              <h3>Still have a question?</h3>
              <p>Our team replies to every enquiry personally.</p>
              <Button to="/contact" variant="dark">Contact us</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
