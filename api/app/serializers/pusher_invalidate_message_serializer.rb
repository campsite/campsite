# frozen_string_literal: true

class PusherInvalidateMessageSerializer < ApiSerializer
  api_association :message, blueprint: MessageSerializer
  api_association :message_thread, blueprint: MessageThreadPusherSerializer

  api_field :skip_push, type: :boolean, required: true, default: false
  api_field :push_body, type: :string, required: false, nullable: true
end
