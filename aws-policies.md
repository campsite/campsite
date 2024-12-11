# AWS Policies

These are the AWS policies necessary to run various services in Campsite.

### Uploader

Use this policy for uploading media to S3. Change the buckets as necessary.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::campsite-media-dev/*", "arn:aws:s3:::campsite-media/*"]
    },
    {
      "Sid": "VisualEditor1",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": ["arn:aws:s3:::campsite-media", "arn:aws:s3:::campsite-media-dev"]
    }
  ]
}
```

### Imgix

This policy is used by Imgix. Change the buckets as necessary.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": [
        "arn:aws:s3:::campsite-media",
        "arn:aws:s3:::campsite-media-dev",
        "arn:aws:s3:::campsite-media/*",
        "arn:aws:s3:::campsite-media-dev/*"
      ]
    }
  ]
}
```

### 100ms uploader

Use this policy for a 100ms user to read & upload media to your buckets. Change the buckets as necessary.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::campsite-media/*", "arn:aws:s3:::campsite-media-dev/*"]
    }
  ]
}
```

### ECS

These policies run ECS tasks for data exports.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["iam:PassRole", "ecs:RunTask"],
      "Resource": ["arn:aws:iam::932625572335:role/*", "arn:aws:ecs:*:932625572335:task-definition/*:*"]
    }
  ]
}
```
