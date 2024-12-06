# frozen_string_literal: true

class NoteViewCreatedSerializer < ApiSerializer
  api_association :views, is_array: true, blueprint: NoteViewSerializer
  api_association :notification_counts, blueprint: UserNotificationCountsSerializer
end
