import { useLocation } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import Button from '../components/Button';

export default function OrderConfirmation() {
  const location = useLocation();
  // Only show an order number when checkout actually passed one.
  const orderId = location.state?.orderNumber;

  return (
    <div className="section">
      <div className="container container--narrow oc">
        <span className="oc-mark" aria-hidden="true"><FiCheck size={30} /></span>
        <h1>Order confirmed</h1>
        <p>Thank you. Your order has been placed and our Delhi factory is preparing it for dispatch.</p>
        {orderId && (
          <div className="oc-id">
            <span>Order ID</span>
            <strong className="num">{orderId}</strong>
          </div>
        )}
        <div className="oc-actions">
          <Button to="/account">Track your order</Button>
          <Button to="/shop" variant="outline">Continue shopping</Button>
        </div>
      </div>
    </div>
  );
}
