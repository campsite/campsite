import { memo } from 'react';

import styles from './Avatar.module.css';

const Avatar = memo(({ url, size }: { url: string, size: string }) => {
    return <img src={url} className={styles['avatar']} style={{ height: size, width: size }} />;
});

export default Avatar;
