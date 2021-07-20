import { CSSProperties, ReactElement } from 'react';
import Link from 'next/link';
import styles from './previewButton.module.scss';

type PreviewButtonProps = {
  style?: CSSProperties;
  className: string;
};

export default function PreviewButton({
  style,
  className,
}: PreviewButtonProps): ReactElement {
  return (
    <aside className={`${className} ${styles.preview}`} style={style}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
