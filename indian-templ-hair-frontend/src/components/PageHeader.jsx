import Breadcrumb from './Breadcrumb';

/**
 * Page title banner. Dark espresso band; when `image` is given it fills the right side with a
 * gradient fade (category / policy / About hero style). Without an image it is a plain dark band.
 */
export default function PageHeader({ crumbs = [], title, lede, image, tall = false }) {
  return (
    <header className={`pagehead ${image ? 'pagehead--img' : ''} ${tall ? 'pagehead--tall' : ''}`}>
      {image && <img className="pagehead-bg" src={image} alt="" />}
      <div className="container pagehead-inner">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="pagehead-title">{title}</h1>
        {lede && <p className="pagehead-lede">{lede}</p>}
      </div>
    </header>
  );
}
