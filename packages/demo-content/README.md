# Campsite demo content

This package contains the content for our demo organization, Frontier Forest.

We use TypeScript to define the content so that associations are clear and maintainable. For example, posts and reactions are assigned to users by their full name.

The TypeScript is compiled into JSON and saved to the API project in `api/lib/demo_orgs/data/*.json`.

## Updating content

```
pnpm -F @campsite/demo-content build
```

Or run the `compile demo content` task in VSCode.
