# API Logs on Axiom

We use Fly log shipper to forward logs to Axiom. View the dashboard here.

## Troubleshooting

Sometimes the log shipper will stop forwarding logs and trigger alerts. To restart the log service:

```sh
fly apps restart campsite-logs
```
