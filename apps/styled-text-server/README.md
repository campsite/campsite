# Styled Text Server

Transform text to a usable format in other services like Campsite or Slack.

## Development

Run `script/dev` like normal from the workspace root. If you need to run this service in isolation, from the workspace root run:

```sh
pnpm turbo run dev --filter=@campsite/styled-text-server
```

## Authentication

This service uses bearer authentication. The consumer must provide the token stored in the API's `AUTHTOKEN` environment variable in an `Authorization` header like this:

```
Authorization: Bearer <token>
```
