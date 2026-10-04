import { useLocation } from 'react-router-dom';
import { FiCheck, FiMail, FiTruck } from 'react-icons/fi';
import Button from '../components/Button';
import Container from '../components/Container';
import Section from '../components/Section';
import { useCompanyInfo } from '../hooks/useStoreData';

export default function OrderConfirmation() {
  const location = useLocation();
  // Only show an order number when checkout actually passed one.
  const orderId = location.state?.orderNumber;
  const { company } = useCompanyInfo();
  const { deliveryMinDays, deliveryMaxDays } = company.shipping;
  const NEXT = [
    [FiMail, 'Confirmation', 'We will keep you updated on your order status.'],
    deliveryMaxDays > 0 && [FiTruck, 'Delivery', `Expected in ${deliveryMinDays}–${deliveryMaxDays} business days.`],
  ].filter(Boolean);

  return (
    <Section>
      <Container narrow className="flex flex-col items-center py-6 text-center sm:py-12">
        <span className="mb-7 flex h-[108px] w-[84px] items-end justify-center rounded-t-full border-[1.5px] border-gold bg-white pb-[26px] text-walnut" aria-hidden="true"><FiCheck size={30} /></span>
        <h1 className="mb-3.5 text-[clamp(2.2rem,4.6vw,3.6rem)]">Order confirmed</h1>
        <p className="max-w-[52ch] text-muted">Thank you. Your order has been placed and is being prepared for dispatch. For any question about your order, call {company.phones[0]}.</p>
        {orderId && (
          <div className="mt-7 flex flex-col gap-1 rounded-lg border border-line border-t-[3px] border-t-gold bg-white px-8 py-4">
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted">Order ID</span>
            <strong className="font-display text-2xl font-normal tracking-[0.04em] tabular-nums text-espresso">{orderId}</strong>
          </div>
        )}
        <ul className="m-0 mt-10 grid w-full list-none gap-3 p-0 text-left sm:grid-cols-2">
          {NEXT.map(([Icon, title, text]) => (
            <li key={title} className="rounded-lg border border-line bg-white p-4">
              <Icon size={18} className="mb-2 text-gold" aria-hidden="true" />
              <strong className="block text-[0.9rem] text-espresso">{title}</strong>
              <span className="text-[0.82rem] text-muted">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/account">Track your order</Button>
          <Button to="/shop" variant="outline">Continue shopping</Button>
        </div>
      </Container>
    </Section>
  );
}
