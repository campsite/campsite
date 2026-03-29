# Styled Text Server

Transform text to a usable format in other services like Campsite or Slack.

## Development

Run `script/dev` like normal from the workspace root. If you need to run this service in isolation, from the workspace root run:

```sh
pnpm turbo run dev --filter=@campsite/styled-text-server
```

## Authentication

In production, configure `AUTHTOKEN` and require callers to send it as a bearer token. In local development the token is optional; if `AUTHTOKEN` is unset, the service accepts requests without auth.

```
Authorization: Bearer <token>
```
