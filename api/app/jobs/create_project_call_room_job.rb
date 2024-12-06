# frozen_string_literal: true

class CreateProjectCallRoomJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(project_id)
    project = Project.eager_load(:member_users).find(project_id)
    project.create_hms_call_room!

    project.member_users.each do |user|
      # Call Pusher directly. PusherTriggerJob skips sending events to the
      # user that triggered the event via socket_id, which we don't want here.
      Pusher.trigger(
        user.channel_name,
        "project-updated",
        {
          id: project.public_id,
          call_room_url: project.call_room_url,
        },
      )
    end
  end
end
