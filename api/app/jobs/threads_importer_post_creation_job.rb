# frozen_string_literal: true

class ThreadsImporterPostCreationJob < BaseJob
  sidekiq_options queue: "backfill", retry: 3

  def perform(s3_prefix, organization_slug, s3_key, project_id)
    ThreadsImporter
      .new(s3_prefix: s3_prefix, organization_slug: organization_slug)
      .create_post_from_thread(s3_key: s3_key, project_id: project_id)
  end
end
