// Default wording for the policies the client has fixed: NO returns, NO refunds, NO cancellations.
// The phone number is intentionally NOT written into the text — the storefront prints the live number from
// Admin → Settings on every policy page, so a change of phone never needs a policy edit.
// Everything here is editable from Admin → Website Content → Policy Pages.
const clientPolicies = [
  {
    slug: 'returns',
    title: 'Return Policy',
    sections: [
      { heading: 'No returns', body: 'All sales are final. We do not accept returns on any order once it has been placed.' },
      { heading: 'Questions about your order', body: 'If you have a question or a concern about an order you have received, please contact us by phone using the number shown on this page.' },
    ],
  },
  {
    slug: 'refund',
    title: 'Refund Policy',
    sections: [
      { heading: 'No refunds', body: 'We do not offer refunds on any order once it has been placed.' },
      { heading: 'Questions about a payment', body: 'If you believe you have been charged incorrectly, please contact us by phone using the number shown on this page.' },
    ],
  },
  {
    slug: 'cancellation',
    title: 'Cancellation Policy',
    sections: [
      { heading: 'Orders cannot be cancelled', body: 'Once an order has been placed it cannot be cancelled.' },
      { heading: 'Need help?', body: 'For any question about your order, please contact us by phone using the number shown on this page.' },
    ],
  },
];

module.exports = { clientPolicies };
