import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSiteContent } from '../hooks/useStoreData';
import { LoadingState } from '../components/StateBlocks';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { cx } from '../lib/ui';

const POLICY_LINKS = [
  ['shipping', 'Shipping'], ['returns', 'Returns & Refund'], ['cancellation', 'Cancellation'], ['privacy', 'Privacy'], ['terms', 'Terms'],
];

const content = {
  shipping: {
    title: 'Shipping Policy',
    body: [
      ['Shipping Timelines', 'In-stock orders ship from our New Delhi facility within 24 hours. Domestic delivery takes 3–6 business days; international export delivery takes 6–12 business days depending on customs clearance.'],
      ['Shipping Costs', 'Orders above ₹15,000 ship free domestically. Below that threshold, a flat ₹499 shipping fee applies. Express shipping is available at checkout for an additional fee.'],
      ['International / Export Orders', 'Wholesale and export shipments are quoted individually based on destination, weight and Incoterms (FOB / CIF). Contact our export desk for a shipping quote.'],
      ['Customs & Duties', 'International buyers are responsible for any customs duties, taxes or import fees levied by their destination country.'],
      ['Order Tracking', 'A tracking number is shared by email once your order ships. You can also track orders from your account dashboard.'],
    ],
  },
  returns: {
    title: 'Return & Refund Policy',
    body: [
      ['Returns Eligibility', 'Unopened bundles, wigs, closures and frontals in original packaging may be returned within 7 days of delivery for a full refund, minus shipping costs.'],
      ['Exchanges', 'Opened wefts, wigs and closures can only be exchanged in the case of a manufacturing defect, verified by our QC team.'],
      ['How to Request a Return', 'Contact our support team with your order number and reason for return; we will share a return authorisation and address.'],
      ['Refund Processing', 'Approved refunds are processed within 5–7 business days back to the original payment method.'],
      ['Wholesale / Bulk Orders', 'Bulk and wholesale export orders are covered under separate terms agreed at the time of the order; please refer to your wholesale agreement.'],
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    body: [
      ['Before Dispatch', 'You can cancel an order at any time before it is dispatched. Contact support with your order number and we will confirm the cancellation.'],
      ['After Dispatch', 'Once an order has shipped it cannot be cancelled; you may use our return process after delivery.'],
      ['Refunds for Cancelled Orders', 'Refunds for cancelled prepaid orders are processed to the original payment method within 5–7 business days.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      ['Information We Collect', 'We collect the name, contact details, shipping address and order history you provide when placing an order or creating an account.'],
      ['How We Use It', 'Your information is used to process orders, provide customer support and, where you opt in, send product updates.'],
      ['Data Sharing', 'We do not sell personal data. Information is shared only with shipping and payment partners as required to fulfil your order.'],
      ['Your Rights', 'You may request access to, correction of, or deletion of your personal data at any time by contacting our support team.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      ['Use of This Site', 'By placing an order, you confirm the information provided is accurate and that you are authorised to make the purchase.'],
      ['Pricing', 'All prices are listed in Indian Rupees (₹) and are subject to change without prior notice. Wholesale pricing requires a separate agreement.'],
      ['Product Descriptions', 'We aim for accuracy in every product description; minor natural variation in hair texture and colour between batches should be expected.'],
      ['Limitation of Liability', 'Indian Temple Remy Hair Exports is not liable for indirect or consequential damages arising from product use beyond the value of the order.'],
    ],
  },
};

// Admin-edited policy (Website Content → Policy Pages, matched by slug) wins; the built-in text above
// is only a fallback for slugs the admin has not created yet.
export default function Policy() {
  const { type } = useParams();
  const { siteContent, loading } = useSiteContent();
  if (loading) return <LoadingState label="Loading policy" />;

  const cms = (siteContent?.policies || []).find((p) => p.slug === type && (p.sections?.length || p.title));
  const fallback = content[type] || content.shipping;
  const title = cms?.title || fallback.title;
  const sections = cms
    ? (cms.sections || []).map((s) => [s.heading, s.body])
    : fallback.body;

  return (
    <>
      <PageHeader crumbs={[{ label: title }]} title={title} tall />
      <Section tight>
        <Container narrow>
          <nav className="mb-9 flex flex-wrap gap-2" aria-label="Policies">
            {POLICY_LINKS.map(([slug, label]) => (
              <Link
                key={slug} to={`/policy/${slug}`}
                className={cx('rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition', type === slug ? 'border-espresso bg-espresso text-cream' : 'border-line-strong bg-white text-ink hover:border-walnut')}
              >{label}</Link>
            ))}
          </nav>
          <ol className="m-0 grid list-none gap-0 p-0">
            {sections.map(([h, p], i) => (
              <li key={`${h}-${i}`} className="grid grid-cols-[36px_1fr] gap-4 border-t border-line py-7 first:border-t-0 first:pt-0 sm:grid-cols-[44px_1fr] sm:gap-5">
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-gold font-display text-base tabular-nums text-walnut sm:size-11" aria-hidden="true">{i + 1}</span>
                <div className="grid gap-3">
                  {h && <h2 className="text-[1.4rem]">{h}</h2>}
                  {(p || '').split(/\n{2,}/).map((para, j) => <p key={j} className="max-w-none text-ink">{para}</p>)}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-xl bg-sand p-7 text-center">
            <h3 className="mb-1.5">Questions about this policy?</h3>
            <p className="mx-auto mb-[18px] text-muted">Our team is happy to help.</p>
            <Button to="/contact" variant="dark">Contact us</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
