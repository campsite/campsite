import { Message } from 'google-protobuf';
import { List as ImmList, Map as ImmMap } from 'immutable';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Card from '../../components/Card';
import { PostChildren, PostTree } from '../../components/Thread';
import Thread from '../../components/Thread';
import * as modelsPb from '../../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { postsClient } from '../../lib/rpc';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const req = new postsPb.GetPostRequest();
    req.setPostId(context.params.id as string);
    req.setParentDepth(5);
    const resp = await postsClient.getPost(req, {
        authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
    });

    return {
        props: {
            raw: resp.getPost().toArray(),
        }
    };
};

function mergeChildren(newer: PostChildren, older: PostChildren): PostChildren {
    const olderOrder = older.order.toArray();

    const existing = new Set(olderOrder);
    const newIDs = newer.order.toArray().filter(id => !existing.has(id));

    const order = newIDs.concat(olderOrder);

    let items: ImmMap<string, PostTree> = ImmMap();
    for (const id of newIDs) {
        items = items.set(id, newer.items.get(id));
    }

    for (const id of olderOrder) {
        const olderChild = older.items.get(id);
        if (newer.items.has(id)) {
            const newerChild = newer.items.get(id);
            items = items.set(id, {
                post: newerChild.post,
                children: mergeChildren(newerChild.children, olderChild.children),
            });
        } else {
            items = items.set(id, olderChild);
        }
    }

    return {
        order: ImmList(order),
        items: items,
    };
}

function postToTree(post: modelsPb.Post): PostTree {
    const posts: modelsPb.Post[] = [post];
    while (posts[posts.length - 1].getParentPost()) {
        posts.push(posts[posts.length - 1].getParentPost());
    }

    const p = posts.pop();
    const root: PostTree = {
        post: p,
        children: PostChildren(),
    };
    let current = root;

    while (posts.length > 0) {
        const p = posts.pop();
        p.clearParentPost();

        let nextCurrent: PostTree = {
            post: p,
            children: PostChildren(),
        };
        current.children.items = current.children.items.set(p.getId(), nextCurrent);
        current.children.order = current.children.order.push(p.getId());
        current = nextCurrent;
    }

    return root;
}

function postsToChildren(rootID: string, posts: modelsPb.Post[]): PostChildren {
    let children: PostChildren = PostChildren();
    const nodes = new Map();

    for (const post of posts) {
        const node = postToTree(post);
        nodes.set(post.getId(), node);

        const parentID = post.getParentPostId().getValue();
        if (parentID === rootID) {
            // Attach to root.
            children = {
                order: children.order.push(post.getId()),
                items: children.items.set(post.getId(), node),
            };
        } else if (nodes.has(parentID)) {
            // Attach to child.
            const parent = nodes.get(parentID);
            parent.children.order = parent.children.order.push(post.getId());
            parent.children.items = parent.children.items.set(post.getId(), node);
        }
    }

    return children;
}

export default function Post(props: { raw: Message.MessageArray }) {
    const router = useRouter();
    const { id } = router.query;

    const [post, setPost]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(new (modelsPb.Post as any)(props.raw));
    const [children, setChildren]: [PostChildren, Dispatch<SetStateAction<PostChildren>>] = useState(PostChildren());
    const [descendantsToken, setDescendantsToken]: [string, Dispatch<SetStateAction<string>>] = useState(null);

    const maxChildDepth = 3;
    const toplevelLimit = 50;

    useEffect(() => {
        if (post !== null && post.getId() === id) {
            return;
        }

        setChildren(PostChildren());
        setDescendantsToken(null);
        setPost(null);

        const req = new postsPb.GetPostRequest();
        req.setPostId(id as string);
        req.setParentDepth(5);
        const call = postsClient.getPost(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setPost(resp.getPost());
        });
        return () => call.cancel();
    }, [id]);

    useEffect(() => {
        const req = new postsPb.GetPostChildrenRequest();
        req.setPostId(id as string);
        req.setChildDepth(maxChildDepth);
        req.setChildLimit(3);
        req.setToplevelLimit(toplevelLimit);

        const call = postsClient.getPostChildren(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setChildren(postsToChildren(id as string, resp.getPostsList()));
            setDescendantsToken(resp.getDescendantsPageToken());
        });
        return () => call.cancel();
    }, [post]);

    useEffect(() => {
        if (descendantsToken === null) {
            return;
        }

        const req = new postsPb.GetPostDescendantsRequest();
        req.setPostId(id as string);
        req.setChildDepth(maxChildDepth);
        req.setLimit(10);
        req.setWait(true);
        req.setPageToken(descendantsToken);

        const call = postsClient.getPostDescendants(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            let newChildren: PostChildren = PostChildren();
            for (const post of resp.getPostsList()) {
                const childTree = postToTree(post);
                newChildren = mergeChildren(newChildren, PostChildren([childTree]));
            }
            setChildren(mergeChildren(newChildren, children));
            setDescendantsToken(resp.getPageTokens().getPrev());
        });
        return () => call.cancel();
    }, [descendantsToken]);

    if (!post) {
        return <div>Loading</div>;
    }

    return <div>
        <Head>
            <title>{post.getAuthor().getName()}: {post.getContent().getValue()}</title>
        </Head>
        <Card>
            <Thread
                tree={{
                    post: post,
                    children: children,
                }}
                maxChildDepth={maxChildDepth}
                onShowMoreChildren={(path) => {
                    const parentID = path.length > 0 ? path[path.length - 1] : id as string;

                    let current = {
                        post: post,
                        children: children,
                    };
                    for (const part of path) {
                        current = current.children.items.get(part);
                    }

                    const req = new postsPb.GetPostChildrenRequest();
                    req.setPostId(parentID);
                    req.setChildDepth(maxChildDepth - path.length);
                    req.setChildLimit(3);
                    req.setToplevelLimit(toplevelLimit);
                    req.setPageToken(
                        current.children.order.size > 0 ?
                        current.children.items.get(current.children.order.last()).post.getParentNextPageToken() :
                        '');

                    const call = postsClient.getPostChildren(req, {
                        authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
                    }, (err, resp) => {
                        const root = {
                            post: post,
                            children: {...children},
                        };
                        let current = root;
                        for (const part of path) {
                            let next = {...current.children.items.get(part)};
                            current.children = {
                                order: current.children.order,
                                items: current.children.items.set(part, next),
                            };
                            current = next;
                        }
                        current.children = mergeChildren(current.children, postsToChildren(parentID, resp.getPostsList()));
                        setChildren(root.children);
                    });
                }} />
        </Card>
    </div>;
}
