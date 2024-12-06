# frozen_string_literal: true

class NotificationReactionSerializer < ApiSerializer
  api_field :content, type: :string, nullable: true
  api_association :custom_content, blueprint: SyncCustomReactionSerializer, nullable: true
end
