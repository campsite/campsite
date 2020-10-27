import Link from "next/link";
import { memo } from "react";

import styles from './SiteHeader.module.css';

const SiteHeader = memo(({}: {}) => {
    return <header className={styles['site-header']}>
        <Link href="/">
            <a className={styles['brand']}>Campsite</a>
        </Link>
    </header>;
});

export default SiteHeader;
