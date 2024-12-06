# frozen_string_literal: true

class PresignedPostFields
  attr_reader :acl,
    :content_type,
    :expires,
    :key,
    :policy,
    :success_action_status,
    :url,
    :x_amz_algorithm,
    :x_amz_credential,
    :x_amz_date,
    :x_amz_signature

  def self.generate(key:, max_file_size:, mime_type:)
    presigned = S3_BUCKET.presigned_post(
      content_length_range: 0..max_file_size,
      content_type: mime_type,
      expires: Time.current.utc + 3.minutes,
      key: key,
      success_action_status: "201",
    )

    new(
      acl: presigned.fields["acl"],
      content_type: presigned.fields["Content-Type"],
      expires: presigned.fields["Expires"],
      key: presigned.fields["key"],
      policy: presigned.fields["policy"],
      success_action_status: presigned.fields["success_action_status"],
      url: presigned.url,
      x_amz_algorithm: presigned.fields["x-amz-algorithm"],
      x_amz_credential: presigned.fields["x-amz-credential"],
      x_amz_date: presigned.fields["x-amz-date"],
      x_amz_signature: presigned.fields["x-amz-signature"],
    )
  end

  def initialize(params)
    @acl                   = params[:acl]
    @content_type          = params[:content_type]
    @expires               = params[:expires]
    @key                   = params[:key]
    @policy                = params[:policy]
    @success_action_status = params[:success_action_status]
    @url                   = params[:url]
    @x_amz_algorithm       = params[:x_amz_algorithm]
    @x_amz_credential      = params[:x_amz_credential]
    @x_amz_date            = params[:x_amz_date]
    @x_amz_signature       = params[:x_amz_signature]
    @business              = params[:business]
    @concierge             = params[:concierge]
  end

  def api_type_name
    "PresignedPostField"
  end
end
