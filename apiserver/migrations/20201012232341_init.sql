-- +goose Up
-- SQL in this section is executed when the migration is applied.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table channels (
    id uuid primary key default uuid_generate_v1mc()
);

create table users (
    id uuid primary key references channels(id) on delete cascade,
    name text not null
);

create table topics (
    id uuid primary key references channels(id) on delete cascade,
    slug text not null,
    name text not null
);

create unique index on topics(slug);

create table sessions (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    last_active_at timestamptz not null default now(),
    user_id uuid not null references users(id) on delete cascade,
    identifier text not null default '',
    scopes text[] not null default '{}'
);

create table posts (
    id uuid primary key default uuid_generate_v1mc(),

    created_at timestamptz not null default now(),
    edited_at timestamptz,
    deleted_at timestamptz,
    last_active_at timestamptz not null default now(),

    -- If content is null, the post has been deleted.
    content text,
    warning text,
    tags text[] not null default '{}',

    author_user_id uuid references users(id) on delete set null
);

create unique index on posts(created_at asc, id desc);
create unique index on posts(created_at desc, id asc);
create unique index on posts(last_active_at desc, created_at desc, id asc);

create table post_ancestors (
    descendant_post_id uuid not null references posts(id) on delete cascade,
    ancestor_post_id uuid not null references posts(id) on delete cascade,
    distance int not null,
    primary key (descendant_post_id, ancestor_post_id, distance)
);

create unique index on post_ancestors(descendant_post_id, distance);
create index on post_ancestors(ancestor_post_id, distance);

create type media_type as enum (
    'raw',
    'audio',
    'video',
    'image'
);

create table media_items (
    id uuid primary key default uuid_generate_v1mc(),
    created_at timestamptz not null default now(),
    type media_type not null,
    resource_url text not null
);

create table post_media_items (
    post_id uuid not null references posts(id) on delete cascade,
    media_item_id uuid not null references media_items(id) on delete cascade,
    position integer not null,
    primary key (post_id, media_item_id)
);

create table publications (
    post_id uuid not null references posts(id) on delete cascade,
    channel_id uuid not null references channels(id) on delete cascade,
    publisher_user_id uuid references users(id) on delete cascade,
    published_at timestamptz not null default now(),
    primary key (post_id, channel_id, publisher_user_id)
);

create unique index on publications(published_at asc, post_id desc);
create unique index on publications(published_at desc, post_id asc);

create table subscriptions (
    user_id uuid not null references users(id) on delete cascade,
    channel_id uuid not null references channels(id) on delete cascade,
    primary key (user_id, channel_id)
);

create type notification_type as enum (
    'reply'
);

create table notifications (
    id uuid primary key default uuid_generate_v1mc(),
    user_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    type notification_type not null,

    reply_post_id uuid references posts(id) on delete cascade
);

create index on notifications(user_id, created_at desc);

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
drop table notifications;
drop type notification_type;
drop table subscriptions;
drop table publications;
drop table sessions;
drop table post_media_items;
drop table media_items;
drop type media_type;
drop table posts;
drop table posts;
drop table users;
drop table topics;
drop table channels;
