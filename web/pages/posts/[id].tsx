import useSWR from "swr";

import * as postsPb from '../../gen/proto/campsite/v1/posts_pb';
import { useRouter } from 'next/router';
import { postsClient } from '../../lib/rpc';

import Thread from '../../components/Thread';

export default function Post() {
    const router = useRouter();
    const { id } = router.query;

    const { data, error } = useSWR('/posts/' + id, async () => {
        const req = new postsPb.GetPostRequest();
        req.setPostId(id as string);
        req.setParentDepth(5);
        return (await postsClient.getPost(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }));
    });

    const { data: childrenData, error: childrenError } = useSWR('/posts/' + id + '/children', async () => {
        const req = new postsPb.GetPostChildrenRequest();
        req.setPostId(id as string);
        req.setLimit(10);
        req.setChildDepth(5);
        return (await postsClient.getPostChildren(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }));
    });

    if (!data) {
        return <div>Loading</div>;
    }

    if (error) {
        return <div>ERR: {JSON.stringify(error)}</div>;
    }

    if (!childrenData) {
        return <div>Loading</div>;
    }

    if (childrenError) {
        return <div>ERR: {JSON.stringify(childrenError)}</div>;
    }

    data.getPost().setChildrenList(childrenData.getPostsList());

    return <div style={{ width: '600px', margin: '0 auto' }}>
        <Thread postPb={data.getPost()}></Thread>
    </div>;
}
