import { Link } from 'react-router-dom';

/** Section title with optional supporting line and a right-hand action link. */
export default function SectionHeading({ title, sub, action, center = false, rule = false, as: Tag = 'h2' }) {
  return (
    <div className={`sec-head ${center ? 'sec-head--center' : ''}`}>
      <div>
        <Tag className="sec-head-title">{title}</Tag>
        {sub && <p className="sec-head-sub">{sub}</p>}
        {rule && <span className="sec-head-rule" aria-hidden="true" />}
      </div>
      {action && <Link to={action.to} className="link-u">{action.label}</Link>}
    </div>
  );
}
