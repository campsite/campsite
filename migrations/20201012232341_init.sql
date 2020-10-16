-- +goose Up
-- SQL in this section is executed when the migration is applied.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table topics (
    id uuid primary key default uuid_generate_v1mc()
);

create table users (
    id uuid primary key references topics(id) on delete cascade,
    name text not null,
    private_topic_id uuid not null references topics(id) on delete cascade,
    check (id != private_topic_id)
);

create unique index on users(private_topic_id);

create table posts (
    id uuid primary key default uuid_generate_v1mc(),

    created_at timestamptz not null default now(),
    edited_at timestamptz,
    deleted_at timestamptz,

    -- If content is null, the post has been deleted.
    content text,
    warning text,
    tags text[] not null default '{}',

    author_user_id uuid references users(id) on delete set null,
    parent_post_id uuid references posts(id) on delete set null
);

create index on posts(created_at desc, id);

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

create table sessions (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    last_active_at timestamptz not null default now(),
    user_id uuid not null references users(id) on delete cascade,
    identifier text not null default '',
    scopes text[] not null default '{}'
);

create table publications (
    post_id uuid not null references posts(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    publisher_user_id uuid references users(id) on delete set null,
    published_at timestamptz not null default now(),
    primary key (post_id, topic_id)
);

create index on publications(published_at desc, post_id);

create table subscriptions (
    user_id uuid not null references users(id) on delete cascade,
    topic_id uuid not null references topics(id) on delete cascade,
    primary key (user_id, topic_id)
);

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
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
