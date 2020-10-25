import * as modelsPb from '../../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { useRouter } from 'next/router';
import { postsClient } from '../../lib/rpc';

import Thread from '../../components/Thread';
import { PostChildren, PostTree } from '../../components/Thread';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function mergeChildren(newer: PostChildren, older: PostChildren): PostChildren {
    const existing = new Set(older.order);
    const newIDs = newer.order.filter(id => !existing.has(id));

    const order = [...newIDs, ...older.order];
    const items = new Map();
    for (const id of newIDs) {
        items.set(id, newer.items.get(id));
    }

    for (const id of older.order) {
        const olderChild = older.items.get(id);
        if (newer.items.has(id)) {
            const newerChild = newer.items.get(id);
            items.set(id, {
                post: newerChild.post,
                children: mergeChildren(newerChild.children, olderChild.children),
            });
        } else {
            items.set(id, olderChild);
        }
    }

    return {
        order: order,
        items: items,
    };
}

function postToTree(post: modelsPb.Post): PostTree {
    if (post.getParentPost()) {
        const p = post.clone();
        p.clearParentPost();

        const parent = postToTree(post.getParentPost());
        parent.children.order.push(post.getId());
        parent.children.items.set(post.getId(), {
            post: p,
            children: {
                order: [],
                items: new Map(),
            },
        });
        return parent;
    }

    return {
        post: post,
        children: {
            order: [],
            items: new Map(),
        }
    };
}

export default function Post() {
    const router = useRouter();
    const { id } = router.query;

    const [post, setPost]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(null);
    const [children, setChildren]: [PostChildren, Dispatch<SetStateAction<PostChildren>>] = useState({
        order: [],
        items: new Map(),
    });
    const [descendantsToken, setDescendantsToken]: [string, Dispatch<SetStateAction<string>>] = useState("");

    useEffect(() => {
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
            let newChildren: PostChildren = {
                order: [],
                items: new Map(),
            };
            const nodes = new Map();

            for (const post of resp.getPostsList()) {
                const node = postToTree(post);
                nodes.set(post.getId(), node);

                const parentID = post.getParentPostId().getValue();
                if (parentID === id) {
                    // Attach to root.
                    newChildren.order.push(post.getId());
                    newChildren.items.set(post.getId(), node);
                } else if (nodes.has(parentID)) {
                    // Attach to child.
                    const parent = nodes.get(parentID);
                    parent.children.order.push(post.getId());
                    parent.children.items.set(post.getId(), node);
                }
            }

            setChildren(newChildren);
            setDescendantsToken(resp.getDescendantsPageToken());
        });
        return () => call.cancel();
    }, [post]);

    useEffect(() => {
        if (descendantsToken === "") {
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
            let newChildren: PostChildren = {
                order: [],
                items: new Map(),
            };
            for (const post of resp.getPostsList()) {
                const childTree = postToTree(post);
                const items: Map<string, PostTree> = new Map();
                items.set(childTree.post.getId(), childTree);
                newChildren = mergeChildren(newChildren, {
                    order: [childTree.post.getId()],
                    items: items,
                });
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
