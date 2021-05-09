import common from '@styles/common.module.scss';

import styles from './header.module.scss';

const Header: React.FC = () => (
  <header className={`${styles.header} ${common.container}`}>
    <img src="/logo.svg" alt="logo" />
  </header>
);

export default Header;
