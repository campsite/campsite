import useSWR from 'swr'

import * as topicsPb from '../gen/proto/campsite/v1/topics_pb';
import { topicsClient } from '../lib/rpc';
import Thread from '../components/Thread';
import { useTranslation } from '../i18n';

export default function Index() {
    const { data, error } = useSWR('self', async () => {
        const req = new topicsPb.GetFeedRequest();
        req.setLimit(10);
        req.setParentDepth(5);
        return (await topicsClient.getFeed(req, {
            authorization: 'Bearer W8CNKPQBSPaFr5kfn-GJxw',
        }));
    });

    const [t, i18n] = useTranslation('thread');

    if (!data) {
        return <div>{t('show-more')}</div>;
    }

    if (error) {
        return <div>ERR: {JSON.stringify(error)}</div>;
    }

    return <div style={{width: '600px', margin: '0 auto'}}>
        {data.getPublicationsList().map(pub => <Thread postPb={pub.getPost()} collapsible={true} key={pub.getPost().getId()}></Thread>)}
    </div>;
}
