import * as modelsPb from '../../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { useRouter } from 'next/router';
import { postsClient } from '../../lib/rpc';

import Thread from '../../components/Thread';
import { PostChildren, PostTree } from '../../components/Thread';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Map as ImmMap, List as ImmList } from 'immutable';

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

export default function Post() {
    const router = useRouter();
    const { id } = router.query;

    const [post, setPost]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(null);
    const [children, setChildren]: [PostChildren, Dispatch<SetStateAction<PostChildren>>] = useState(PostChildren());
    const [descendantsToken, setDescendantsToken]: [string, Dispatch<SetStateAction<string>>] = useState("");

    useEffect(() => {
        setChildren(PostChildren());
        setDescendantsToken('');
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
        req.setChildDepth(5);
        req.setLimit(10);

        const call = postsClient.getPostChildren(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            let newChildren: PostChildren = PostChildren();
            const nodes = new Map();

            for (const post of resp.getPostsList()) {
                const node = postToTree(post);
                nodes.set(post.getId(), node);

                const parentID = post.getParentPostId().getValue();
                if (parentID === id) {
                    // Attach to root.
                    newChildren = {
                        order: newChildren.order.push(post.getId()),
                        items: newChildren.items.set(post.getId(), node),
                    };
                } else if (nodes.has(parentID)) {
                    // Attach to child.
                    const parent = nodes.get(parentID);
                    parent.children.order = parent.children.order.push(post.getId());
                    parent.children.items = parent.children.items.set(post.getId(), node);
                }
            }

            setChildren(newChildren);
            setDescendantsToken(resp.getDescendantsPageToken());
        });
        return () => call.cancel();
    }, [post]);

    useEffect(() => {
        if (descendantsToken === '') {
            return;
        }

        const req = new postsPb.GetPostDescendantsRequest();
        req.setPostId(id as string);
        req.setChildDepth(5);
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

    return <div style={{ width: '600px', margin: '0 auto' }}>
        <Thread tree={{
            post: post,
            children: children,
        }}></Thread>
    </div>;
}
