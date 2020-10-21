import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { useRouter } from 'next/router';
import { postsClient } from '../../lib/rpc';

import Thread from '../../components/Thread';
import { PostTree } from '../../components/Thread';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export default function Post() {
    const router = useRouter();
    const { id } = router.query;

    const [root, setRoot]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(null);
    const [children, setChildren]: [modelsPb.Post[], Dispatch<SetStateAction<modelsPb.Post[]>>] = useState([]);
    const [descendants, setDescendants]: [modelsPb.Post[], Dispatch<SetStateAction<modelsPb.Post[]>>] = useState([]);
    const [descendantsPrevPageToken, setDescendantsPrevPageToken]: [string, Dispatch<SetStateAction<string>>] = useState('');

    useEffect(() => {
        const req = new postsPb.GetPostRequest();
        req.setPostId(id as string);
        req.setParentDepth(5);
        const call = postsClient.getPost(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setDescendantsPrevPageToken('');
            setChildren([]);
            setRoot(resp.getPost());
        });
        return () => call.cancel();
    }, [id]);

    useEffect(() => {
        const req = new postsPb.GetPostChildrenRequest();
        req.setPostId(id as string);
        req.setLimit(10);
        req.setChildDepth(5);
        const call = postsClient.getPostChildren(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setChildren(resp.getPostsList());
            setDescendantsPrevPageToken(resp.getDescendantsPrevPageToken());
        });
        return () => call.cancel();
    }, [root]);

    useEffect(() => {
        if (descendantsPrevPageToken === '') {
            return;
        }

        const req = new postsPb.GetPostDescendantsRequest();
        req.setPostId(id as string);
        req.setLimit(10);
        req.setPageToken(descendantsPrevPageToken);
        req.setWait(true);
        const call = postsClient.getPostDescendants(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setDescendants([...descendants, ...resp.getPostsList()]);
            setDescendantsPrevPageToken(resp.getPageTokens().getPrev());
        });
        return () => call.cancel();
    }, [descendantsPrevPageToken]);

    if (!root) {
        return <div>Loading</div>;
    }

    // Materialize into tree.
    const tree = {
        root: root.clone(),
        children: []
    };

    const nodes = new Map<string, PostTree>();
    nodes.set(root.getId(), tree);

    for (const child of children) {
        const parentID = child.getParentPostId().getValue();
        if (!nodes.has(parentID)) {
            continue;
        }
        const parent = nodes.get(parentID);
        const childNode = {
            root: child.clone(),
            children: [],
        };
        parent.children.push(childNode);
        nodes.set(child.getId(), childNode);
    }

    for (const descendant of descendants) {
        const parentID = descendant.getParentPostId().getValue();
        if (!nodes.has(parentID)) {
            continue;
        }
        const parent = nodes.get(parentID);
        const childNode = {
            root: descendant.clone(),
            children: [],
        };
        parent.children.unshift(childNode);
        parent.root.setNumChildren(parent.root.getNumChildren() + 1);
        nodes.set(descendant.getId(), childNode);
    }

    return <div style={{ width: '600px', margin: '0 auto' }}>
        <Thread tree={tree}></Thread>
    </div>;
}
