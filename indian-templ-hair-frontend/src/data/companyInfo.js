// Single source of truth for company/contact details shown across the
// storefront (Navbar announcement bar, Footer, Contact page, Login/order
// emails, etc). Every one of these values is admin-editable via the
// "Website Content" → footer/contact section in the admin panel
// (siteContentApi → sc.footer). What's below is ONLY the fallback used
// before the admin has configured anything — nothing here is duplicated
// or hardcoded separately per-page; every consumer reads through
// `useCompanyInfo()` below, which merges live siteContent over these
// defaults.
export const DEFAULT_COMPANY = {
  brandName: 'Indian Temple Hair Export',
  tagline: 'Pure Indian Hair. Global Beauty.',
  contactPerson: 'Jasleen Bajaj',
  brandDescription:
    'Indian Temple Hair Export — manufacturer and exporter of 100% authentic Indian temple remy hair: raw hair, virgin bundles, wigs, closures and frontals, ethically sourced and prepared for customers and wholesale buyers worldwide.',
  address: '69/6A Pvt. No. 74, Najafgarh Road, Industrial Area, New Delhi, 110015, India',
  email: 'indiantemplehairexports@gmail.com',
  phones: ['+91 8920311195'],
  gst: '07AGVPB7155J1ZY',
  businessHours: 'Monday – Saturday, 9:30 AM – 7:00 PM IST',
  // No social URLs are invented — icons/links render only once the admin
  // supplies a real URL for a given platform.
  socialLinks: {},
};
