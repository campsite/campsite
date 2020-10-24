import * as modelsPb from '../../gen/proto/campsite/v1/models_pb';
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

    useEffect(() => {
        const req = new postsPb.GetPostRequest();
        req.setPostId(id as string);
        req.setParentDepth(5);
        const call = postsClient.getPost(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setRoot(resp.getPost());
        });
        return () => call.cancel();
    }, [id]);

    if (!root) {
        return <div>Loading</div>;
    }

    // Materialize into tree.
    const tree: PostTree = {
        root: root.clone(),
        children: []
    };

    return <div style={{ width: '600px', margin: '0 auto' }}>
        <Thread tree={tree}></Thread>
    </div>;
}
