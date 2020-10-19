import { PostsClient } from '../gen/proto/campsite/v1/PostsServiceClientPb';
import { UsersClient } from '../gen/proto/campsite/v1/UsersServiceClientPb';
import { TopicsClient } from '../gen/proto/campsite/v1/TopicsServiceClientPb';

const host = 'http://localhost:8888'

export const postsClient = new PostsClient(host);
export const usersClient = new UsersClient(host);
export const topicsClient = new TopicsClient(host);
