# frozen_string_literal: true

module Backfills
  class ChatChannelBackfill
    def self.run(dry_run: true, organization_slug: nil)
      message_threads = MessageThread.where.missing(:project).where.not(title: [nil, ""]).where("title REGEXP ?", "[^[:space:]]")

      if organization_slug
        organization = Organization.find_by!(slug: organization_slug)
        message_threads = message_threads.where(owner: [organization.memberships, organization.oauth_applications])
      end

      message_threads.find_each do |message_thread|
        CreateProjectFromMessageThreadJob.perform_async(message_thread.id) unless dry_run
      end

      count = message_threads.size
      "#{dry_run ? "Would have enqueued" : "Enqueued"} #{count} CreateProjectFromMessageThreadJob #{"job".pluralize(count)}"
    end
  end
end
