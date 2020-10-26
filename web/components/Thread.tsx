import * as dateFns from 'date-fns';
import { TFunction, i18n } from 'i18next';
import { List, Map } from 'immutable';
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react';

import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import { useTranslation } from '../i18n';
import styles from './Thread.module.css';

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

function PostActions({ post }: { post: modelsPb.Post }) {
    const [t, i18n] = useTranslation('thread');

    return <ul className={styles['post-actions']}>
        <li><a href='/'><i className='las la-comment-alt'></i> {post.getNumChildren() !== 0 ? t('action-count', { 'count': post.getNumChildren() }) : ''}</a></li>
    </ul>;
}

function Avatar({ url, size }: { url: string, size: string }) {
    return <img src={url} className='avatar' style={{ height: size, width: size }} />;
}

export interface PostChildren {
    order: List<string>,
    items: Map<string, PostTree>,
}

export function PostChildren(posts?: PostTree[]): PostChildren {
    let order = List();
    let items: Map<string, PostTree> = Map();

    if (posts) {
        for (const post of posts) {
            order = order.push(post.post.getId());
            items = items.set(post.post.getId(), post);
        }
    }

    return {
        order: order,
        items: items,
    };
}

export interface PostTree {
    post: modelsPb.Post,
    children: PostChildren,
}

function PostBody({ tree, collapsible }: { tree: PostTree, collapsible?: boolean }) {
    const [t, i18n] = useTranslation('thread');

    const contentWrapperRef = useRef(null);

    const [collapsed, setCollapsed] = useState(collapsible);
    const [canCollapse, setCanCollapse] = useState(true);

    useEffect(() => {
        setCanCollapse(contentWrapperRef.current.offsetHeight < contentWrapperRef.current.scrollHeight);
    });

    return <div className={`${styles['post-secondary-body']} ${canCollapse && collapsed ? styles['collapsed'] : ''}`}>
        <header className={styles['post-info']}>
            <a className={styles['post-username']} href=''>{tree.post.getAuthor() ? tree.post.getAuthor().getName() : ''}</a>
            <span className={styles['post-time']}>{' · '}
                <Link href={`/posts/${tree.post.getId()}`}><a><Time date={tree.post.getCreatedAt().toDate()}></Time></a></Link>
            </span>
        </header>

        <div className={styles['post-content-wrapper']} ref={contentWrapperRef}>
            <div className={styles['post-content']}><p>{tree.post.getContent() ? tree.post.getContent().getValue() : ''}</p></div>
            <div className={styles['post-show-more-overlay']} />
        </div>

        <div className={styles['post-show-more']}>
            <Link href={`/posts/${tree.post.getId()}`}><a className='placeholder-link' onClick={(e) => {
                e.preventDefault();
                setCollapsed(false);
            }}>{t('show-more')}</a></Link>
        </div>

        <PostActions post={tree.post}></PostActions>
    </div>;
}

function ParentPost({ tree, collapsible }: { tree: PostTree, collapsible?: boolean }) {
    const [t, i18n] = useTranslation('thread');

    return <article className={styles['post-parent']}>
        <div className={styles['post-parent-container']}>
            <div className={styles['post-parent-rail']}>
                <a className={styles['post-avatar']} href='/'><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size='2.5rem' /></a>
                <div className={styles['post-parent-line']}></div>
            </div>
            <PostBody tree={tree} collapsible={collapsible} />
        </div>
    </article>;
}

function Children({ children, numChildren }: { children: PostChildren, numChildren: number }) {
    const [t, i18n] = useTranslation('thread');

    return <div className={styles['post-replies']}>
        <div className={styles['post-replies-pre-post']}>
            <div className={styles['post-reply-line']}></div>
        </div>
        {children.order.map(id => {
            const child = children.items.get(id);
            return <ChildPost tree={child} key={child.post.getId()} />;
        })}
        {children.order.size < numChildren ?
            <div className={styles['post-placeholder']}>
                <a href='/' className='placeholder-link'>{t('show-more-children')}</a>
            </div> :
            null}
    </div>;
}

function ChildPost({ tree }: { tree: PostTree }) {
    const [t, i18n] = useTranslation('thread');

    return <article className={styles['post-reply']}>
        <div className={styles['post-reply-line']}></div>
        <div className={styles['post-secondary-body']}>
            <div className={styles['post-child-container']}>
                <div className={styles['post-child-rail']}>
                    <a className={styles['post-avatar']} href='/'><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size='2.5rem' /></a>
                    {tree.post.getNumChildren() > 0 ? <div className={styles['post-child-gutter']}><div className={styles['post-gutter-line']}></div></div> : null}
                </div>
                <PostBody tree={tree} collapsible={true} />
            </div>
            {tree.post.getNumChildren() > 0 ?
                <Children children={tree.children} numChildren={tree.post.getNumChildren()} /> :
                null}
        </div>
    </article>;
}

export default function Thread({ tree, collapsible }: { tree: PostTree, collapsible?: boolean }) {
    const [t, i18n] = useTranslation('thread');

    const parents: modelsPb.Post[] = [];

    let currentParent = tree.post.getParentPost();
    while (currentParent) {
        parents.push(currentParent);
        currentParent = currentParent.getParentPost();
    }

    parents.reverse();
    const hasMoreContext = parents.length > 0 && parents[0].getParentPostId();

    const createdAtDate = tree.post.getCreatedAt().toDate();

    return <section className={styles['thread']}>
        <div className={styles['thread-parents']}>
            {hasMoreContext ?
                <div className={styles['post-parent']}>
                    <div className={styles['post-parent-container']}>
                        <div className={styles['post-secondary-rail']}>
                            <div className={styles['post-parent-gutter']}><div className={`${styles['post-gutter-line']} ${styles['post-gutter-line-dashed']}`}></div></div>
                        </div>
                        <div className={styles['post-secondary-main']}>
                            <div className={styles['post-context-placeholder']}>
                                <Link href={`/posts/${parents[0].getId()}`}><a className='placeholder-link'>{t('show-more-parents')}</a></Link>
                            </div>
                        </div>
                    </div>
                </div> :
                null}

            {parents.map(parent => <ParentPost tree={{
                post: parent,
                children: PostChildren(),
            }} collapsible={collapsible} key={parent.getId()} />)}
        </div>

        <div className={styles['post-primary']}>
            <div className={styles['post-primary-info']}>
                <a className={styles['post-avatar']} href=''><Avatar url='https://upload.wikimedia.org/wikipedia/commons/c/cd/Portrait_Placeholder_Square.png' size={'2.5rem'} /></a>
                <header className={styles['post-info']}>
                    <a className={styles['post-username']} href=''>{tree.post.getAuthor() ? tree.post.getAuthor().getName() : ''}</a><br />
                    <span className={styles['post-time']}>
                        <Link href={`/posts/${tree.post.getId()}`}><a>
                            <time dateTime={createdAtDate.toString()}>{formatDateLong(i18n, createdAtDate)}</time></a>
                        </Link>
                    </span>
                </header>
            </div>

            <div className={styles['post-content-wrapper']}>
                <div className={styles['post-content']}>{tree.post.getContent() ? tree.post.getContent().getValue() : ''}</div>
            </div>

            <PostActions post={tree.post}></PostActions>
        </div >

        {tree.children.order.size > 0 ?
            <div className={styles['thread-replies']}>
                <Children children={tree.children} numChildren={tree.post.getNumChildren()} />
            </div> :
            null}
    </section >;
}
