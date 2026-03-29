# Convex + WorkOS Checklist

## You Do Not Need From Campsite

Because we only have the repo, we are using the repo itself as the source of truth.

I do not need:

- access to the old production systems
- old provider secrets
- old storage buckets
- old database access

## What You Need To Create

### Convex

Create:

- one Convex project

Later we will need:

- the deployment URL
- a deploy key for production deployment

### WorkOS

Create:

- one WorkOS account
- one AuthKit application

Later we will need:

- client ID
- API key
- allowed callback URLs
- a login endpoint
- allowed local web origins for CORS

## URLs We Will Likely Need

Local:

- `http://localhost:3000`

Vercel:

- your eventual `*.vercel.app` URL first
- your custom domain later if you want one

## What I Can Do Before You Finish WorkOS

I can still:

- finish the editor dependency cleanup
- scaffold the Convex backend structure
- prepare the frontend provider changes
- prepare environment variable templates

## What Will Block The Auth Cutover

These WorkOS values will block sign-in until we have them:

- WorkOS client ID
- WorkOS API key
- redirect URL setup
- login endpoint setup
- CORS setup
