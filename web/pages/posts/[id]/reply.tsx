import { StringValue } from "google-protobuf/google/protobuf/wrappers_pb";
import Head from "next/head";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Card, { CardBody } from "../../../components/Card";
import Composer from "../../../components/Composer";
import Thread, { Parents, PostChildren, parentsFlattened } from "../../../components/Thread";
import * as modelsPb from '../../../gen/proto/campsite/v1/models_pb';
import * as postsPb from '../../../gen/proto/campsite/v1/posts_pb';
import { postsClient } from "../../../lib/rpc";

export default function Reply() {
    const router = useRouter();
    const { id } = router.query;

    const [post, setPost]: [modelsPb.Post, Dispatch<SetStateAction<modelsPb.Post>>] = useState(null);

    useEffect(() => {
        if (post !== null && post.getId() === id) {
            return;
        }

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

    if (!post) {
        return <div>Loading</div>;
    }

    const posts = parentsFlattened(post);
    posts.push(post);

    return <div>
        <Head>
            <title>{post.getAuthor().getName()}: {post.getContent().getValue()}</title>
        </Head>

        <Card>
            <CardBody>
                <Parents parents={posts} collapsible={true} showActions={true} />
                <Composer onSubmit={(skel) => {
                    const req = new postsPb.CreatePostRequest();
                    req.setParentPostId((new StringValue()).setValue(post.getId()));
                    req.setContent(skel.content);
                    const call = postsClient.createPost(req, {
                        authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
                    }, (err, resp) => {
                        router.push(`/posts/${resp.getPost().getId()}`);
                    });
                }} />
            </CardBody>
        </Card>
    </div>;
}
