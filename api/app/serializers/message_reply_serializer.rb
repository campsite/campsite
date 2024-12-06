# frozen_string_literal: true

class MessageReplySerializer < ApiSerializer
  api_field :public_id, name: :id

  api_field :content, default: "" do |message|
    next Message::DELETED_CONTENT if message.discarded?

    message.content
  end

  api_field :has_content?, name: :has_content, type: :boolean

  api_field :sender_display_name do |message|
    message.sender&.display_name || message.integration&.display_name
  end

  api_field :viewer_is_sender, type: :boolean do |message, opts|
    next false unless message.sender_id

    message.sender_id == opts[:member]&.id
  end

  api_association :last_attachment, blueprint: AttachmentSerializer, nullable: true
end
