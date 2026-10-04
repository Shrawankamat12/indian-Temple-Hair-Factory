import { useState } from 'react';
import wholesaleApi from '../../api/wholesale.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Drawer, Button, Textarea, Select, StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDate, formatDateTime } from '../../lib/format.js';

const STATUSES = ['new', 'contacted', 'in_progress', 'converted', 'closed'];
const label = (s) => s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const TYPES = { wholesale: 'Wholesale', bulk_order: 'Bulk order', export: 'Export', private_label: 'Private label', general: 'General' };

export default function WholesaleLeads() {
  const entity = useEntityList(wholesaleApi, { searchKeys: ['businessName', 'contactName', 'email', 'phone', 'country', 'subject'] });
  const toast = useToast();
  const [viewing, setViewing] = useState(null);
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');

  const columns = [
    { key: 'contactName', label: 'Name', sortable: true },
    { key: 'businessName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'country', label: 'Country' },
    { key: 'enquiryType', label: 'Type', render: (r) => TYPES[r.enquiryType] || 'Wholesale' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'new'} /> },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
  ];

  const open = (row) => { setViewing(row); setStatus(row.status || 'new'); setNotes(row.notes || ''); };
  const save = async () => {
    try { await entity.update(viewing._id || viewing.id, { status, notes }); toast.success('Enquiry updated'); setViewing(null); }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not update enquiry'); }
  };

  return (
    <div>
      <EntityListPage title="Wholesale Enquiries" subtitle="Wholesale and export enquiries from the storefront." entity={entity} columns={columns}
        onView={open} exportFilename="wholesale-enquiries"
        filterOptions={[{ key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: label(s) })) }]}
        statusOptions={STATUSES.map((s) => ({ value: s, label: label(s) }))} />
      <Drawer open={!!viewing} onClose={() => setViewing(null)} title={viewing?.subject || viewing?.businessName || 'Enquiry'} footer={<>
        <Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>
        <Button onClick={save}>Save</Button>
      </>}>
        {viewing && (
          <div className="flex flex-col gap-3 text-[13px]">
            <div><span className="font-semibold">{viewing.contactName}</span>{viewing.businessName ? ` · ${viewing.businessName}` : ''}</div>
            <div>{viewing.email} · {viewing.phone}{viewing.country ? ` · ${viewing.country}` : ''}</div>
            <div className="text-ink-muted">{TYPES[viewing.enquiryType] || 'Wholesale'} · received {formatDateTime(viewing.createdAt)}</div>
            {viewing.estimatedMOQ && <div><span className="font-semibold">Estimated volume:</span> {viewing.estimatedMOQ}</div>}
            <p className="whitespace-pre-wrap bg-surface-muted rounded-md p-3 text-ink-muted">{viewing.message || viewing.requirement || '—'}</p>
            <label className="font-semibold" htmlFor="enq-status">Status</label>
            <Select id="enq-status" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select>
            <label className="font-semibold" htmlFor="enq-notes">Internal notes</label>
            <Textarea id="enq-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
