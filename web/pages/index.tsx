import Head from 'next/head';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Card, { CardBody } from '../components/Card';
import Composer from '../components/Composer';
import { PostChildren } from '../components/Thread';
import Thread from '../components/Thread';
import * as modelsPb from '../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../gen/proto/campsite/v1/posts_pb';
import * as usersPb from '../gen/proto/campsite/v1/users_pb';
import { postsClient, usersClient } from '../lib/rpc';

export default function Index() {
    const [pubs, setPubs]: [modelsPb.Publication[], Dispatch<SetStateAction<modelsPb.Publication[]>>] = useState([]);
    const [prevPageToken, setPrevPageToken] = useState("");

    useEffect(() => {
        const req = new usersPb.GetFeedRequest();
        req.setLimit(10);
        req.setParentDepth(5);
        req.setWait(true);
        req.setPageToken(prevPageToken);

        const call = usersClient.getFeed(req, {
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
            <Card>
                <CardBody>
                    <Composer onSubmit={async (skel) => {
                        const req = new postsPb.CreatePostRequest();
                        req.setContent(skel.content);
                        await postsClient.createPost(req, {
                            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
                        });
                    }} />
                </CardBody>
            </Card>
            {pubs.map(pub =>
                <Card key={pub.getPost().getId()}>
                    <CardBody>
                        <Thread
                            tree={{ post: pub.getPost(), children: PostChildren() }}
                            publisher={pub.getPublisher()}
                            topics={pub.getTopicsList()}
                            maxChildDepth={0}
                            collapsible={true}
                            showActions={true}
                            onShowMoreChildren={() => { }} />
                    </CardBody>
                </Card>
            )}
        </div>
    </div>;
}
