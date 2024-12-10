# Default Avatars

These avatars must be added to your S3 buckets (both dev and prod). We use Imgix's [mask](https://docs.imgix.com/en-US/apis/rendering/mask-image) and [blend color](https://docs.imgix.com/en-US/apis/rendering/blending/blend-color) APIs to render variable avatar images. These are portable between the app, OpenGraph images, and mailers.

S3 key paths must be prefixed with `static/avatars`. A full path should look like:

```
my-bucket/static/avatars/1.png
```
