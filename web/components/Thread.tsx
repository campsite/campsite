import styles from './Thread.module.css';
import Link from 'next/link'
import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { TFunction, i18n } from 'i18next';
import * as dateFns from 'date-fns';

function formatDateLong(i18n: i18n, date: Date): string {
    return `${(new Intl.DateTimeFormat(i18n.language, {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })).format(date)} · ${(new Intl.DateTimeFormat(i18n.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })).format(date)}`;
}

function formatDuration(t: TFunction, i18n: i18n, left: Date, right: Date): string {
    const hours = dateFns.differenceInHours(left, right);
    if (hours < 24) {
        if (hours > 0) {
            return t('hours', { hours: hours });
        }
        return t('minutes', { minutes: dateFns.differenceInMinutes(left, right) });
    }

    if (left.getFullYear() === right.getFullYear()) {
        return (new Intl.DateTimeFormat(i18n.language, {
            month: 'short',
            day: 'numeric',
        })).format(right);
    }

    return (new Intl.DateTimeFormat(i18n.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })).format(right);
}

function Time({ date }: { date: Date }) {
    const [t, i18n] = useTranslation('time');

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, [now]);

    return <time dateTime={date.toString()} title={formatDateLong(i18n, date)}>{formatDuration(t, i18n, now, date)}</time>;
}

function PostActions({ postPb }: { postPb: modelsPb.Post }) {
    const [t, i18n] = useTranslation('thread');

    return <ul className={styles['post-actions']}>
        <li><a href='/'><i className='las la-comment-alt'></i> {postPb.getNumChildren() !== 0 ? t('action-count', { 'count': postPb.getNumChildren() }) : ''}</a></li>
    </ul>;
}

function Avatar({ url, size }: { url: string, size: string }) {
    return <img src={url} className='avatar' style={{ height: size, width: size }} />;
}

function SecondaryPost({ postPb, collapsible }: { postPb: modelsPb.Post, collapsible?: boolean }) {
    const [t, i18n] = useTranslation('thread');

    const contentWrapperRef = useRef(null);

    const [collapsed, setCollapsed] = useState(collapsible);
    const [canCollapse, setCanCollapse] = useState(true);

    useEffect(() => {
        setCanCollapse(contentWrapperRef.current.offsetHeight < contentWrapperRef.current.scrollHeight);
    });

    return <article className={`${styles['post-secondary']} ${canCollapse && collapsed ? styles['collapsed'] : ''}`}>
        <div className={styles['post-secondary-container']}>
            <div className={styles['post-secondary-rail']}>
                <a className={styles['post-avatar']} href='/'><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size='2.5rem' /></a>
                <div className={styles['post-secondary-gutter']}><div className={styles['post-gutter-line']} /></div>
            </div>
            <div className={styles['post-secondary-main']}>
                <div className={styles['post-secondary-body']}>
                    <header className={styles['post-info']}>
                        <a className={styles['post-username']} href=''>{postPb.getAuthor() ? postPb.getAuthor().getName() : ''}</a>
                        <span className={styles['post-time']}>{' · '}
                            <Link href={`/posts/${postPb.getId()}`}><a><Time date={postPb.getCreatedAt().toDate()}></Time></a></Link>
                        </span>
                    </header>

                    <div className={styles['post-content-wrapper']} ref={contentWrapperRef}>
                        <div className={styles['post-content']}><p>{postPb.getContent() ? postPb.getContent().getValue() : ''}</p></div>
                        <div className={styles['post-show-more-overlay']} />
                    </div>

                    <div className={styles['post-show-more']}>
                        <Link href={`/posts/${postPb.getId()}`}><a className='placeholder-link' onClick={(e) => {
                            e.preventDefault();
                            setCollapsed(false);
                        }}>{t('show-more')}</a></Link>
                    </div>

                    <PostActions postPb={postPb}></PostActions>
                </div>

                {postPb.getChildrenList().length > 0 ?
                    <div className={styles['post-replies']}>
                        {postPb.getChildrenList().map(child => <SecondaryPost postPb={child} key={child.getId()} />)}
                        <div className={styles['post-placeholder']}>
                            <a href='/' className='placeholder-link'>{t('show-more-children')}</a>
                        </div>
                    </div> :
                    null}
            </div>
        </div>
    </article>;
}

export default function Thread({ postPb, collapsible }: { postPb: modelsPb.Post, collapsible?: boolean }) {
    const [t, i18n] = useTranslation('thread');

    const parents = [];

    let currentParent = postPb.getParentPost();
    while (currentParent) {
        parents.push(currentParent);
        currentParent = currentParent.getParentPost();
    }

    parents.reverse();
    const hasMoreContext = parents.length > 0 && parents[0].parentPostID;

    const createdAtDate = postPb.getCreatedAt().toDate();

    return <section className={styles['thread']}>
        <div className={styles['post-parents']}>
            {hasMoreContext ?
                <div className={styles['post-secondary']}>
                    <div className={styles['post-secondary-container']}>
                        <div className={styles['post-secondary-rail']}>
                            <div className={styles['post-secondary-gutter']}><div className={`${styles['post-gutter-line']} ${styles['post-gutter-line-dashed']}`}></div></div>
                        </div>
                        <div className={styles['post-secondary-main']}>
                            <div className={styles['post-context-placeholder']}>
                                <Link href={`/posts/${parents[0].getId()}`}><a className='placeholder-link'>{t('show-more-parents')}</a></Link>
                            </div>
                        </div>
                    </div>
                </div> :
                null}

            {parents.map(parent => <SecondaryPost postPb={parent} collapsible={collapsible} key={parent.getId()} />)}
        </div>

        <div className={styles['post-primary']}>
            <div className={styles['post-primary-info']}>
                <a className={styles['post-avatar']} href=''><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size={'2.5rem'} /></a>
                <header className={styles['post-info']}>
                    <a className={styles['post-username']} href=''>{postPb.getAuthor() ? postPb.getAuthor().getName() : ''}</a><br />
                    <span className={styles['post-time']}>
                        <Link href={`/posts/${postPb.getId()}`}><a>
                            <time dateTime={createdAtDate.toString()}>{formatDateLong(i18n, createdAtDate)}</time></a>
                        </Link>
                    </span>
                </header>
            </div>

            <div className={styles['post-content-wrapper']}>
                <div className={styles['post-content']}>{postPb.getContent() ? postPb.getContent().getValue() : ''}</div>
            </div>

            <PostActions postPb={postPb}></PostActions>
        </div >

        {postPb.getChildrenList().length > 0 ?
            <div className={styles['post-replies']}>
                {postPb.getChildrenList().map(child => <SecondaryPost postPb={child} key={child.getId()} />)}
            </div> :
            null}
    </section >;
}
