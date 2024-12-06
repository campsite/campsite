# Resources

** Storage **

- https://us-east-1.console.aws.amazon.com/s3/buckets/campsite-hls?region=us-east-1
- https://us-east-1.console.aws.amazon.com/s3/buckets/campsite-hls-dev?region=us-east-1

** CloudFront **

- Distribution: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/E2I92U7H9JPXBO
- Development Distribution: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions/E37OVOWSFNM8QT

- `m3u8` Cache Policy: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/policies/cache/458c188f-8837-498a-b064-4a29b667715a
- `m3u8` Origin Request Policy: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/policies/origin/b83af467-14ca-4ff4-9455-ed7ef2b45036
- `ts` Cache Policy: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/policies/cache/9d7057d9-b64c-4fcb-9ff5-3b5cf0f14d27
- `ts` Origin Request Policy: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/policies/origin/a083ade4-d8f7-4033-bacf-705769efa334

- Origin Access Policy Identify: https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/originAccess

** Lambda **

- Lambda@Edge: https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/on-the-fly-video-convert-LambdaEdgeOtfVideoConvert-jxCI5gmU9N3S?tab=code
- Execution Role: https://us-east-1.console.aws.amazon.com/iamv2/home#/roles/details/on-the-fly-video-convert-LambdaEdgeOtfVideoConvert-1V6Z5QE8UIZPR?section=permissions (note, this must be given access to the destination bucket)

- Helper: https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/on-the-fly-video-convert-HelperFunction-Z27FILXJh3vP?tab=code
- Helper Execution Role: https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/roles/details/on-the-fly-video-convert-HelperFunctionRole-11N1T1HNLNGVF?section=permissions

** MediaConvert **

- Jobs: https://us-east-1.console.aws.amazon.com/mediaconvert/home?region=us-east-1#/jobs/list
