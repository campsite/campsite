import { PostsClient } from '../gen/proto/campsite/v1/PostsServiceClientPb';
import { TopicsClient } from '../gen/proto/campsite/v1/TopicsServiceClientPb';
import { UsersClient } from '../gen/proto/campsite/v1/UsersServiceClientPb';

const host = 'http://localhost:8888'

export const postsClient = new PostsClient(host);
export const usersClient = new UsersClient(host);
export const topicsClient = new TopicsClient(host);

if (process.env.NODE_ENV !== 'production' && process.browser) {
    const enableDevTools = (window as any).__GRPCWEB_DEVTOOLS__ || (() => { });
    enableDevTools([
        postsClient,
        usersClient,
        topicsClient
    ]);
}
