# frozen_string_literal: true

class V2MessageThreadSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :updated_at
  api_field :group, type: :boolean
  api_field :last_message_at, nullable: true
  api_field :members_count, type: :number

  api_association :avatar_urls, blueprint: AvatarUrlsSerializer, nullable: true

  api_field :title do |thread, opts|
    thread.formatted_title(opts[:member])
  end

  api_association :owner, name: :creator, blueprint: V2AuthorSerializer
end
