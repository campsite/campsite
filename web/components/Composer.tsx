import { memo, useState } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

import { useTranslation } from '../i18n';
import Avatar from './Avatar';
import styles from './Composer.module.css';

interface PostSkeleton {
    content: string;
}

const Composer = memo(({ onSubmit }: { onSubmit: (skel: PostSkeleton) => void }) => {
    const [t, i18n] = useTranslation('composer');

    const [content, setContent] = useState('');

    return <div className={styles['composer']}>
        <div className={styles['container']}>
            <div className={styles['rail']}>
                <a className={styles['avatar']} href='/'><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size='2.5rem' /></a>
            </div>
            <form className={styles['body']} onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    content: content,
                });
                setContent('');
            }}>
                <TextareaAutosize className={styles['content']} placeholder={t('write-something')} value={content} onChange={e => setContent((e.target as HTMLTextAreaElement).value)} />
                <div className={styles['controls']}>
                    <button type="submit">{t('post')}</button>
                </div>
            </form>
        </div>
    </div>;
})

export default Composer;
