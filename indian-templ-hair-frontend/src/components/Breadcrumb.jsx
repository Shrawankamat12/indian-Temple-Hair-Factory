import { Link } from 'react-router-dom';

export default function Breadcrumb({ crumbs = [], light = false }) {
  return (
    <nav className={`crumbs ${light ? 'crumbs--light' : ''}`} aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`}>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
