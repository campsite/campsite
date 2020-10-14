-- +goose Up
-- SQL in this section is executed when the migration is applied.
-- create extension "uuid-ossp";
-- create extension "pgcrypto";

create table users (
    id uuid primary key default uuid_generate_v1mc(),
    name text not null
);

create table posts (
    id uuid primary key default uuid_generate_v1mc(),

    created_at timestamptz not null default now(),

    -- If a post is deleted, all its revisions must also be dropped.
    deleted_at timestamptz,

    author_user_id uuid references users(id) on delete restrict,

    parent_id uuid references posts(id) on delete restrict,
    parent_revision_id uuid,

    latest_revision_id uuid
);

create index on posts(created_at);

create table post_revisions (
    id uuid primary key default uuid_generate_v1mc(),
    created_at timestamptz not null default now(),
    post_id uuid not null references posts(id) on delete cascade,
    warning text,
    content text not null,
    tags text[] not null default '{}'
);

alter table posts add foreign key (latest_revision_id) references post_revisions(id) on delete set null;
alter table posts add foreign key (parent_revision_id) references post_revisions(id) on delete set null;

create index on post_revisions(created_at);

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

create table post_revision_media_items (
    post_revision_id uuid not null references post_revisions(id) on delete cascade,
    media_item_id uuid not null references media_items(id) on delete cascade,
    position integer not null,
    primary key (post_revision_id, media_item_id)
);

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
drop table post_revision_media_items;
drop table media_items;
drop type media_type;
drop table post_revisions cascade;
drop table posts;
drop table users;
