# frozen_string_literal: true

class UserNotificationCountsSerializer < ApiSerializer
  api_field :inbox, type: :object, additional_properties: { type: :number } do |user, options|
    preloads(options, :inbox, user.id).value || {}
  end

  api_field :messages, type: :object, additional_properties: { type: :number } do |user, options|
    preloads(options, :messages, user.id).value || {}
  end

  api_field :activity, type: :object, additional_properties: { type: :number } do |user, options|
    preloads(options, :activity, user.id).value || {}
  end

  api_field :home_inbox, type: :object, additional_properties: { type: :number } do |user, options|
    preloads(options, :home_inbox, user.id).value || {}
  end

  def self.preload(users, options)
    users_map = users.index_by(&:id)
    {
      # HACK: User async methods do not support AsyncPreloader yet so we're just calling ActiveRecord async methods for
      # each user. This serializer will only ever be used with one user, so this achieves the same result.
      inbox: users_map.transform_values { |user| user.unread_notifications_counts_by_org_slug_async },
      messages: users_map.transform_values { |user| user.unread_message_counts_by_org_slug_async },
      activity: users_map.transform_values { |user| user.unread_activity_counts_by_org_slug_async },
      home_inbox: users_map.transform_values { |user| user.unread_home_inbox_counts_by_org_slug_async },
    }
  end
end
