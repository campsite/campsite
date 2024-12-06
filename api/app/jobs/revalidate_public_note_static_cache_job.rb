# frozen_string_literal: true

class RevalidatePublicNoteStaticCacheJob < BaseJob
  sidekiq_options queue: "background"

  def perform(note_id)
    note = Note.find(note_id)

    # this hits a serverless function that will tell Vercel/NextJS to revalidate the cache
    # https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#using-on-demand-revalidation
    conn = Faraday.new(url: Campsite.base_app_url) do |f|
      f.response(:raise_error)
    end
    conn.get(note.revalidate_public_static_cache_path)
  end
end
