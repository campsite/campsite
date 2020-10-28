import { memo, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

import { useTranslation } from '../i18n';
import Avatar from './Avatar';
import styles from './Composer.module.css';

export interface PostSkeleton {
    content: string;
}

const Composer = memo(({ onSubmit }: { onSubmit: (skel: PostSkeleton) => void }) => {
    const [t, i18n] = useTranslation('composer');

    const [content, setContent] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        textareaRef.current.focus();
    }, []);

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
                <TextareaAutosize ref={textareaRef} className={styles['content']} placeholder={t('write-something')} value={content} onChange={e => setContent((e.target as HTMLTextAreaElement).value)} />
                <div className={styles['controls']}>
                    <button type="submit">{t('post')}</button>
                </div>
            </form>
        </div>
    </div>;
})

export default Composer;
