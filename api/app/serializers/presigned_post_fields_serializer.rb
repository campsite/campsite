# frozen_string_literal: true

class PresignedPostFieldsSerializer < ApiSerializer
  api_field :acl, nullable: true
  api_field :content_type
  api_field :expires
  api_field :key
  api_field :policy
  api_field :success_action_status
  api_field :url
  api_field :x_amz_algorithm
  api_field :x_amz_credential
  api_field :x_amz_date
  api_field :x_amz_signature
end
