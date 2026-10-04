import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSiteContent, useCompanyInfo } from '../hooks/useStoreData';
import { LoadingState } from '../components/StateBlocks';
import Container from '../components/Container';
import Section from '../components/Section';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { cx } from '../lib/ui';

const POLICY_LINKS = [
  ['shipping', 'Shipping'], ['returns', 'Returns'], ['refund', 'Refunds'], ['cancellation', 'Cancellation'], ['privacy', 'Privacy'], ['terms', 'Terms'],
];

// Built from live settings so the wording can never disagree with what checkout charges.
const makeContent = (company) => ({
  shipping: {
    title: 'Shipping Policy',
    body: [
      ['Shipping Timelines', `Delivery usually takes ${company.shipping.deliveryMinDays}–${company.shipping.deliveryMaxDays} business days. International and export shipments depend on the destination and customs clearance.`],
      ['Shipping Costs', (() => { const sh = company.shipping; const inr = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; return `${sh.freeShippingThreshold > 0 ? `Orders above ${inr(sh.freeShippingThreshold)} ship free. Below that, a ${inr(sh.standardRate)} standard shipping fee applies. ` : `Standard shipping is ${inr(sh.standardRate)}. `}Express shipping is ${inr(sh.expressRate)}.`; })()],
      ['International / Export Orders', 'Wholesale and export shipments are quoted individually based on destination, weight and Incoterms (FOB / CIF). Contact our export desk for a shipping quote.'],
      ['Customs & Duties', 'International buyers are responsible for any customs duties, taxes or import fees levied by their destination country.'],
      ['Order Tracking', 'A tracking number is shared by email once your order ships. You can also track orders from your account dashboard.'],
    ],
  },
  returns: {
    title: 'Return Policy',
    body: [
      ['No returns', 'All sales are final. We do not accept returns on any order once it has been placed.'],
      ['Questions about your order', 'If you have a question or a concern about an order you have received, please contact us by phone using the number shown on this page.'],
    ],
  },
  refund: {
    title: 'Refund Policy',
    body: [
      ['No refunds', 'We do not offer refunds on any order once it has been placed.'],
      ['Questions about a payment', 'If you believe you have been charged incorrectly, please contact us by phone using the number shown on this page.'],
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    body: [
      ['Orders cannot be cancelled', 'Once an order has been placed it cannot be cancelled.'],
      ['Need help?', 'For any question about your order, please contact us by phone using the number shown on this page.'],
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
      ['Pricing & Payment', 'All prices are listed in US Dollars (USD) and may change without prior notice. Online payments are processed securely by PayPal and are charged in USD. Wholesale pricing requires a separate agreement.'],
      ['Product Descriptions', 'We aim for accuracy in every product description; minor natural variation in hair texture and colour between batches should be expected.'],
      ['Limitation of Liability', `${company.brandName} is not liable for indirect or consequential damages arising from product use beyond the value of the order.`],
    ],
  },
});

// Admin-edited policy (Website Content → Policy Pages, matched by slug) wins; the built-in text above
// is only a fallback for slugs the admin has not created yet.
export default function Policy() {
  const { type } = useParams();
  const { siteContent, loading } = useSiteContent();
  const { company } = useCompanyInfo();
  if (loading) return <LoadingState label="Loading policy" />;

  const cms = (siteContent?.policies || []).find((p) => p.slug === type && (p.sections?.length || p.title));
  const content = makeContent(company);
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
            <p className="mx-auto mb-[18px] text-muted">{company.policyContactNote || 'Please call us and our team will help.'}</p>
            {company.phones[0] && (
              <a href={`tel:${company.phones[0].replace(/[\s()-]+/g, '')}`} className="mb-4 block font-display text-[1.6rem] text-espresso hover:text-walnut">{company.phones[0]}</a>
            )}
            <Button to="/contact" variant="dark">Contact us</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
