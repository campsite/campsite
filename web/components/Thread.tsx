import * as dateFns from 'date-fns';
import { StringValue } from 'google-protobuf/google/protobuf/wrappers_pb';
import { TFunction, i18n } from 'i18next';
import { List, Map } from 'immutable';
import MarkdownIt from 'markdown-it';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { memo, useEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';

import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../gen/proto/campsite/v1/posts_pb';
import { useTranslation } from '../i18n';
import { postsClient } from '../lib/rpc';
import Avatar from './Avatar';
import Card, { CardBody } from './Card';
import Composer from './Composer';
import styles from './Thread.module.css';

const md = new MarkdownIt({ breaks: true });

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

const Time = memo(({ date }: { date: Date }) => {
    const [t, i18n] = useTranslation('time');

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, [now]);

    return <time dateTime={date.toString()} title={formatDateLong(i18n, date)}>{formatDuration(t, i18n, now, date)}</time>;
});

const PostActions = memo(({ post }: { post: modelsPb.Post }) => {
    const [t, i18n] = useTranslation('thread');
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();

    return <ul className={styles['post-actions']}>
        <li>
            <Link href={`/posts/${post.getId()}/reply`}><a><i className='las la-comment-alt'></i> {post.getNumChildren() !== 0 ? t('action-count', { 'count': post.getNumChildren() }) : ''}</a></Link>
        </li>
    </ul>;
});

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

const PostBody = memo(({ tree, collapsible, showActions }: { tree: PostTree, collapsible: boolean, showActions: boolean }) => {
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

        {tree.post.getContent() ?
            <div className={styles['post-content-wrapper']} ref={contentWrapperRef}>
                <div className={styles['post-content']} dangerouslySetInnerHTML={{ __html: md.render(tree.post.getContent().getValue()) }} />
                <div className={styles['post-show-more-overlay']} />
            </div> :
            null}

        <div className={styles['post-show-more']}>
            <Link href={`/posts/${tree.post.getId()}`}><a className='placeholder-link' onClick={(e) => {
                e.preventDefault();
                setCollapsed(false);
            }}>{t('show-more')}</a></Link>
        </div>

        {showActions ? <PostActions post={tree.post}></PostActions> : null}
    </div>;
});

const Parents = memo(({ parents, collapsible, showActions }: { parents: modelsPb.Post[], collapsible: boolean, showActions: boolean }) => {
    const [t, i18n] = useTranslation('thread');

    return <div className={styles['thread-parents']}>
        {parents.length > 0 && parents[0].getParentPostId() ?
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
        }} collapsible={collapsible} showActions={showActions} key={parent.getId()} />)}
    </div>;
});

const ParentPost = memo(({ tree, collapsible, showActions }: { tree: PostTree, collapsible: boolean, showActions: boolean }) => {
    const [t, i18n] = useTranslation('thread');

    return <article className={styles['post-parent']}>
        <div className={styles['post-parent-container']}>
            <div className={styles['post-parent-rail']}>
                <a className={styles['post-avatar']} href='/'><Avatar url='https://github.com/tolfino.png' size='2.5rem' /></a>
                <div className={styles['post-parent-line']}></div>
            </div>
            <PostBody tree={tree} collapsible={collapsible} showActions={showActions} />
        </div>
    </article>;
});

const Children = memo(({ parent, children, maxChildDepth, showActions, onShowMoreChildren }: { parent: modelsPb.Post, children: PostChildren, maxChildDepth: number, showActions: boolean, onShowMoreChildren: (suffix: string[]) => void }) => {
    const [t, i18n] = useTranslation('thread');

    if (parent.getNumChildren() === 1 && children.order.size > 0) {
        return <ChildPost tree={children.items.get(children.order.first())} maxChildDepth={maxChildDepth} showActions={showActions} linear={true} onShowMoreChildren={onShowMoreChildren} />;
    }

    return <div className={styles['post-replies']}>
        {children.order.map(id => {
            const child = children.items.get(id);
            return <ChildPost tree={child} key={child.post.getId()} maxChildDepth={maxChildDepth} showActions={showActions} linear={false} onShowMoreChildren={onShowMoreChildren} />;
        })}
        {children.order.size < parent.getNumChildren() ?
            <div className={styles['post-reply']}>
                <div className={styles['post-reply-gutter']}>
                    <div className={styles['post-reply-line-corner']}></div>
                    <div className={styles['post-reply-line']}></div>
                </div>

                <div className={styles['post-placeholder']}>
                    <Link href={`/posts/${parent.getId()}`}>
                        <a className='placeholder-link' onClick={maxChildDepth > 0 ?
                            (e) => {
                                e.preventDefault();
                                onShowMoreChildren([]);
                            } :
                            null}>{maxChildDepth > 0 ? t('show-more-children') : t('show-thread')}</a>
                    </Link>
                </div>
            </div> :
            null}
    </div>;
});

const ChildPost = memo(({ tree, maxChildDepth, showActions, linear, onShowMoreChildren }: { tree: PostTree, maxChildDepth: number, showActions: boolean, linear: boolean, onShowMoreChildren: (suffix: string[]) => void }) => {
    const [t, i18n] = useTranslation('thread');

    return <article className={`${styles['post-reply']} ${linear ? styles['linear'] : ''}`}>
        <div className={styles['post-reply-gutter']}>
            <div className={styles['post-reply-line-corner']}></div>
            <div className={styles['post-reply-line']}></div>
        </div>
        <div className={styles['post-child-body']}>
            <div className={styles['post-child-container']}>
                <div className={styles['post-child-rail']}>
                    <a className={styles['post-avatar']} href='/'><Avatar url='https://github.com/tolfino.png' size='2.5rem' /></a>
                    {tree.post.getNumChildren() > 0 ? <div className={styles['post-child-line']}></div> : null}
                </div>
                <PostBody tree={tree} collapsible={true} showActions={showActions} />
            </div>
            {tree.post.getNumChildren() > 0 ?
                <Children parent={tree.post} children={tree.children} maxChildDepth={maxChildDepth - 1} showActions={showActions} onShowMoreChildren={(suffix) => {
                    onShowMoreChildren([tree.post.getId(), ...suffix]);
                }} /> :
                null}
        </div>
    </article>;
});

const PrimaryPost = memo(({ post, collapsible, showActions }: { post: modelsPb.Post, collapsible: boolean, showActions: boolean }) => {
    const [t, i18n] = useTranslation('thread');

    const createdAtDate = post.getCreatedAt().toDate();

    return <div className={styles['post-primary']}>
        <div className={styles['post-primary-info']}>
            <a className={styles['post-avatar']} href=''><Avatar url='https://github.com/tolfino.png' size={'2.5rem'} /></a>
            <header className={styles['post-info']}>
                <a className={styles['post-username']} href=''>{post.getAuthor() ? post.getAuthor().getName() : ''}</a><br />
                <span className={styles['post-time']}>
                    <Link href={`/posts/${post.getId()}`}><a>
                        <time dateTime={createdAtDate.toString()}>{formatDateLong(i18n, createdAtDate)}</time></a>
                    </Link>
                </span>
            </header>
        </div>

        {post.getContent() ?
            <div className={styles['post-content-wrapper']}>
                <div className={styles['post-content']} dangerouslySetInnerHTML={{ __html: md.render(post.getContent().getValue()) }} />
            </div> :
            null}

        {showActions ? <PostActions post={post}></PostActions> : null}
    </div >;
});

function parentsFlattened(post: modelsPb.Post): modelsPb.Post[] {
    const parents: modelsPb.Post[] = [];
    let currentParent = post.getParentPost();
    while (currentParent) {
        parents.push(currentParent);
        currentParent = currentParent.getParentPost();
    }
    parents.reverse();
    return parents;
}

const Thread = memo(({ tree, topics,  publisher, collapsible, showActions, maxChildDepth, onShowMoreChildren }: { tree: PostTree, topics: modelsPb.Topic[], publisher: modelsPb.User | null, collapsible: boolean, showActions: boolean, maxChildDepth: number, onShowMoreChildren: (path: string[]) => void }) => {
    const [t, i18n] = useTranslation('thread');

    const parents = parentsFlattened(tree.post);
    return <section className={styles['thread']}>
        {topics.length > 0 ?
            <ul className={styles['topics']}>
                {topics.map(topic =>
                    <li><Link href={`/topics/${topic.getSlug()}`}><a className={styles['topic']}>{topic.getName()}</a></Link></li>)}
            </ul> :
            null}

        <Parents parents={parents} collapsible={collapsible} showActions={showActions} />

        <PrimaryPost post={tree.post} collapsible={collapsible} showActions={showActions} />

        {tree.children.order.size > 0 ?
            <div className={styles['thread-replies']}>
                <div className={styles['thread-replies-start']}>
                    <div className={styles['thread-replies-start-line']}></div>
                </div>
                <Children parent={tree.post} children={tree.children} maxChildDepth={maxChildDepth} showActions={showActions} onShowMoreChildren={(suffix) => {
                    onShowMoreChildren(suffix);
                }} />
            </div> :
            null}
    </section >;
});

export default Thread;
export { parentsFlattened, Parents };
