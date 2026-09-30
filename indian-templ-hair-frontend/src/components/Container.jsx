import { cx } from '../lib/ui';

/** Centered page container with fluid gutters. `narrow` gives a reading-width column. */
export default function Container({ as: Tag = 'div', narrow = false, className = '', ...rest }) {
  return (
    <Tag
      className={cx('mx-auto w-full px-4 sm:px-6 lg:px-10', narrow ? 'max-w-[820px]' : 'max-w-site', className)}
      {...rest}
    />
  );
}
