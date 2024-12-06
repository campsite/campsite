# frozen_string_literal: true

class OauthApplicationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :redirect_uri, nullable: true
  api_field :avatar_path, nullable: true
  api_field :avatar_url
  api_field :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :uid, name: :client_id
  api_field :last_copied_secret_at, nullable: true
  api_field :plaintext_secret, name: :client_secret, nullable: true do |object, options|
    object.plaintext_secret || options[:plaintext_secret]
  end
  api_field :mentionable?, name: :mentionable, type: :boolean
  api_field :direct_messageable?, name: :direct_messageable, type: :boolean
  api_association :kept_webhooks, name: :webhooks, blueprint: WebhookSerializer, is_array: true
end
