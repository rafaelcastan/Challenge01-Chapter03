import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <a href="/">
          <img src="/logo.svg" alt="logo" />
        </a>
      </div>
    </div>
  );
}
