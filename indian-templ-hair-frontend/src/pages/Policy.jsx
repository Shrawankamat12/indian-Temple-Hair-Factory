import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSiteContent } from '../hooks/useStoreData';
import { LoadingState } from '../components/StateBlocks';

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
      <div className="section section--tight">
        <div className="container container--narrow">
          <ol className="policy-list">
            {sections.map(([h, p], i) => (
              <li key={`${h}-${i}`} className="policy-item">
                <span className="policy-num num" aria-hidden="true">{i + 1}</span>
                <div>
                  {h && <h2>{h}</h2>}
                  {(p || '').split(/\n{2,}/).map((para, j) => <p key={j}>{para}</p>)}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
