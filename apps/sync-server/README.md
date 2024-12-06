# sync-server

## Troubleshooting

To test the Docker build locally, run the following command in your terminal (from the repo root):

```
docker build -f apps/sync-server/Dockerfile . --build-arg SENTRY_AUTH_TOKEN=<xxx>
```

> [!Note]
> Be sure to replace `<xxx>` with the auth token on the Fly instance. You can get this easily like so:

```
cd apps/sync-server
fly ssh console
echo $SENTRY_AUTH_TOKEN
```
