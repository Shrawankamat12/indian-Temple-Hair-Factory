// Fallback company details, used ONLY until the admin has saved Admin → Settings → Business Information.
// Nothing here is shown as an address or tax number: those come from the admin and stay hidden when empty.
// Every consumer reads through `useCompanyInfo()` (hooks/useStoreData.js) — never import these directly for display.
export const DEFAULT_COMPANY = {
  brandName: 'Indian Temple Hair Exports',
  tagline: 'Pure Indian Hair. Global Beauty.',
  contactPerson: '',
  brandDescription:
    'Manufacturer and exporter of authentic Indian temple remy hair: raw hair, virgin bundles, wigs, closures and frontals, prepared for customers and wholesale buyers worldwide.',
  address: '',
  addressLines: [],
  email: 'indiantemplehairexports@gmail.com',
  phones: ['+91 8920311195'],
  whatsapp: '+91 8920311195',
  gst: '',
  businessHours: '',
  googleMapsUrl: '',
  logo: '',
  favicon: '',
  socialLinks: {},
};
