import Head from 'next/head';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Composer from '../components/Composer';
import { PostChildren } from '../components/Thread';
import Thread from '../components/Thread';
import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../gen/proto/campsite/v1/posts_pb';
import * as topicsPb from '../gen/proto/campsite/v1/topics_pb';
import { postsClient, topicsClient } from '../lib/rpc';

export default function Index() {
    const [pubs, setPubs]: [modelsPb.Publication[], Dispatch<SetStateAction<modelsPb.Publication[]>>] = useState([]);
    const [prevPageToken, setPrevPageToken] = useState("");

    useEffect(() => {
        const req = new topicsPb.GetFeedRequest();
        req.setLimit(10);
        req.setParentDepth(5);
        req.setWait(true);
        req.setPageToken(prevPageToken);

        const call = topicsClient.getFeed(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }, (err, resp) => {
            setPubs([...resp.getPublicationsList(), ...pubs]);
            setPrevPageToken(resp.getPageTokens().getPrev());
        });
        return () => call.cancel();
    }, [prevPageToken]);

    return <div>
        <Head>
            <title>Campsite</title>
        </Head>
        <div>
            <Composer onSubmit={(skel) => {
                const req = new postsPb.CreatePostRequest();
                req.setContent(skel.content);
                const call = postsClient.createPost(req, {
                    authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
                }, (err, resp) => {
                    console.log(resp);
                });
            }} />
            {pubs.map(pub => <Thread tree={{ post: pub.getPost(), children: PostChildren() }} maxChildDepth={0} collapsible={true} onShowMoreChildren={() => { }} key={pub.getPost().getId()}></Thread>)}
        </div>
    </div>;
}
