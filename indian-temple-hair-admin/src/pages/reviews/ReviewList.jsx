import { useState } from 'react';
import reviewApi from '../../api/review.api.js';
import useEntityList from '../../hooks/useEntityList.js';
import EntityListPage from '../../components/crud/EntityListPage.jsx';
import { Tabs, Modal, Button, Textarea, Badge, StatusBadge } from '../../components/ui/index.js';
import { useToast } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/format.js';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hidden', label: 'Hidden' },
];

export default function ReviewList() {
  const [tab, setTab] = useState('pending');
  const entity = useEntityList(reviewApi, { initialFilters: { status: 'pending' }, searchKeys: ['productName', 'customerName', 'customerEmail', 'comment', 'title'] });
  const toast = useToast();
  const [replyRow, setReplyRow] = useState(null);
  const [replyText, setReplyText] = useState('');

  const changeTab = (v) => { setTab(v); entity.setFilters({ status: v }); };
  const counts = TABS.reduce((acc, t) => { acc[t.value] = entity.allRows.filter((r) => r.status === t.value).length; return acc; }, {});
  const idOf = (r) => r._id || r.id;

  const columns = [
    { key: 'productName', label: 'Product' },
    { key: 'customerName', label: 'Customer', render: (r) => <span>{r.customerName}{r.customerEmail ? <span className="block text-[11.5px] text-ink-muted">{r.customerEmail}</span> : null}</span> },
    { key: 'orderNumber', label: 'Order', render: (r) => r.orderNumber ? `#${r.orderNumber}` : '—' },
    { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0)) },
    { key: 'comment', label: 'Review', render: (r) => <span className="block max-w-xs">{r.title ? <strong className="block">{r.title}</strong> : null}<span className="line-clamp-2">{r.comment}</span></span> },
    { key: 'verifiedPurchase', label: 'Verified', render: (r) => (r.verifiedPurchase ? <Badge tone="success">Verified</Badge> : <Badge tone="neutral">No</Badge>) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'pending'} /> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
  ];

  const setStatus = async (row, status, msg) => {
    try { await entity.update(idOf(row), { status }); toast.success(msg); }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not update review'); }
  };
  const del = async (row) => {
    if (!window.confirm('Delete this review permanently? The product rating will be recalculated.')) return;
    try { await entity.remove(idOf(row)); toast.success('Review deleted'); }
    catch (e) { toast.error(e?.response?.data?.message || 'Could not delete review'); }
  };

  const submitReply = async () => {
    try {
      await entity.update(idOf(replyRow), { reply: replyText });
      toast.success('Reply saved — it shows under the review on the product page');
      setReplyRow(null); setReplyText('');
    } catch (e) { toast.error(e?.response?.data?.message || 'Could not save reply'); }
  };

  return (
    <div>
      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.value] }))} active={tab} onChange={changeTab} />
      <EntityListPage
        title="Reviews"
        subtitle="Only approved reviews appear on the storefront. Ratings are recalculated from approved reviews whenever you change one."
        entity={entity}
        columns={columns}
        exportFilename="reviews"
      />
      {entity.rows.length > 0 && (
        <div className="flex flex-col gap-2 mt-3 mb-1">
          {entity.rows.map((r) => (
            <div key={idOf(r)} className="flex flex-wrap items-center gap-1.5 bg-surface border border-border-soft rounded-md px-2.5 py-1.5">
              <Badge tone="neutral" className="max-w-[160px] truncate">{r.customerName}</Badge>
              <span className="text-[12px] text-ink-muted max-w-[200px] truncate">{r.productName}</span>
              <span className="flex-1" />
              {r.status !== 'approved' && <Button size="sm" variant="secondary" onClick={() => setStatus(r, 'approved', 'Review approved')}>Approve</Button>}
              {r.status !== 'rejected' && <Button size="sm" variant="secondary" onClick={() => setStatus(r, 'rejected', 'Review rejected')}>Reject</Button>}
              {r.status !== 'hidden' && <Button size="sm" variant="secondary" onClick={() => setStatus(r, 'hidden', 'Review hidden')}>Hide</Button>}
              <Button size="sm" variant="subtle" onClick={() => { setReplyRow(r); setReplyText(r.reply || ''); }}>Reply</Button>
              <Button size="sm" variant="danger" onClick={() => del(r)}>Delete</Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!replyRow} onClose={() => setReplyRow(null)} title="Reply to Review" footer={<>
        <Button variant="secondary" onClick={() => setReplyRow(null)}>Cancel</Button>
        <Button onClick={submitReply}>Save Reply</Button>
      </>}>
        {replyRow && (
          <div className="flex flex-col gap-3">
            <div className="bg-surface-muted rounded-md p-3 text-[13px]">
              <p className="font-semibold mb-1">{replyRow.customerName} — {'★'.repeat(replyRow.rating || 0)}</p>
              <p className="text-ink-muted">{replyRow.comment}</p>
            </div>
            <Textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a public reply…" />
          </div>
        )}
      </Modal>
    </div>
  );
}
