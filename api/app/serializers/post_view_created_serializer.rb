# frozen_string_literal: true

class PostViewCreatedSerializer < ApiSerializer
  api_association :view, blueprint: PostViewSerializer, nullable: true
  api_association :notification_counts, blueprint: UserNotificationCountsSerializer, nullable: true
  api_association :project_unread_status, blueprint: ProjectUnreadStatusSerializer, nullable: true
end
