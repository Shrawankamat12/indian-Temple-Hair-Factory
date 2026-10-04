import { useEffect, useState } from 'react';
import { getSettings, updateSettings, getPaymentSettings, updatePaymentSettings } from '../../api/settings.api.js';
import { PageHeader, Card, Tabs, Button, FormField, Input, Textarea, Switch, Select } from '../../components/ui/index.js';
import { SingleImageUpload } from '../../components/ui/ImageUpload.jsx';
import { PageLoader, useToast } from '../../components/ui/Feedback.jsx';

// Settings → Business Information is the ONE place the storefront reads name / phone / email / address / social
// links from (header, footer, contact page, policies, checkout). Nothing is hardcoded separately in the storefront.
const TABS = [
  { value: 'business', label: 'Business Information' },
  { value: 'social', label: 'Social Media' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'payments', label: 'Payments' },
  { value: 'orders', label: 'Order Policy' },
  { value: 'tax', label: 'Tax' },
  { value: 'seo', label: 'SEO' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Notifications (SMS)' },
];

const empty = {
  storeName: '', legalName: '', storeEmail: '', storePhone: '', whatsapp: '', businessDescription: '', businessHours: '',
  buildingNumber: '', floor: '', storeAddress: '', area: '', landmark: '', city: '', state: '', country: '', pincode: '', googleMapsUrl: '',
  gstNumber: '', logo: '', favicon: '',
  seoTitle: '', seoDescription: '', seoKeywords: '',
  freeShippingThreshold: '', flatShippingRate: '', expressShippingRate: '', shippingZones: '', deliveryMinDays: 3, deliveryMaxDays: 6,
  codEnabled: false,
  allowCustomerCancellation: false, allowReturnRequests: false, allowRefundRequests: false, policyContactNote: '',
  taxRate: '', taxLabel: 'GST',
  smtpHost: '', smtpPort: '', smtpUser: '', smtpFrom: '',
  smsProvider: '', smsApiKey: '',
  facebook: '', instagram: '', linkedin: '', youtube: '', tiktok: '', twitter: '', pinterest: '',
};

const emptyPay = { paypalEnabled: false, paypalEnvironment: 'sandbox', paypalClientId: '', paypalClientSecret: '', hasClientSecret: false, paypalWebhookId: '', currency: 'USD' };

export default function Settings() {
  const [tab, setTab] = useState('business');
  const [values, setValues] = useState(empty);
  const [pay, setPay] = useState(emptyPay);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      getSettings().then((d) => setValues({ ...empty, ...d })).catch(() => toast.error('Could not load settings')),
      getPaymentSettings().then((d) => setPay({ ...emptyPay, ...d, paypalClientSecret: '' })).catch(() => {}),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const setP = (k, v) => setPay((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { paypalClientSecret, hasClientSecret, hasWebhookId, paypalWebhookUrl, ...payload } = pay; // eslint-disable-line no-unused-vars
      await updateSettings(values);
      if (tab === 'payments' || pay.paypalClientSecret) {
        const saved = await updatePaymentSettings({ ...payload, ...(paypalClientSecret ? { paypalClientSecret } : {}) });
        setPay({ ...emptyPay, ...saved, paypalClientSecret: '' });
      }
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not save settings');
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader label="Loading settings…" />;

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const webhookUrl = `${apiBase || '<your-api-domain>/api/v1'}/payments/paypal/webhook`;
  const text = (k, label, props = {}, cls = 'col-span-2 sm:col-span-1') => (
    <FormField label={label} className={cls}><Input value={values[k] ?? ''} onChange={(e) => set(k, e.target.value)} {...props} /></FormField>
  );

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store-wide configuration. Changes appear on the storefront immediately." actions={<Button onClick={save} loading={saving}>Save Changes</Button>} />
      <Card padded={false}>
        <div className="px-5 pt-4"><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>
        <div className="px-5 pb-6 max-w-3xl">
          {tab === 'business' && (
            <div className="grid grid-cols-2 gap-4">
              {text('storeName', 'Business Name (shown on the site)')}
              {text('legalName', 'Display / Legal Name')}
              {text('storeEmail', 'Official Email', { type: 'email' })}
              {text('storePhone', 'Phone', { placeholder: '+91 …' })}
              {text('whatsapp', 'WhatsApp Number', { placeholder: '+91 …' })}
              {text('businessHours', 'Business Hours', { placeholder: 'e.g. Mon–Sat, 9:30 AM – 7:00 PM IST' })}
              <FormField label="Business Description" className="col-span-2" hint="Shown in the footer."><Textarea value={values.businessDescription || ''} onChange={(e) => set('businessDescription', e.target.value)} /></FormField>
              <p className="col-span-2 text-[12.5px] text-ink-muted -mb-1">Address — fill only the parts you have confirmed. The storefront joins the filled parts in this order and skips duplicates and blanks.</p>
              {text('buildingNumber', 'Building Number')}
              {text('floor', 'Floor')}
              <FormField label="Street / Address Line" className="col-span-2"><Textarea rows={2} value={values.storeAddress || ''} onChange={(e) => set('storeAddress', e.target.value)} /></FormField>
              {text('area', 'Area')}
              {text('landmark', 'Landmark')}
              {text('city', 'City')}
              {text('state', 'State')}
              {text('country', 'Country')}
              {text('pincode', 'Pincode')}
              {text('googleMapsUrl', 'Google Maps URL', { placeholder: 'https://maps.google.com/…' }, 'col-span-2')}
              {text('gstNumber', 'GST Number', { placeholder: 'Leave empty if not registered' })}
              <div />
              <FormField label="Logo"><SingleImageUpload value={values.logo} onChange={(v) => set('logo', v)} label="Logo" /></FormField>
              <FormField label="Favicon"><SingleImageUpload value={values.favicon} onChange={(v) => set('favicon', v)} label="Favicon" /></FormField>
            </div>
          )}

          {tab === 'social' && (
            <div className="grid grid-cols-2 gap-4">
              {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'pinterest'].map((k) => text(k, k[0].toUpperCase() + k.slice(1), { placeholder: 'https://…' }))}
              <p className="col-span-2 text-[12.5px] text-ink-muted">WhatsApp is set under Business Information. An icon only appears on the site once its link is filled in.</p>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="grid grid-cols-2 gap-4">
              {text('flatShippingRate', 'Standard Shipping Rate ($ USD)', { type: 'number', min: 0 })}
              {text('expressShippingRate', 'Express Shipping Rate ($ USD)', { type: 'number', min: 0 })}
              <FormField label="Free Shipping Above ($ USD)" hint="0 turns free shipping off. Used by cart, checkout and the server."><Input type="number" min={0} value={values.freeShippingThreshold ?? ''} onChange={(e) => set('freeShippingThreshold', e.target.value)} /></FormField>
              <div />
              {text('deliveryMinDays', 'Estimated Delivery: Min Days', { type: 'number', min: 0 })}
              {text('deliveryMaxDays', 'Estimated Delivery: Max Days', { type: 'number', min: 0 })}
              <FormField label="Shipping Zones" className="col-span-2" hint="Comma-separated list of serviceable regions"><Textarea value={values.shippingZones || ''} onChange={(e) => set('shippingZones', e.target.value)} /></FormField>
              <p className="col-span-2 text-[12.5px] text-ink-muted">Leave a rate empty to keep the previous built-in value (standard $15, express $35, free above $200). The server recalculates shipping on every order.</p>
            </div>
          )}

          {tab === 'payments' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-md bg-surface-muted p-3 text-[12.5px] text-ink-muted">
                All prices, shipping rates and coupons in this store are in <strong>US dollars (USD)</strong>, and PayPal charges exactly the order total shown to the customer, with no currency conversion. The server creates and captures the PayPal order itself. The Client Secret is stored encrypted and is never shown again or sent to any browser.
              </div>
              {pay.problems && (
                <div className={`col-span-2 rounded-md border p-3 text-[12.5px] ${pay.paypalReady ? 'border-green-300 bg-green-50 text-green-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                  {pay.paypalReady ? (
                    <strong>PayPal is ready and visible on the storefront checkout.</strong>
                  ) : (
                    <>
                      <strong>PayPal is NOT visible on checkout yet. Customers only see Cash on Delivery.</strong>
                      <ul className="mt-1.5 list-disc pl-5">{pay.problems.map((m) => <li key={m}>{m}</li>)}</ul>
                    </>
                  )}
                </div>
              )}
              <div className="col-span-2"><Switch checked={!!pay.paypalEnabled} onChange={(v) => setP('paypalEnabled', v)} label="PayPal enabled" /></div>
              <FormField label="Environment"><Select value={pay.paypalEnvironment} onChange={(e) => setP('paypalEnvironment', e.target.value)}><option value="sandbox">Sandbox (testing)</option><option value="live">Live</option></Select></FormField>
              <FormField label="Currency charged by PayPal" hint="Fixed: the whole store is in US dollars."><Input value="USD" readOnly disabled /></FormField>
              <FormField label="PayPal Client ID" className="col-span-2"><Input value={pay.paypalClientId} onChange={(e) => setP('paypalClientId', e.target.value)} /></FormField>
              <FormField label="PayPal Client Secret" className="col-span-2" hint={pay.hasClientSecret ? 'A secret is stored. Leave blank to keep it; type a new one to replace it.' : 'Not set'}><Input type="password" autoComplete="new-password" value={pay.paypalClientSecret} onChange={(e) => setP('paypalClientSecret', e.target.value)} placeholder={pay.hasClientSecret ? '•••••••• (stored)' : ''} /></FormField>
              <FormField label="PayPal Webhook ID" className="col-span-2" hint="From the webhook you create in the PayPal developer dashboard."><Input value={pay.paypalWebhookId} onChange={(e) => setP('paypalWebhookId', e.target.value)} /></FormField>
              <FormField label="Webhook URL to register in PayPal"><Input readOnly value={webhookUrl} onFocus={(e) => e.target.select()} /></FormField>
              <div className="col-span-2 border-t border-border-soft pt-4"><Switch checked={!!values.codEnabled} onChange={(v) => set('codEnabled', v)} label="Cash on Delivery enabled" /></div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-md bg-surface-muted p-3 text-[12.5px] text-ink-muted">Current business policy: no returns, no refunds, no cancellations. Customers are told to phone you. Keep these off to hide every customer-facing cancel / return / refund action. Edit the policy wording under Website Content → Policy Pages.</div>
              <div className="col-span-2"><Switch checked={!!values.allowCustomerCancellation} onChange={(v) => set('allowCustomerCancellation', v)} label="Allow customers to cancel orders" /></div>
              <div className="col-span-2"><Switch checked={!!values.allowReturnRequests} onChange={(v) => set('allowReturnRequests', v)} label="Allow return requests" /></div>
              <div className="col-span-2"><Switch checked={!!values.allowRefundRequests} onChange={(v) => set('allowRefundRequests', v)} label="Allow refund requests" /></div>
              <FormField label="Message shown on policy pages" className="col-span-2" hint="The phone number from Business Information is printed under it automatically."><Textarea rows={2} value={values.policyContactNote || ''} onChange={(e) => set('policyContactNote', e.target.value)} placeholder="Please call us and our team will help." /></FormField>
            </div>
          )}

          {tab === 'tax' && (
            <div className="grid grid-cols-2 gap-4">
              {text('taxLabel', 'Tax Label')}
              {text('taxRate', 'Tax Rate (%)', { type: 'number', min: 0 })}
              <p className="col-span-2 text-[12.5px] text-ink-muted">Leave the rate at 0 (or empty) while the business has no GST registration — no tax is then added to orders.</p>
            </div>
          )}

          {tab === 'seo' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Default SEO Title" className="col-span-2"><Input value={values.seoTitle || ''} onChange={(e) => set('seoTitle', e.target.value)} /></FormField>
              <FormField label="Default SEO Description" className="col-span-2"><Textarea value={values.seoDescription || ''} onChange={(e) => set('seoDescription', e.target.value)} /></FormField>
              <FormField label="Default SEO Keywords" className="col-span-2"><Input value={values.seoKeywords || ''} onChange={(e) => set('seoKeywords', e.target.value)} /></FormField>
            </div>
          )}

          {tab === 'email' && (
            <div className="grid grid-cols-2 gap-4">
              {text('smtpHost', 'SMTP Host')}{text('smtpPort', 'SMTP Port')}{text('smtpUser', 'SMTP User')}{text('smtpFrom', 'From Address')}
              <p className="col-span-2 text-[12.5px] text-ink-muted">Stored for future use. The backend does not send email yet, so these values currently have no effect.</p>
            </div>
          )}

          {tab === 'sms' && (
            <div className="grid grid-cols-2 gap-4">
              {text('smsProvider', 'SMS Provider')}{text('smsApiKey', 'API Key')}
              <p className="col-span-2 text-[12.5px] text-ink-muted">Stored for future use. The backend does not send SMS yet, so these values currently have no effect.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
