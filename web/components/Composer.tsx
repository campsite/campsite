import { memo } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

import { useTranslation } from '../i18n';
import Avatar from './Avatar';
import styles from './Composer.module.css';

const Composer = memo(({ }: {}) => {
    const [t, i18n] = useTranslation('composer');

    return <div className={styles['composer']}>
        <div className={styles['container']}>
            <div className={styles['rail']}>
                <a className={styles['avatar']} href='/'><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size='2.5rem' /></a>
            </div>
            <form className={styles['body']}>
                <TextareaAutosize className={styles['content']} placeholder={t('write-something')} />
                <div className={styles['controls']}>
                    <button type="submit">{t('post')}</button>
                </div>
            </form>
        </div>
    </div>;
})

export default Composer;
