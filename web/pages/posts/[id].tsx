import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { useRouter } from 'next/router';
import { postsClient } from '../../lib/rpc';

import Thread from '../../components/Thread';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export default function Post() {
    const router = useRouter();
    const { id } = router.query;

    const [post, setPost]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(null);
    const [children, setChildren]: [modelsPb.Post[], Dispatch<SetStateAction<modelsPb.Post[]>>] = useState([]);
    const [prevPageToken, setPrevPageToken] = useState("");

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
    }, []);

    useEffect(() => {
        const req = new postsPb.GetPostChildrenRequest();
        req.setPostId(id as string);
        req.setLimit(10);
        req.setChildDepth(5);
        req.setWait(true);
        req.setPageToken(prevPageToken);
        const call = postsClient.getPostChildren(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setChildren([...resp.getPostsList(), ...children]);
            setPrevPageToken(resp.getPageTokens().getPrev());
        });
        return () => call.cancel();
    }, [prevPageToken]);

    if (!post) {
        return <div>Loading</div>;
    }

    const p = post.clone();
    p.setChildrenList(children);

    return <div style={{ width: '600px', margin: '0 auto' }}>
        <Thread postPb={p}></Thread>
    </div>;
}
