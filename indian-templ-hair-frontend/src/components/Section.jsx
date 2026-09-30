import { cx } from '../lib/ui';

const TONES = {
  default: '',
  alt: 'bg-sand',
  white: 'bg-white',
  dark: 'on-dark bg-espresso text-cream',
};

/** Vertical rhythm wrapper. `tight` for denser storefront sections. */
export default function Section({ tone = 'default', tight = false, as: Tag = 'section', className = '', ...rest }) {
  return (
    <Tag
      className={cx(tight ? 'py-9 sm:py-12 lg:py-16' : 'py-14 sm:py-20 lg:py-24', TONES[tone], className)}
      {...rest}
    />
  );
}
