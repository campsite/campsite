# frozen_string_literal: true

Aws.config.update({
  region: "us-east-1",
  credentials: Aws::Credentials.new(
    Rails.application.credentials&.dig(:aws, :access_key_id),
    Rails.application.credentials&.dig(:aws, :secret_access_key),
  ),
})

S3_BUCKET = Aws::S3::Resource.new.bucket(Rails.application.credentials&.dig(:aws, :s3_bucket) || "")
