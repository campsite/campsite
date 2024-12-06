# AWS Policies

These are the AWS policies necessary to run various services in Campsite.

### campsite-uploader

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

### imgix

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

### **campsite-media-read-upload**

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

### campsite-ecs

These policies run ECS tasks for video transcription. This service may be deleted from the API as it is no longer used.

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

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob"
      ],
      "Resource": [
        "arn:aws:s3:::campsite-hls/*",
        "arn:aws:s3:::campsite-hls",
        "arn:aws:s3:::campsite-hls-dev/*",
        "arn:aws:s3:::campsite-hls-dev",
        "arn:aws:transcribe:*:932625572335:transcription-job/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::campsite-media/*",
        "arn:aws:s3:::campsite-media",
        "arn:aws:s3:::campsite-media-dev/*",
        "arn:aws:s3:::campsite-media-dev"
      ],
      "Effect": "Allow"
    }
  ]
}
```
