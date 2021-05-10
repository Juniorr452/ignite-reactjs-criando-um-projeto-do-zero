import common from '@styles/common.module.scss';
import Link from 'next/link';

import styles from './header.module.scss';

const Header: React.FC = () => (
  <header className={`${styles.header} ${common.container}`}>
    <Link href="/">
      <a>
        <img src="/logo.svg" alt="logo" />
      </a>
    </Link>
  </header>
);

export default Header;
