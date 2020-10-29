import Link from "next/link";
import { memo } from "react";

import Avatar from "./Avatar";
import styles from './SiteHeader.module.css';

const SiteHeader = memo(({}: {}) => {
    return <header className={styles['site-header']}>
        <Link href="/">
            <a className={styles['brand']}>Campsite</a>
        </Link>
        <div className={styles['right-menu']}>
            <div className={styles['notifications']}>
                <i className="la la-bell" />
            </div>
            <Avatar url="https://github.com/tolfino.png" size="2.5em" />
        </div>
    </header>;
});

export default SiteHeader;
